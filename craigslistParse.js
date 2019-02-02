const rp = require('request-promise');
const $ = require('cheerio');

const craigslistParse = (url) => {
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

// Export so other files can use this function
module.exports = craigslistParse;
