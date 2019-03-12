const app = require('./app');
require('./cron/crawl');

app.listen(3000, () => {
    console.log('App listening on port 3000');
});

scheduledCrawl();