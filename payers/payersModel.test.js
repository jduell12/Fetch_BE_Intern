const { get } = require("https");
const { isMainThread } = require("worker_threads");
const db = require("../db/dbConfig");
const Payers = require("./payersModel");

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

//sample transactions to be used in the tests
function getTransactions() {
  const transaction1 = {
    payer: "DANNON",
    points: 1000,
    timestamp: "2020-11-02T14:00:00Z",
  };
  const transaction2 = {
    payer: "UNILEVER",
    points: 200,
    timestamp: "2020-10-31T11:00:00Z",
  };
  const transaction3 = {
    payer: "DANNON",
    points: -200,
    timestamp: "2020-10-31T15:00:00Z",
  };
  const transaction4 = {
    payer: "MILLER COORS",
    points: 10000,
    timestamp: "2020-11-01T14:00:00Z",
  };
  const transaction5 = {
    payer: "DANNON",
    points: 300,
    timestamp: "2020-10-31T10:00:00Z",
  };
  return [transaction1, transaction2, transaction3, transaction4, transaction5];
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

describe("payersModel", () => {
  //wipes all tables in database clean so each test starts with empty tables
  beforeEach(async () => {
    //db is the knex initialized object using db.raw to truncate postgres tables with foreign keys
    //can use knex.raw but it is global and deprecated
    await db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
    await db.raw("TRUNCATE TABLE payers RESTART IDENTITY CASCADE");
    await db.raw("TRUNCATE TABLE user_points RESTART IDENTITY CASCADE");
  });

  describe("getPayers()", () => {
    it("gets an empty array of payers from an empty db", async () => {
      const payers = await Payers.getPayers();
      expect(payers).toHaveLength(0);
    });

    it("gets an array of payers from a non-empty db", async () => {
      const payers = getPayers();
      await db("payers").insert(payers[0]);
      await db("payers").insert(payers[1]);
      await db("payers").insert(payers[2]);

      const expectedPayers = expectedPayersOutput();

      const dbPayers = await Payers.getPayers();

      expect(dbPayers).toHaveLength(3);
      expect(dbPayers).toEqual(expectedPayers);
    });
  });

  describe("addPayers()", () => {
    it("adds a payer to an empty db", async () => {
      let payers = getPayers();
      let expectedPayers = expectedPayersOutput();

      await Payers.addPayer(payers[0]);

      const dbPayers = await db("payers");

      expect(dbPayers).toHaveLength(1);
      expect(dbPayers).toEqual([expectedPayers[0]]);
    });

    it("adds a payer to a non-empty db", async () => {
      let payers = getPayers();
      let expectedPayers = expectedPayersOutput();

      await db("payers").insert(payers[0]);
      await db("payers").insert(payers[1]);

      await Payers.addPayer(payers[2]);

      const dbPayers = await db("payers");

      expect(dbPayers).toHaveLength(3);
      expect(dbPayers).toEqual[expectedPayers];
    });
  });

  describe("getPayerBy(filterName, filterValue)", () => {
    it("gets a list of payers in a populated database by their payer_id", async () => {
      await addPayers();
      const dbPayers = await db("payers");

      let payer1 = await Payers.getPayerBy("payer_id", 1);
      expect(payer1).toHaveLength(1);
      expect(payer1).toEqual([dbPayers[0]]);

      let payer2 = await Payers.getPayerBy("payer_id", 2);
      expect(payer2).toHaveLength(1);
      expect(payer2).toEqual([dbPayers[1]]);

      let payer3 = await Payers.getPayerBy("payer_id", 3);
      expect(payer3).toHaveLength(1);
      expect(payer3).toEqual([dbPayers[2]]);
    });

    it("gets a list of payers in a populated database by their payer name", async () => {
      await addPayers();
      const dbPayers = await db("payers");

      let payer1 = await Payers.getPayerBy("payer", "DANNON");
      expect(payer1).toHaveLength(1);
      expect(payer1).toEqual([dbPayers[0]]);

      let payer2 = await Payers.getPayerBy("payer", "UNILEVER");
      expect(payer2).toHaveLength(1);
      expect(payer2).toEqual([dbPayers[1]]);

      let payer3 = await Payers.getPayerBy("payer", "MILLER COORS");
      expect(payer3).toHaveLength(1);
      expect(payer3).toEqual([dbPayers[2]]);
    });
  });

  describe("addTransaction(transaction, userid, payerid)", () => {
    it("adds a transaction to an empty user_points table", async () => {
      await addPayers();
      await db("users").insert({
        user_id: 1,
        username: "user1",
        password: "pass",
      });

      const transactions = getTransactions();

      const transaction = await Payers.addTransaction(transactions[0], 1, 1);
      expect(transaction).toHaveLength(1);
      expect(transaction).toEqual([1]);
    });

    it("adds a transaction to a non-empty user points table", async () => {
      await addPayers();
      await db("users").insert({
        user_id: 1,
        username: "user1",
        password: "pass",
      });

      const transactions = getTransactions();
      await Payers.addTransaction(transactions[0], 1, 1);
      await Payers.addTransaction(transactions[0], 1, 2);

      const transaction = await Payers.addTransaction(transactions[0], 1, 3);
      expect(transaction).toHaveLength(1);
      expect(transaction).toEqual([3]);
    });
  });
});
