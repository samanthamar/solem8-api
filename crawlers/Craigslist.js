const rp = require('request-promise');
const $ = require('cheerio');
const BaseCrawler = require('./BaseCrawler');
const Shoe = require('./../models/Shoe');
const puppeteer = require('puppeteer');

class Craigslist extends BaseCrawler {

    constructor(url) {
        super(url); 
    }

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
            // console.log(html); 

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

//     crawl(baseShoe) {
//         return rp(this.url)
//             .then((html) => {
//                 console.log(baseShoe)
//                 // (rangeFrom - rangeTo)
//                 let rangeFrom = parseInt($('.rangeFrom',html).first().text()); 
//                 let rangeTo = parseInt($('.rangeTo',html).first().text()); 
//                 let numResults =0; 
    
//                 // Hacky 
//                 if (rangeFrom == 1) {
//                     numResults = rangeTo; 
//                 } else {
//                     numResults = rangeTo - rangeFrom; 
//                 }
//                 let shoes =[]
//                 // console.log("----------------------------numResults: "+numResults);
//                 for(let i=0; i<numResults; i++){
//                     // If there is a price for the shoe, there will be an element with class name 'result-price'
//                     // Here, we are checking what the class name of the next element is 
//                     let resultMetaFirstClass = $('span.result-meta', html)[i].children[0].next.children[0].parent.attribs.class
//                     // console.log($('span.result-meta', html)[i].children[0].next.children[0].parent)
    
//                     // Only add shoe if price data is available
//                     // This was a pain in the ass to figure out
//                     if (resultMetaFirstClass=='result-price') {
//                         let url = $('a.result-title.hdrlnk', html)[i].attribs.href;
//                         let title = $('a.result-title.hdrlnk', html)[i].children[0].data;
//                         let price = $('span.result-meta', html)[i].children[0].next.children[0].parent.children[0].data;
                        
//                         // INCOMPLETE
//                         // Check if post has photo
//                         let resultRowLinkClass = $('li.result-row > a', html)[i].attribs.class;
//                         let hasPhoto = false; 
//                         let photo =  null;
//                         if (resultRowLinkClass == 'result-image gallery') {
//                             hasPhoto = true;
//                         }
//                         if (hasPhoto) {
//                             // TODO: FIGURE OUT HOW TO GET PHOTO SRC
//                             // It's nested weird
//                             // console.log("---------PHOTO:")
//                             // console.log($('.result-image.gallery', html)[i].children)
//                             console.log('Post has photo')
//                             getPhoto(url)
//                         }
//                         console.log("-----------pushing shoes into list")
//                         shoes.push(new Shoe(baseShoe.model, baseShoe.size, url, 'craigslist', title, price));
//                     }
       
//                 }

//                 // insert each shoe into DB
//                 shoes.forEach((shoe) => {
//                     shoe.insert();
//                 });

//                 return shoes;

//             })
//             .catch((err) => {
//                 // handle error
//                 console.log(err);
//             });
//     };

//     // This might be a better way to launch the page. We would just use 
//     // Cheerio to parse the html 
//     getPhoto(url) {
//         puppeteer
//             .launch() // launch headless browser
//             .then((browser) => {
//                 return browser.newPage(); // create a new page object
//             })
//             .then((page) => {
//                 return page.goto(url); // go to page
//             })
//             .then(() => {
//                 return page.content(); // 
//             })
//             .then((html) => {
//                 console.log($('a.result-image.gallery',html)
//             }); 


//     }
}

module.exports = Craigslist;