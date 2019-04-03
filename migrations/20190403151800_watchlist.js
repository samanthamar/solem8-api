
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('watchlist', table => {
            table.increments('id').primary(),
            table.string('username'),
            table.string('model'),
            table.float('size'),
            table.float('priceMin'),
            table.float('priceMax')
        })
    ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('watchlist')
    ])
};
