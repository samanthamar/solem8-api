// Import required node modules
const puppeteer = require('puppeteer');
const cron = require('node-cron'); 
const $q = require('q'); 

const db = require('./../db');  
const BaseShoe = require('./../models/BaseShoe');
const cronCrawler = require('./../crawlers/CronCrawler');
require('./../models/Shoe');

// Sendgrid stuff
const sgMail = require('@sendgrid/mail'); 
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Global vars
cronCount = 0; 
let cBrowser; 

// Database functions 
const getSearches = () => {
    return new Promise((resolve, reject) => {
        let q = "select distinct model, size from supportedShoes"; 
        // Select from table
        db.query(q, (err, results) => {
            // Need to handle errors properly
            if (err) {
                console.log("Error retrieving db data")
                reject(err); 
            } else if (results) {
                console.log("Successfully retrieved db data");
                resolve(results)
            }
        });
    }); 
}; 

// Original 
const updateShoeTable = (searches, data) => {
    Promise.all(
        searches.map((search) => {
            deleteEntries(search.model, search.size)
     }))
     .then(() => {
         console.log("---WIPED OLD DATA")
         // [[shoe,shoe,shoe],[]]
        //  console.log(data.length)
         data.forEach((array) => {
               array.forEach((subarray) => {
                   subarray.forEach((shoe) => {
                    //    console.log(shoe)
                       shoe.insert()
                   })
               })
         })
         console.log("---SUCCESSFULLY UPDATED DATA")
     })
     .catch((err) => {
         // Handle err
         console.log(err)
     })

}

const deleteEntries = (model, size) => {
    return new Promise((resolve, reject) => {
        let q = "delete from shoes where " 
        q += "model = " + `'${model}'` + " and size = " + parseFloat(size)
        // console.log(q)
        db.query(q, (err, results) => {
            // Need to handle errors properly
            if (err) {
                console.log("Error deleting from table")
                reject(err); 
            } else if (results) {
                console.log("Successfully deleted rows");
                resolve(1)
            }
        });
    })
}

// Split crawls into chunks 
const chunk = (arr, len) => {

    var chunks = [],
        i = 0,
        n = arr.length;
  
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
  
    return chunks;
  }

// This crawl function calls the crawler
const crawl = (model, size) => {
    return new Promise((resolve, reject) => {
        // Create the baseurl
        let baseShoe = new BaseShoe(model.toLowerCase(), size);
        let searchParams = baseShoe.model+"+"+"size"+"+"+baseShoe.size; // ie.Yeezy+desert+size+9
        // Limited to Toronto
        baseUrl = 'https://toronto.craigslist.org/search/sss?query='+searchParams+'&sort=rel'+'&searchNearby=1';
        console.log(baseUrl)
        cBrowser
            .newPage()
            .then((page) => {
                // Create new Craigslist crawler object 
                cc = new cronCrawler(baseUrl, page, baseShoe); 
                // Initiate the crawl
                cc.crawl()
                // THE IMPORTANT DATA! 
                    .then((results) => {
                        resolve(results)
                })
        })
        .catch((err) => {
            // Handle err properly
            reject(err)
            console.log(err);
        })

    })
};

// 3 chunks at a time 
const cronCrawl = (queue) => {
    return Promise.all(
        queue.map((search) => {
                return crawl(search.model, search.size)
        })).then((data)=> {
            // Debugging
            console.log("-----ALL PROMISES FULFILLED")
            if (data[0] != null) {
                updateShoeTable(queue, data)
            } else{
                console.log("---NO DATA TO INSERT")
            }
        })
        .catch((err) => {
            console.log(err)
        }) 

}; 

// Task queue implementation
scheduledCrawl = () => {
    // Uncomment me with appropriate interval in production 
    // cron.schedule('*/2 * * * *', () => {
        cronCount++; 
        console.log(`------------------Initiating crawl # ${cronCount}`);
        puppeteer
            .launch()
            .then((browser) => {
            console.log("-----------CREATING BROWSER INSTANCE");
                cBrowser = browser; 
            })
            .then(()=> {
                console.log("-----------CREATING CHUNKS");
                getSearches()
                    .then((results) => {
                        // Create chunks of 3
                        // 3 is the number of concurrent, async crawls 
                        chunks = chunk(results, 3)
                        // Get num of chunks
                        var numOfChunks = chunks.length
                        // Create a .then() chain
                        var chain = $q.when();  
                        for (let i=0; i<= numOfChunks; i++) {
                            chain = chain.then(() => {
                                // If there are no more chunks, close the browser instance
                                if (i == numOfChunks) {
                                    console.log("------Closing browser")
                                    console.log("----CRAWL COMPLETE")
                                    return cBrowser.close()
                                } else {
                                    console.log(`------Executing chunk ${i}`)
                                    console.log(chunks[i])
                                    return cronCrawl(chunks[i])
                                }
                            })
                        }                
                    })
            })
        // const msg = {
        //     to: 'solem8api@gmail.com',
        //     from: 'solem8api@gmail.com', 
        //     subject: `Initiating crawl ${cronCount}`,
        //     text: 'A crawl is being initiated'
        //     // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        //   };
        // sgMail.send(msg);
        // });
};


module.exports = crawl;








