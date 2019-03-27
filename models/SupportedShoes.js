const connection = require('../knexConnection'); 
const { Model } = require('objection')

Model.knex(connection)

class SupportedShoes extends Model {
  static get tableName () {
    return 'supportedShoes';
  }

  static get jsonSchema () {
    return {
      type: 'object',
      properties: {
        id: {type: 'integer'},
        model: {type: 'string'},
      }
    };
  }
}

module.exports = SupportedShoes; 