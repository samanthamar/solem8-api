const $ = require('cheerio');
const BaseCrawler = require('./BaseCrawler');
const ShoeController = require('../controller/ShoeController');

// Load env variables for sendgrid
const environment = process.env.NODE_ENV || 'development';
const { sendgrid_key } = require('./../config/config')[environment].server;
const sgMail = require('@sendgrid/mail'); 
sgMail.setApiKey(sendgrid_key);

/*
  Craigslist crawls Craigslist for shoe data
*/
class Craigslist extends BaseCrawler {

    constructor(url, page, baseShoe) {
        super(url); // baseUrl to kick off crawl
        this.page = page; //page object  
        this.crawlUrls = []; // urls to crawl
        this.baseShoe = baseShoe // baseShoe object
    }
    
    /*
        Overriden from the base class. Implements
        the crawl function.
    */
    crawl() {
        return this.page.goto(this.url).then(() => {
            return this.page.content(); 
        })
        .then((html) => {
            // First verify there are results 
            let displayCountShow = $('span.displaycountShow', html) 
            console.log(displayCountShow.text())
            if (displayCountShow.text() == '00') {
                // Return nothing if there are no results
                // this.crawlUrls is thus empty
                console.log("---There are no results")
                return null 
            } else {
                // Get total num of results
                let numTotalResults = parseInt($('.totalcount', html).first().text());
                console.log("--------NUM TOTAL RESULTS");
                console.log(numTotalResults);
                // Put me somewhere else
                const urls = (numOfResults) => {
                    let pageUrls = []; 
                    let searchParams = this.baseShoe.model+"+"+"size"+"+"+this.baseShoe.size // ie.Yeezy+desert+size+9
                    // Limited to Toronto
                    let baseSearchUrl = 'https://toronto.craigslist.org/search/sss?query='
                    // Craigslist lists a max of 120 posts/page
                    if (numOfResults < 120){
                        pageUrls.push(baseSearchUrl+searchParams+'&sort=rel'+'&searchNearby=1')
                    } else {
                        let numPagesToCrawl = Math.floor(numOfResults/120);
                        console.log("Pages to crawl: " + numPagesToCrawl)
                        for (let i=0; i<=numPagesToCrawl; i++){
                        if (i==0) {
                            pageUrls.push(baseSearchUrl+searchParams+'&sort=rel'+'&searchNearby=1')
                        } else if (i==1){
                            pageUrls.push(baseSearchUrl+searchParams+'&s='+(i*120).toString()+'&sort=rel'+'&searchNearby=1')
                        }
                        }
                    }
                    return pageUrls;
                }
                // Populate list of all urls to visit
                this.crawlUrls = urls(numTotalResults)
            }
        })
        .then(() => {
            // Check if there are any urls to crawl 
            if (this.crawlUrls.length == 0) {
                console.log("----There are no urls to crawl")
                return null
            } else {
                // For each url, scrape the data
                return Promise.all(
                    this.crawlUrls.map((url) => {
                        return this.scrapeData(url);
                    }))   
            }
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

    /*
        For each search result page, scrape the data
    */
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
                    title = title.replace("'",""); 
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
                let shoe_detail = {
                    model: this.baseShoe.model,
                    size:  parseFloat(this.baseShoe.size), 
                    url: shoe.url,
                    source: 'craigslist',
                    title: shoe.title,
                    price: shoe.price, 
                    photo: shoe.photoUrl
                }
                shoeObjects.push(shoe_detail);
            });

            const shoeController = new ShoeController();
            // Insert each shoeObj into DB 
            shoeObjects.forEach((shoe) => {
                shoeController.insert(shoe);
            })
            return shoeObjects;
        })
        .catch((err) => {
            // Handle error properly
            console.log(err)
            const msg = {
                to: 'solem8api@gmail.com',
                from: 'solem8api@gmail.com', 
                subject: `[ERROR] SCRAPING DATA`,
                text: `There was an error scraping data: ${err}`
              };
            sgMail.send(msg);
        })
    };

    /*
        It is not possible to go to a speciic post to get photo info
        Here, we just get all the photos on the page and from the parent
        function call, we map each photo to a post
    */
    populatePhotoUrls(html, shoes) {
        let photoUrls = [];
        // Get all photo urls
        // console.log("------------PHOTOS")
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

    /*
        Get the number of results on a search page
    */
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