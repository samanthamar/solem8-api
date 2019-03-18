const express = require('express'); 
const app = express();
const router = require('./routes/routes');
const environment = process.env.NODE_ENV || 'development'
const { port } = require('./config/config')[environment].server;

// List routes here
app.use('/', router);
app.use('/craigslist', router); 
app.use('/shoes', router); 

// Define what port to listen on
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
module.exports = app;
