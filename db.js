const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'solem8_server',
    password: 'syde2020',
    database: 'solem8'
  });

// Connect to DB
connection.connect((err) => {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
});

module.exports = connection;
