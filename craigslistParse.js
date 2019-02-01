const rp = require('request-promise');
const $ = require('cheerio');

const craigslistParse = function(url) {
    return rp(url)
        .then(function(html) {
            // TODO: store photos, what if there is multiple photos
            return {
                title: $('span[id="titletextonly"]', html).text(),
                price: $('.price', html).text(),
                desc: $('#postingbody', html).text(),
                url: url 
            };
        })
        .catch(function(err){
            // handle error
            console.log(err);
        });
};
// Export so other files can use this function
module.exports = craigslistParse;