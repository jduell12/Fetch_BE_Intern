exports.seed = function (knex) {
  return knex("payers").insert([
    {
      payer_id: 1,
      payer: "DANNON",
    },
    {
      payer_id: 2,
      payer: "UNILEVER",
    },
    {
      payer_id: 3,
      payer: "MILLER COORS",
    },
  ]);
};
