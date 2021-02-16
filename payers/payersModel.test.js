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
      let payers = getPayers();
      let expectedPayers = expectedPayersOutput();

      for (let i = 0; i < payers.length; i++) {
        await db("payers").insert(payers[i]);
      }

      //Check that the payers were added correctly
      let dbPayers = await db("payers");
      expect(dbPayers).toHaveLength(3);
      expect(dbPayers).toEqual(expectedPayers);

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
      let payers = getPayers();
      let expectedPayers = expectedPayersOutput();

      for (let i = 0; i < payers.length; i++) {
        await db("payers").insert(payers[i]);
      }

      //Check that the payers were added correctly
      let dbPayers = await db("payers");
      expect(dbPayers).toHaveLength(3);
      expect(dbPayers).toEqual(expectedPayers);

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
});
