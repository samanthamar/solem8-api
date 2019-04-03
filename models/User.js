const connection = require('../knexConnection'); 
const { Model } = require('objection')

Model.knex(connection)

class User extends Model {
  static get tableName () {
    return 'users';
  }

  static get jsonSchema () {
    return {
      type: 'object',
      properties: {
        id: {type: 'integer'},
        username: {type: 'string'},
        password: {type: 'string'},
        email: {type: 'string'}
      }
    };
  }
}

module.exports = User; 