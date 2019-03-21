const express = require('express'); 
const app = express();
const environment = process.env.NODE_ENV || 'development';
const { port } = require('./config/config')[environment].server;
const router = require('./routes/routes');

// List routes here
app.use('/', router);
app.use('/craigslist', router); 
app.use('/shoes', router); 

// Define what port to listen on
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
module.exports = app;
