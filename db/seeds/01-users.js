exports.seed = function (knex) {
  return knex("users").insert([
    { user_id: 1, username: "user1", password: "pass" },
  ]);
};
