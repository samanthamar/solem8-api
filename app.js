const express = require('express'); 
const app = express();
const router = require('./routes/routes');

// List routes here
app.use('/', router);
app.use('/craigslist', router); 
app.use('/shoes', router); 
app.use('/supportedShoes', router); 

module.exports = app;
