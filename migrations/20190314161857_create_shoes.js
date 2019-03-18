
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('shoes', table => {
          table.increments('id').primary()
          table.string('model')
          table.float('size')
          table.string('url')
          table.string('source')
          table.string('title')
          table.float('price')
          table.string('photo')
          table.datetime('created_at')
        })
      ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('shoes')
      ])
};
