const { isMainThread } = require("worker_threads");
const db = require("../db/dbConfig");
const Users = require("./usersModel");
const Payers = require("../payers/payersModel");

//sample payers to be used in the tests
function getPayers() {
  const payer1 = {
    payer: "DANNON",
  };
  const payer2 = {
    payer: "UNILEVER",
  };
  const payer3 = {
    payer: "MILLER COORS",
  };

  return [payer1, payer2, payer3];
}

//the expected output from the databse for payers
function expectedPayersOutput() {
  const payer1 = {
    payer_id: 1,
    payer: "DANNON",
  };
  const payer2 = {
    payer_id: 2,
    payer: "UNILEVER",
  };
  const payer3 = {
    payer_id: 3,
    payer: "MILLER COORS",
  };

  return [payer1, payer2, payer3];
}

//adds payers to the database
async function addPayers() {
  let payers = getPayers();
  let expectedPayers = expectedPayersOutput();

  for (let i = 0; i < payers.length; i++) {
    await db("payers").insert(payers[i]);
  }

  //Check that the payers were added correctly
  let dbPayers = await db("payers");
  expect(dbPayers).toHaveLength(3);
  expect(dbPayers).toEqual(expectedPayers);
}

//sample transactions
function getTransactions() {
  const transaction1 = {
    payer: "DANNON",
    payer_id: 1,
    points: 1000,
    timestamp: "2020-11-02T14:00:00Z",
  };
  const transaction2 = {
    payer: "UNILEVER",
    payer_id: 2,
    points: 200,
    timestamp: "2020-10-31T11:00:00Z",
  };
  const transaction3 = {
    payer: "DANNON",
    payer_id: 1,
    points: -200,
    timestamp: "2020-10-31T15:00:00Z",
  };
  const transaction4 = {
    payer: "MILLER COORS",
    payer_id: 3,
    points: 10000,
    timestamp: "2020-11-01T14:00:00Z",
  };
  const transaction5 = {
    payer: "DANNON",
    payer_id: 1,
    points: 300,
    timestamp: "2020-10-31T10:00:00Z",
  };
  return [transaction1, transaction2, transaction3, transaction4, transaction5];
}

//adds transactions to the database
async function addTransactions() {
  const transactions = getTransactions();

  for (let i = 0; i < transactions.length; i++) {
    await Payers.addTransaction(transactions[i], 1, transactions[i].payer_id);
  }

  const transaction = await db("user_points");

  expect(transaction).toHaveLength(5);
}

describe("usersModel", () => {
  beforeEach(async () => {
    //db is the knex initialized object using db.raw to truncate postgres tables with foreign keys
    //can use knex.raw but it is global and deprecated
    await db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
    await db.raw("TRUNCATE TABLE payers RESTART IDENTITY CASCADE");
    await db.raw("TRUNCATE TABLE user_points RESTART IDENTITY CASCADE");

    await db("users").insert({
      user_id: 1,
      username: "user1",
      password: "pass",
    });

    await addPayers();
  });

  describe("getPoints(userid)", () => {
    it("gets points when the user has no points in the databse", async () => {
      const users = await db("users");
      expect(users).toHaveLength(1);
      const payers = await db("payers");
      expect(payers).toHaveLength(3);

      const points = await Users.getPoints(1);

      expect(points).toHaveLength(1);
      expect(points).toEqual([{ sum: null }]);
    });

    it("gets points when the user has points in the database", async () => {
      const users = await db("users");
      expect(users).toHaveLength(1);
      const payers = await db("payers");
      expect(payers).toHaveLength(3);

      await addTransactions();

      const transactions = await db("user_points");
      expect(transactions).toHaveLength(5);

      const points = await Users.getPoints(1);
      expect(points).toHaveLength(1);
      expect(points).toEqual([{ sum: "11300" }]);
    });
  });

  describe("updatePoints(userid, payerid, points)", () => {
    it("returns 0 when trying to update points with an empty user points table", async () => {
      const users = await db("users");
      expect(users).toHaveLength(1);
      const payers = await db("payers");
      expect(payers).toHaveLength(3);

      const points = await Users.updatePoints(1, 1, 0);
      expect(points).toBe(0);
    });

    it("updates the points for a specific userid and payerid", async () => {
      const users = await db("users");
      expect(users).toHaveLength(1);
      const payers = await db("payers");
      expect(payers).toHaveLength(3);

      await addTransactions();
      const trans = await db("user_points");
      expect(trans).toHaveLength(5);

      const count = await Users.updatePoints(1, 1, 100);
      expect(count).toBe(3);

      const points = await Users.getPoints(1);
      expect(points).toEqual([{ sum: "10500" }]);
    });
  });

  describe("getDetailedPoints(userid)", () => {
    it("gets an empty list when user has no points", async () => {
      const users = await db("users");
      expect(users).toHaveLength(1);
      const payers = await db("payers");
      expect(payers).toHaveLength(3);

      const pointList = await Users.getDetailedPoints(1);
      expect(pointList).toHaveLength(0);
      expect(pointList).toEqual([]);
    });

    it("gets the list of payers and points associated with them", async () => {
      const users = await db("users");
      expect(users).toHaveLength(1);
      const payers = await db("payers");
      expect(payers).toHaveLength(3);
      await addTransactions();
      const trans = await db("user_points");
      expect(trans).toHaveLength(5);

      const expected = [
        { payer: "UNILEVER", points: "200" },
        { payer: "MILLER COORS", points: "10000" },
        { payer: "DANNON", points: "1100" },
      ];

      const pointList = await Users.getDetailedPoints(1);
      expect(pointList).toHaveLength(3);
      expect(pointList).toEqual(expected);
    });
  });
});
