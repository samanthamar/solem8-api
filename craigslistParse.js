const rp = require('request-promise');
const request = require('request');
const $ = require('cheerio');

const craigslistParse = (url) => {
    return rp(url)
        .then((html) => {
            let rangeFrom = parseInt($('.rangeFrom',html).first().text()); 
            let rangeTo = parseInt($('.rangeTo',html).first().text()); 
            let numResults =0; 
            if (rangeFrom == 1) {
                numResults = rangeTo; 
            } else {
                numResults = rangeTo - rangeFrom; 
            }
            let shoes =[]
            console.log("----------------------------numResults: "+numResults);
            for(let i=0; i<numResults; i++){
    
                let url = $('a.result-title.hdrlnk', html)[i].attribs.href;
                let title = $('a.result-title.hdrlnk', html)[i].children[0].data;
                console.log(title)

                let shoeInfo = {
                    url: url, 
                    title: title
                }

                shoes.push(shoeInfo)
                

            }
            return shoes;
        })
        .catch((err) => {
            // handle error
            console.log(err);
        });
};

// TODO: store photos, what if there is multiple photos
// return {
//     title: $('span[id="titletextonly"]', html).text(),
//     price: $('.price', html).text(),
//     desc: $('#postingbody', html).text(),
//     url: url 
// };

// Export so other files can use this function
module.exports = craigslistParse;
