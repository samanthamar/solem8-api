const rp = require('request-promise');
const $ = require('cheerio');
const BaseCrawler = require('./BaseCrawler');
const Shoe = require('./../models/Shoe');
const puppeteer = require('puppeteer');

class Craigslist extends BaseCrawler {

    constructor(url) {
        super(url); 
    }
    // TODO: 
    // This is flawed such that a browser instance will launch for each 
    // result page. If there were 100s of result pages, 100s of browser instances
    // would be created and that would be B A D!!!
    crawl(baseShoe) {
        return puppeteer.launch()
        .then((browser) => {
            return browser.newPage();
        })
        .then((page) => {
            return page.goto(this.url).then(() => {
                return page.content(); 
            })
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
                shoeObjects.push(new Shoe(baseShoe.model, baseShoe.size, 
                                          shoe.url, 'craigslist', 
                                          shoe.title, shoe.price, 
                                          shoe.photoUrl));
            });
            
            // Insert each shoeObj into DB 
            shoeObjects.forEach((shoe) => {
                shoe.insert();
            })
            return shoeObjects;
        })
        .catch((err) => {
            // Handle error properly
            console.log(err)
        })
    };
    
    populatePhotoUrls(html, shoes) {
        let photoUrls = [];
        // Get all photo urls
        console.log("------------PHOTOS")
        let photoElements =  $('a.result-image.gallery > div.swipe', html)
        photoElements.each((i, photoElement) => {
            photoUrls.push(photoElement.children[0].children[0].children[0].attribs.src)
        })
        // Map each url to a post 
        let photoUrlCount = 0; 
        for (let i=0; i<shoes.length; i++) {
            if (shoes[i].hasPhoto) {
                shoes[i].photoUrl = photoUrls[photoUrlCount];
                // Photo url count will always be <= to # of shoes
                photoUrlCount++; 
            }
        }
        return shoes; 
    }

    getNumResults(html) {
        // (rangeFrom - rangeTo)
        let rangeFrom = parseInt($('.rangeFrom',html).first().text()); 
        let rangeTo = parseInt($('.rangeTo',html).first().text()); 
        let numResults =0; 
        // Hacky 
        if (rangeFrom == 1) {
        numResults = rangeTo; 
        } else {
        numResults = rangeTo - rangeFrom; 
        }
        return numResults; 
    }

  }

module.exports = Craigslist;