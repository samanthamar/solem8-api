const dotenv = require('dotenv');
// Setup the configurations to be used by the app
dotenv.config({ path: './config/.env' });
module.exports = {
    port: process.env.PORT,
    mysql_host: process.env.MYSQL_HOST_LOCAL,
    mysql_user: process.env.MYSQL_USER,
    mysql_password: process.env.MYSQL_PASSWORD,
    mysql_db: process.env.MYSQL_DB
};
