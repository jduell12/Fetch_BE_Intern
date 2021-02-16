const db = require("../db/dbConfig");

module.exports = {
  addPayer,
  getPayers,
  getPayerBy,
};

function addPayer(payer) {
  return db("payers").insert(payer, "payer_id");
}

function getPayers() {
  return db("payers");
}

function getPayerBy(filterName, filterValue) {
  switch (filterName) {
    case "payer_id":
      return db("payers").where({ payer_id: filterValue });
    case "payer":
      return db("payers").where({ payer: filterValue });
    default:
      return false;
  }
}
