const request = require('request');
// This function is just is a just a template on how to create a promise
const getHtml = (url) => {
    return new Promise((resolve, reject) => {
        request(url, function(error, response, html) {
            if (!error) {
                // Return the html 
                resolve(html);
            } else {
                reject(error)
            }
        });
    })
}; 

module.exports = getHtml; 