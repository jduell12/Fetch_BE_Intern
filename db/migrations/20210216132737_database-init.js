exports.up = function (knex) {
  return knex.schema
    .createTable("users", (tbl) => {
      tbl.increments("user_id");
      tbl.string("username", 256).notNullable().unique();
      tbl.string("password", 256).notNullable();
    })
    .createTable("payers", (tbl) => {
      tbl.increments("payer_id");
      tbl.string("payer").notNullable().unique();
    })
    .createTable("user_points", (tbl) => {
      tbl.increments("user_points_id");
      tbl
        .integer("user_id")
        .unsigned()
        .references("users.user_id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      tbl
        .integer("payer_id")
        .unsigned()
        .references("payers.payer_id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      tbl.integer("points").notNullable();
      tbl.datetime("timestamp").notNullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("users")
    .dropTableIfExists("payers")
    .dropTableIfExists("user_points");
};
