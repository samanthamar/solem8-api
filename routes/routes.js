const router = require('express').Router();
const Craigslist = require('./../crawlers/Craigslist');
const BaseShoe = require('./../models/BaseShoe');
const ShoeController = require('../controller/ShoeController');
const AuthController = require('../controller/AuthController');
const puppeteer = require('puppeteer');

// Load env variables for sendgrid
const environment = process.env.NODE_ENV || 'development';
const { sendgrid_key } = require('./../config/config')[environment].server;
const sgMail = require('@sendgrid/mail'); 
const shoeController = new ShoeController(); 
sgMail.setApiKey(sendgrid_key);

/*
  This is the base endpoint to check if
  the server is responding 
*/
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Your backend is working!' });
});

/*
  This endpoint retrieves shoes from the DB and 
  sort its in asending or descending order. A 
  json response is returned with the shoe data. 
*/
router.get('/shoes', (req, res) => {
    let searchParams = {
        model: req.query.model, // string
        size: req.query.size, // float 
        priceMin: req.query.priceMin, //float
        priceMax: req.query.priceMax,// float
        sortLowHigh: req.query.sortLowHigh
    } 
    
    shoeController
      .queryShoes(searchParams)
      .then(returnedShoes => {
        console.log("------SUCESSFULLY RETRIEVED RESULTS");
        console.log(returnedShoes);
        res.send({
          shoes: returnedShoes 
        });
      })
      .catch(err => {
          console.log(err)
          res.send({
            error: err
        })
        // Send an email with the error
        const msg = {
          to: 'solem8api@gmail.com',
          from: 'solem8api@gmail.com', 
          subject: '[ERROR] /shoes endpoint',
          text: `There was an issue retrieving data from the shoes table: ${err}`
        };
        sgMail.send(msg);
    });
});

/*
  This endpoint retrieves all the supported shoes. The
  json response is returned. 
*/
router.get('/supportedShoes', (req, res) => {
  shoeController
    .getSupportedShoes()
    .then(returnedShoes => {
      console.log("------SUCESSFULLY RETRIEVED RESULTS");
      console.log(returnedShoes);
      res.send({
        shoes: returnedShoes 
      });
    })
    .catch(err => {
      console.log(err)
      res.send({
        error: err
      })
      // Send an email with the error
      const msg = {
        to: 'solem8api@gmail.com',
        from: 'solem8api@gmail.com', 
        subject: '[ERROR] /supportedShoes endpoint',
        text: `There was an issue retrieving data from the shoes table: ${err}`
      };
      sgMail.send(msg);
  });
});

/*
    This endpoint is used for registering the user
*/
router.post('/register', AuthController.createUser);

/* 
    The endpoint validates if the user exists
*/
router.get('/findUser', AuthController.findUser);

/*
    This endpoint is used for Login the user
*/
router.post('/login', AuthController.loginUser);

/*
  This endpoint is just for testing the crawler.
*/
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