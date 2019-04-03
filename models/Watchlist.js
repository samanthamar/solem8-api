const connection = require('../knexConnection'); 
const { Model } = require('objection')

Model.knex(connection)

class Watchlist extends Model {
  static get tableName () {
    return 'watchlist';
  }

  static get jsonSchema () {
    return {
      type: 'object',
      properties: {
        id: {type: 'integer'},
        username: {type: 'string'},
        model: {type: 'string'},
        size: {type: 'float'},
        priceMin: {type: 'float'},
        priceMax: {type: 'float'},
      }
    };
  }
}

module.exports = Watchlist; 