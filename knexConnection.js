const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const connection = require('./knexfile.js')[environment];

module.exports = Knex(connection);

// const mysql = require('mysql');
// const { mysql_host, mysql_user, mysql_password, mysql_db, mysql_port } = require('./config/config');

// // Setup connection
// const connection = mysql.createConnection({
//     host: mysql_host,
//     user: mysql_user,
//     password: mysql_password,
//     db_port: mysql_port,
//     database: mysql_db
//   });

// // Connect to DB
// connection.connect((err) => {
//     if (err) {
//         return console.error('error: ' + err.stack);
//     }
//     console.log('Connected to the MySQL server.');
// });

// module.exports = connection;
