const express = require('express');
const request = require('request');
const $ = require('cheerio');
const app     = express();

app.get('/', function(req, res) {

//   let date = req.query.date.toLowerCase();
//   let sign = req.query.sign.toLowerCase();

  let url = 'https://www.astrology.com/';

  getHtml(url)
  // fulfilled promise
    .then((html) => {
        console.log(html)
        let json = {
            status: 'success'
        }
        res.send(json)
    })
    // can chain promises here
    // rejection handling
    .catch((err) => {
        res.send(err)
    })

//   request(url, function(error, response, html) {
//     if (!error) {
//       $.load(html);
//       var prediction = $('div.daily-horoscope > p').text();

//       var json = {
//         date: date,
//         sign: sign,
//         prediction: prediction
//       };

//       res.send(json);
//     }

//   });

});

const getHtml = (url) => {
    return new Promise((resolve, reject) => {
        request(url, function(error, response, html) {
            if (!error) {
                // Return the html 
                resolve(html);
            } else {
                // Return a json object with the error msg
                let json = {
                    error: error
                }
                reject(json)
            }
        });
    })
}; 

app.listen(process.env.PORT || 5000);
module.exports = app;
