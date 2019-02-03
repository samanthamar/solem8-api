const express = require('express'); 
const app = express();
const router = require('./routes/routes');

// List routes here
app.use('/', router);
app.use('/craigslist', router); 

// Define what port to listen on
app.listen(3000, () => {
  console.log('App listening on port 3000');
});
module.exports = app;
