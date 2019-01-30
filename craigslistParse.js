const rp = require('request-promise');
const $ = require('cheerio');

const craigslistParse = function(url) {
    return rp(url)
        .then(function(html) {
            // Parse class name
            return {
                title: $('span[id="titletextonly"]', html).text(),
                price: $('.price', html).text(),
                url: url 
            };
        })
        .catch(function(err){
            // handle error
            console.log(err);
        });
};

module.exports = craigslistParse;