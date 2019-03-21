const rp = require('request-promise');
const $ = require('cheerio');
const BaseCrawler = require('./BaseCrawler');
const ShoeController = require('../controller/ShoeController');
class Craigslist extends BaseCrawler {

    constructor(url) {
        super(url); 
    }

    async crawl(baseShoe) {
        return rp(this.url)
            .then((html) => {
                console.log(baseShoe)
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
                let shoes =[]
                // console.log("----------------------------numResults: "+numResults);
                for(let i=0; i<numResults; i++){
                    // If there is a price for the shoe, there will be an element with class name 'result-price'
                    // Here, we are checking what the class name of the next element is 
                    let resultMetaFirstClass = $('span.result-meta', html)[i].children[0].next.children[0].parent.attribs.class
                    // console.log($('span.result-meta', html)[i].children[0].next.children[0].parent)
    
                    // Only add shoe if price data is available
                    // This was a pain in the ass to figure out
                    if (resultMetaFirstClass=='result-price') {
                        let url = $('a.result-title.hdrlnk', html)[i].attribs.href;
                        let title = $('a.result-title.hdrlnk', html)[i].children[0].data;
                        let price = $('span.result-meta', html)[i].children[0].next.children[0].parent.children[0].data;
                        
                        // INCOMPLETE
                        // Check if post has photo
                        let resultRowLinkClass = $('li.result-row > a', html)[i].attribs.class;
                        let hasPhoto = false; 
                        let photo = '';
                        if (resultRowLinkClass == 'result-image gallery') {
                            hasPhoto = true;
                        }
                        if (hasPhoto) {
                            // TODO: FIGURE OUT HOW TO GET PHOTO SRC
                            // It's nested weird
                            console.log("---------PHOTO:")
                            // console.log($('.result-image.gallery', html)[i])
                            console.log($('.result-image.gallery', html)[i].children)
                        }
                        console.log("-----------pushing shoes into list")
                        var shoe_info = { model: baseShoe.model, size: parseFloat(baseShoe.size), url: url, source: 'craigslist', title: title, price: parseFloat(price.replace(/[$,]+/g,"")), photo: photo };
                        shoes.push(shoe_info);
                    }
       
                }

                // insert each shoe into DB
                const shoeController = new ShoeController();
                shoes.forEach((shoe_info) => {
                    shoeController.insert(shoe_info);
                });
                return shoes;

            })
            .catch((err) => {
                // handle error
                console.log(err);
            });
    };
}

module.exports = Craigslist;