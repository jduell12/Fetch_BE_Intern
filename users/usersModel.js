const db = require("../db/dbConfig");

module.exports = {
  getPoints,
  spendPoints,
};

function getPoints(userid) {
  return db("user_points").where({ user_id: userid });
}
