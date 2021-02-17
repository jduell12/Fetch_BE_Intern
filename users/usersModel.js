const db = require("../db/dbConfig");

module.exports = {
  getPoints,
  updatePoints,
  getDetailedPoints,
};

async function getPoints(userid) {
  let sum = await db("user_points")
    .sum("points as points")
    .where({ user_id: userid });
  if (sum[0].points === null) {
    return sum;
  }

  sum[0].points = parseInt(sum[0].points);
  return sum;
}

function updatePoints(userid, payerid, points) {
  return db("user_points")
    .where({ user_id: userid, payer_id: payerid })
    .update({ points })
    .then((count) => {
      return count;
    });
}

function getDetailedPoints(userid) {
  return db("user_points as up")
    .join("payers as p", "p.payer_id", "up.payer_id")
    .where({ "up.user_id": userid })
    .select("p.payer")
    .sum("up.points as points")
    .groupBy("p.payer_id");
}
