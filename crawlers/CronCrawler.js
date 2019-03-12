const $ = require('cheerio');
const Craigslist = require('./Craigslist');
const Shoe = require('./../models/Shoe');

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
                        price: price,
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
                shoeObjects.push(new Shoe(this.baseShoe.model, this.baseShoe.size, 
                                          shoe.url, 'craigslist', 
                                          shoe.title, shoe.price, 
                                          shoe.photoUrl));
            });

            return shoeObjects;
        })
        .catch((err) => {
            // Handle error properly
            console.log(err)
        })
    };
  }

module.exports = CronCrawler;