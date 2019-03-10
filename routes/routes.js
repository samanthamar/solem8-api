const router = require('express').Router();
const rp = require('request-promise');
const $ = require('cheerio');
const db = require('./../db');
const Craigslist = require('./../crawlers/Craigslist');
const BaseShoe = require('./../models/BaseShoe');
const puppeteer = require('puppeteer');

// THIS FILE CONTAINS ALL THE ENDPOINT LOGIC 
// base route to handle '/'
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Your backend is working!' });
});

// Return all shoes from DB 
// TODO: add filtering when getting shoes from DB
router.get('/shoes', (req, res) => {
    let q = "SELECT * FROM shoes"
    db.query(q, (err, result) => {
        if (err) throw err; 
        console.log('Successfully retrieved records');
        res.send({
            shoes: result
        });
    });
});

router.get('/craigslist2', (req, res) => {

  // Create the baseurl
  let baseShoe = new BaseShoe(req.query.model.toLowerCase(),
  req.query.size.toLowerCase())
  let searchParams = baseShoe.model+"+"+"size"+"+"+baseShoe.size // ie.Yeezy+desert+size+9
  // Limited to Toronto
  craigslistUrl = 'https://toronto.craigslist.org/search/sss?query='+searchParams+'&sort=rel'+'&searchNearby=1'

  // This is the browser for this request
  let cBrowser; 
  puppeteer
    .launch()
    .then((browser) => {
      cBrowser = browser; 
    })
    .then(() => {
      return cBrowser.newPage();
    })
    .then((page) => {
      // Create new Craigslist crawler object 
      cl = new Craigslist(craigslistUrl, page, searchParams, baseShoe); 
      cl.crawl().then((results) => {
        var json = {
          status: 200, 
          shoes: results 
        }
        console.log('Successfully scraped Craigslist crawl')
        res.send(json)
      })
      .then(() => {
        console.log("-------CLOSING BROWSER")
        cBrowser.close()
      })
  })
  .catch((err) => {
    console.log(err);
  })
})

// Scrape Craigslist 
// Need to re-write
// router.get('/craigslist', (req, res) => {
//     let baseShoe = new BaseShoe(req.query.model.toLowerCase(),
//                                 req.query.size.toLowerCase())
//     let searchParams = baseShoe.model+"+"+"size"+"+"+baseShoe.size // ie.Yeezy+desert+size+9
//     // TODO: 
//     // Define location somewhere
//     // let location = req.query.location.toLowerCase(); 
//     craigslistUrl = 'https://toronto.craigslist.org/search/sss?query='+searchParams+'&sort=rel'+'&searchNearby=1'
//     // request promise
//     rp(craigslistUrl)
//       // gets the html
//       .then((html) => {
//         // Get total num of results
//         let numTotalResults = parseInt($('.totalcount', html).first().text());
//         // Debugging
//         console.log("-------------Num of results:" + numTotalResults)
//         // Put me somewhere else
//         const urls =  (numOfResults, searchParams) => {
//           // Limited to Toronto
//           let baseUrl = 'https://toronto.craigslist.org/search/sss?query='
//           let pageUrls = []; 
//           // Craigslist lists a max of 120 posts/page
//           if (numOfResults < 120){
//               pageUrls.push(baseUrl+searchParams+'&sort=rel'+'&searchNearby=1')
//           } else {
//               let numPagesToCrawl = Math.floor(numOfResults/120);
//               console.log("Pages to crawl: " + numPagesToCrawl)
//               for (let i=0; i<=numPagesToCrawl; i++){
//               if (i==0) {
//                   pageUrls.push(baseUrl+searchParams+'&sort=rel'+'&searchNearby=1')
//               } else if (i==1){
//                   pageUrls.push(baseUrl+searchParams+'&s='+(i*120).toString()+'&sort=rel'+'&searchNearby=1')
//               }
//             }
//           }
//           return pageUrls;
//         }
//         // Get list of all urls to visit
//         let resultsUrls = urls(numTotalResults, searchParams)

//         let returnMap = {
//             urls: resultsUrls, 
//             shoeObject: baseShoe
//         };
//         return returnMap;  
//     }) 
//     .then((returnMap) => {
//         // From each result page, get the urls to each post
//         let promiseCount = 0; 
//         return Promise.all(
//           returnMap.urls.map((url) => {
//             let cl = new Craigslist(url); 
//             promiseCount++;
//             console.log("-----------------------------------Promise.all count: " + promiseCount);
//             console.log(url);
//             return cl.crawl(returnMap.shoeObject);
//           })
//         )
//     })
//     .then((results) => {
//         var json = {
//           status: 200, 
//           shoes: results
//         }
//         // Output JSON reponse 
//         res.send(json);
//         console.log('Successfully scraped')
//     })
//     .catch((error) => {
//       // handle this error
//       console.log(error)
//     })
//   });

module.exports = router;