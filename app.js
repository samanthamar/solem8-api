const express = require('express'); 
const rp = require('request-promise');
const $ = require('cheerio');
const app = express();
const craigslistParse = require('./craigslistParse');
const getHtml = require('./getHtml'); 

app.get('/craigslist', function(req, res) {
  let model = req.query.model.toLowerCase();
  let size = req.query.size.toLowerCase();
  let searchParams = model+"+"+"size"+"+"+size // ie.Yeezy+desert+size+9
  // TODO: 
  // Define location somewhere
  craigslistUrl = 'https://toronto.craigslist.org/search/sss?query='+searchParams+'&sort=rel'
  // request promise
  rp(craigslistUrl)
    // gets the html
    .then((html) => {
      // TODO: use this to extend to multiple pages
      // Get total num of result on first page 
      let numFirstPageResults = parseInt($('.rangeTo', html).first().text());
      // Get total num of results
      let numTotalResults = parseInt($('.totalcount', html).first().text());
      // Get total num of pages to crawl
      let numPagesToCrawl = 0
      if (numTotalResults > 120) {
        // Craigslist displays 120 ads/page
        numPagesToCrawl = Math.floor(numTotalResults/120)
      }
      console.log(numFirstPageResults)
      // Store links to each post here
      let listings =[]; 
      // Get list of urls of postings from the first page only
      // TODO: extend to all pages
      for (let i =0; i < numFirstPageResults; i++) {
          // get the link and store each in list
          listings.push($('p > a', html)[i].attribs.href); 
      }
      // Retrieve all shoe info promises from each listing 
      return Promise.all(
          listings.map(function(url){
              return craigslistParse(url)
          })
      );
  })
  // when the promise is returned, return a json of results 
  // with shoe info
  .then((results) => {
      var json = {
        status: 'OK', 
        shoes: results 
      }
      console.log(JSON.stringify(json, null, "2")); 
      res.send(json);
  })
  .catch((error) => {
    // handle this error
    console.log(error)
  })
});

const searchParams = (searchTerms) => {
  let searchParam = ""
  let numOfTerms = searchTerms.length 

  for (let i=0; i<numOfTerms; i++) {
    if (i != numOfTerms - 1) {
      searchParam += searchTerm[i] + "+"
    } else {
      searchParam += searchTerm[i]
    }
  }

  return searchParams

};

// Define what port to listen on
app.listen(process.env.PORT || 5000);
module.exports = app;
