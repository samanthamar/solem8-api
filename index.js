const app = require('./app');
const environment = process.env.NODE_ENV || 'development';
const { port } = require('./config/config')[environment].server;
require('./cron/crawl');
require('console-stamp')(console, '[HH:MM:ss.l]');

// Define what port to listen on
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});


// scheduledCrawl();