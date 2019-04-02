const express = require('express'); 
const app = express();
const router = require('./routes/routes');

/*
  List endpoints here
*/
app.use(express.json()); // Parse JSON for post requests
app.use('/', router);
app.use('/craigslist', router); 
app.use('/shoes', router); 
app.use('/supportedShoes', router); 
app.use('/watchlist', router);
app.use('/watchlist/add', router);
// app.use('/watchlist/delete', router);

module.exports = app;
