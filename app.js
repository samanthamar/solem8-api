const express = require('express'); 
const app = express();
const router = require('./routes/routes');
const bodyParser = require('body-parser');
/*
  List endpoints here
*/
// support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json()); // Parse JSON for post requests
app.use('/', router);
app.use('/craigslist', router); 
app.use('/shoes', router); 
app.use('/supportedShoes', router); 
app.use('/register', router);
app.use('/findUser', router);
app.use('/login', router);
app.use('/watchlist', router);
app.use('/watchlist/add', router);
// app.use('/watchlist/delete', router);

module.exports = app;
