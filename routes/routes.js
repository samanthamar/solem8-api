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

router.get('/craigslist', (req, res) => {

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
      console.log("-----------LAUNCHING PHANTOM BROWSER");
      cBrowser = browser; 
    })
    .then(() => {
      return cBrowser.newPage();
    })
    .then((page) => {
      // Create new Craigslist crawler object 
      cl = new Craigslist(craigslistUrl, page, baseShoe); 
      // Initiate the crawl
      cl.crawl()
        .then((results) => {
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
    var json = {
      status: 200, 
      error: err 
    }
    res.send(json)
  })
});

module.exports = router;