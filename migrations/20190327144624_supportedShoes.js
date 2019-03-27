
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('supportedShoes', table => {
        table.increments('id').primary(),
        table.string('model'),
        table.timestamps(true, true)
    })
  ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('supportedShoes')
    ])
};
