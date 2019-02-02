const express = require('express'); 
const rp = require('request-promise');
const $ = require('cheerio');
const app = express();
// const craigslistParse = require('./craigslistParse');
const Craigslist = require('./Craigslist.js');
const cl = new Craigslist(); 

app.get('/craigslist', function(req, res) {
  let model = req.query.model.toLowerCase();
  let size = req.query.size.toLowerCase();

  // TODO: 
  // Define location somewhere
  // let location = req.query.location.toLowerCase(); 
  let searchParams = model+"+"+"size"+"+"+size // ie.Yeezy+desert+size+9
  craigslistUrl = 'https://toronto.craigslist.org/search/sss?query='+searchParams+'&sort=rel'+'&searchNearby=1'
  // request promise
  rp(craigslistUrl)
    // gets the html
    .then((html) => {
      // Get total num of results
      let numTotalResults = parseInt($('.totalcount', html).first().text());
      // Debugging
      console.log("Num of results:" + numTotalResults)
      // Get list of all urls to visit
      let resultsUrls = cl.urls(numTotalResults, searchParams)
      return resultsUrls; 
  }) 
  .then((urls) => {
      // From each result page, get the urls to each post
      let promiseCount = 0; 
      return Promise.all(
        urls.map((url) => {
          promiseCount++;
          console.log("-----------------------------------Promise.all count: " + promiseCount);
          console.log(url)
          return cl.craigslistParse(url)
        })
      )
  })
  .then((results) => {
      var json = {
        status: 'OK', 
        shoeUrls: results 
      }
      res.send(json);
      console.log('success')
  })
  .catch((error) => {
    // handle this error
    console.log(error)
  })
});

// Define what port to listen on
app.listen(process.env.PORT || 5000);
module.exports = app;
