const express = require('express');
const rp = require('request-promise');
const $ = require('cheerio');
const app = express();
const craigslistParse = require('./craigslistParse');

// OMG THIS ONE IS WORKING
app.get('/craigslist', function(req, res) {
  // Define url
  let model = req.query.model.toLowerCase();
  let size = req.query.size.toLowerCase();
  craigslistUrl = 'https://toronto.craigslist.org/search/sss?query='+model+'+'+size+'&sort=rel'

  // request promise
  rp(craigslistUrl)
    .catch(function(err){
      // handle error
      var json = {
        error: 'Could not handle request'
      } 
      console.log(err)
      res.send(json)
    })
    // gets the html
    .then(function(html){
      // Get num of results on first page
      var firstPageResults = parseInt($('.rangeTo', html).first().text());
      console.log(firstPageResults)
      // Store links to each post here
      const listings =[]; 
      // Get list of urls of postings from the first page only
      // TODO: extend to all pages
      for (let i =0; i < firstPageResults; i++) {
          // get the link and store each in list
          listings.push($('p > a', html)[i].attribs.href); 
      }
      // Retrieve all shoe info from each listing 
      return Promise.all(
          listings.map(function(url){
              return craigslistParse(url)
          })
      );
  })
  // when the promise is returned, return a json of results 
  // with shoe info
  .then(function(results) {
      var json = {
        status: 'OK', 
        results: results 
      }
      res.send(json)
  });
});

// Define what port to listen on
app.listen(process.env.PORT || 5000);
module.exports = app;
