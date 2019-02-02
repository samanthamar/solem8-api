const rp = require('request-promise');
const $ = require('cheerio');
// This class contains all functions used by the Craigslist scraper
class Craigslist {

    // Helper functions 
    urls (numOfResults, searchParams) {
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

    // From the results page, parse post info
    craigslistParse (url) {
        return rp(url)
            .then((html) => {
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
                    if (resultMetaFirstClass=='result-price') {
                        let url = $('a.result-title.hdrlnk', html)[i].attribs.href;
                        let title = $('a.result-title.hdrlnk', html)[i].children[0].data;
                        let price = $('span.result-meta', html)[i].children[0].next.children[0].parent.children[0].data;
                        
                        // INCOMPLETE
                        // Check if post has photo
                        let resultRowLinkClass = $('li.result-row > a', html)[i].attribs.class;
                        let hasPhoto = false; 
                        let photo =  null;
                        if (resultRowLinkClass == 'result-image gallery') {
                            hasPhoto = true;
                        }
                        if (hasPhoto) {
                            // TODO: FIGURE OUT HOW TO GET PHOTO SRC
                            // It's nested weird
                        }
    
                        let shoeInfo = {
                            url: url, 
                            title: title, 
                            price: price,
                            // photo: photo 
                        }
    
                        shoes.push(shoeInfo)
                    }
       
                }
                return shoes;
            })
            .catch((err) => {
                // handle error
                console.log(err);
            });
    };
}

module.exports = Craigslist;