const router = require('express').Router();
const rp = require('request-promise');
const $ = require('cheerio');
const Craigslist = require('./../crawlers/Craigslist');
const BaseShoe = require('./../models/BaseShoe');
const ShoeController = require('../controller/ShoeController');

// THIS FILE CONTAINS ALL THE ENDPOINT LOGIC 
// base route to handle '/'
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Your backend is working!' });
});

// Return all shoes from DB 
// TODO: add filtering when getting shoes from DB
router.get('/shoes', async (req, res) => {
  // Returns shoes
  shoeController = new ShoeController();
  const shoes = await shoeController.getAllShoes();
  // const shoes = await Shoe.query()
  // .catch(err => {
  //     console.log(err);
  // });
  res.json(shoes);

    // let q = "SELECT * FROM shoes"
    // db.query(q, (err, result) => {
    //     if (err) throw err; 
    //     console.log('Successfully retrieved records');
    //     res.send({
    //         shoes: result
    //     });
    // });

    // let q2 = "show databases"
    // db.query(q2, (err, result) => {
    //     if (err) throw err; 
    //     console.log('Successfully retrieved records');
    //     res.send({
    //         databases: result
    //     });
    // });
});

// Scrape Craigslist 
router.get('/craigslist', async (req, res) => {
    let baseShoe = new BaseShoe(req.query.model.toLowerCase(),
                                req.query.size.toLowerCase())
    let searchParams = baseShoe.model+"+"+"size"+"+"+baseShoe.size // ie.Yeezy+desert+size+9

    // TODO: 
    // Define location somewhere
    // let location = req.query.location.toLowerCase(); 
    craigslistUrl = 'https://toronto.craigslist.org/search/sss?query='+searchParams+'&sort=rel'+'&searchNearby=1'
    // request promise
    rp(craigslistUrl)
      // gets the html
      .then((html) => {
        // Get total num of results
        let numTotalResults = parseInt($('.totalcount', html).first().text());
        // Debugging
        console.log("-------------Num of results:" + numTotalResults)
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

        let returnMap = {
            urls: resultsUrls, 
            shoeObject: baseShoe
        };
        return returnMap;  
    }) 
    .then((returnMap) => {
        // From each result page, get the urls to each post
        let promiseCount = 0; 
        return Promise.all(
          returnMap.urls.map((url) => {
            let cl = new Craigslist(url); 
            promiseCount++;
            console.log("-----------------------------------Promise.all count: " + promiseCount);
            console.log(url);
            return cl.crawl(returnMap.shoeObject);
          })
        )
    })
    .then((results) => {
        let cl = new Craigslist();
        var json = {
          status: 200, 
          shoes: results
        }
        // Output JSON reponse 
        res.send(json);
        console.log('Successfully scraped')
    })
    .catch((error) => {
      // handle this error
      console.log(error)
    })
  });

module.exports = router;