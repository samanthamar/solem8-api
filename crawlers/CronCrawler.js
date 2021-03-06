const $ = require('cheerio');
const Craigslist = require('./Craigslist');

// Load env variables for sendgrid
const environment = process.env.NODE_ENV || 'development';
const { sendgrid_key } = require('./../config/config')[environment].server;
const sgMail = require('@sendgrid/mail'); 
sgMail.setApiKey(sendgrid_key);

class CronCrawler extends Craigslist {

    constructor(url, page, baseShoe) {
        super(url); // baseUrl to kick off crawl
        this.page = page; //page object  
        this.crawlUrls = []; // urls to crawl
        this.baseShoe = baseShoe // baseShoe object
    }

    // This is the only method that was overrriden
    scrapeData(url) {
        return this.page.goto(url).then(() => {
            return this.page.content(); 
        })
        .then((html) => {
            // Page photo flag 
            let pagePhotoFlag = false; 
            // Scrape logic goes in here
            console.log('----------Successfully loaded html content')
            // Get number of results
            let numResults = this.getNumResults(html); 
            // Store shoes in an array 
            let shoes = []; 
            for (let i=0; i<numResults; i++) {
                // If there is a price for the shoe, 
                // there will be an element with class name 'result-price'
                // We only want to store a listing if there is price data available
                // Here, we are checking what the class name of the next element is 
                let resultMetaFirstClass = $('span.result-meta', html)[i].children[0].next.children[0].parent.attribs.class

                // If post has price data
                if (resultMetaFirstClass=='result-price') {
                    let url = $('a.result-title.hdrlnk', html)[i].attribs.href;
                    let title = $('a.result-title.hdrlnk', html)[i].children[0].data;
                    // Occasionally run into error if title contains " ' ", replace it with ""
                    title = title.replace(/'/g,"").replace(); 
                    let price = $('span.result-meta', html)[i].children[0].next.children[0].parent.children[0].data;
                    let photoFlag = false; 

                    // Check if post has photo
                    let resultRowLinkClass = $('li.result-row > a', html)[i].attribs.class;
                    if (resultRowLinkClass == 'result-image gallery') {
                        photoFlag = true;
                        pagePhotoFlag = true; 
                    }

                    let shoe = {
                        url: url, 
                        title: title,
                        price: parseFloat(price.replace('$','')),
                        hasPhoto: photoFlag,
                        photoUrl: null 
                    }
                    shoes.push(shoe);

                } else {
                    // No price data available
                    continue; 
                }
            }
            
            // Check the status of the page photo flag
            // If it is true, we need to get all the photo links and map 
            // it 1:1 to each shoe that has it's photo flag set to true
            if (pagePhotoFlag) {
                this.populatePhotoUrls(html, shoes); 
            } 
            // Create new shoe object for each 
            let shoeObjects = [] 
            shoes.forEach((shoe) => {
                shoeObjects.push({ 
                    model: this.baseShoe.model, 
                    size: parseFloat(this.baseShoe.size), 
                    url: shoe.url,
                    source: 'craigslist', 
                    title: shoe.title,
                    price: shoe.price, 
                    photo: shoe.photoUrl
                });
            });

            return shoeObjects;
        })
        .catch((err) => {
            // Handle error properly
            console.log(err)
            const msg = {
                to: 'solem8api@gmail.com',
                from: 'solem8api@gmail.com', 
                subject: `[ERROR] PERFORMING CRAWL`,
                text: `There was an error performing crawl: ${err}`
              };
            sgMail.send(msg);            
        })
    };
  }

module.exports = CronCrawler;