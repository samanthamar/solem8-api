// Update with your knex config settings.
const dotenv = require('dotenv');
// Setup the configurations to be used by the app
dotenv.config({ path: './config/.env' });

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      database: process.env.DB_NAME,
      host: process.env.DEV_MYSQL_HOST,
      user: process.env.DEV_MYSQL_USER,
      password: process.env.DEV_MYSQL_PASSWORD
    },
    migrations: {
      directory: __dirname + '/migrations',
    }
  },

  production: {
    client: 'mysql',
    connection: {
      database: process.env.DB_NAME,
      host: process.env.DEV_MYSQL_HOST,
      user: process.env.DEV_MYSQL_USER,
      password: process.env.DEV_MYSQL_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
