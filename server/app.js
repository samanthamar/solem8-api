const express = require('express'); 
const rp = require('request-promise');
const $ = require('cheerio');
const app = express();
const db = require('./../db');
const Craigslist = require('./../crawlers/Craigslist');

// The endpoints go here
app.get('/craigslist', (req, res) => {
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

      // Put me somewhere else
      const urls =  (numOfResults, searchParams) => {
        // Limited to Toronto
        let baseUrl = 'https://toronto.craigslist.org/search/sss?query='
        let pageUrls = []; 
        // Craigslist lists a max of 120 posts/page
        if (numOfResults < 120){
            pageUrls.push(baseUrl+searchParams+'&sort=rel'+'&searchNearby=1')
        } else {
            let numPagesToCrawl = Math.floor(numOfResults/120);
            console.log("Pages to crawl: " + numPagesToCrawl)
            for (let i=0; i<=numPagesToCrawl; i++){
            if (i==0) {
                pageUrls.push(baseUrl+searchParams+'&sort=rel'+'&searchNearby=1')
            } else if (i==1){
                pageUrls.push(baseUrl+searchParams+'&s='+(i*120).toString()+'&sort=rel'+'&searchNearby=1')
            }
          }
        }
        return pageUrls;
      }
      // Get list of all urls to visit
      let resultsUrls = urls(numTotalResults, searchParams)
      return resultsUrls; 
  }) 
  .then((urls) => {
      // From each result page, get the urls to each post
      let promiseCount = 0; 
      return Promise.all(
        urls.map((url) => {
          let cl = new Craigslist(url); 
          promiseCount++;
          console.log("-----------------------------------Promise.all count: " + promiseCount);
          console.log(url)
          return cl.crawl()
        })
      )
  })
  .then((results) => {
      let cl = new Craigslist();
      var json = {
        status: 'OK', 
        shoeUrls: results
      }
      cl.insert(db, results)
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
