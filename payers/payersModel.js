const db = require("../db/dbConfig");

module.exports = {
  addPayer,
  getPayers,
  getPayerBy,
  addTransaction,
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

function addTransaction(transaction, userid, payerid) {
  if (transaction.points && transaction.timestamp) {
    return db("user_points").insert(
      {
        user_id: userid,
        payer_id: payerid,
        points: transaction.points,
        timestamp: transaction.timestamp,
      },
      "user_points_id",
    );
  } else {
    return false;
  }
}
