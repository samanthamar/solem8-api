const puppeteer = require('puppeteer');
const cron = require('node-cron'); 
const $q = require('q'); 
const BaseShoe = require('./../models/BaseShoe');
const ShoeController = require('./../controller/ShoeController');
const SupportedShoes = require('./../models/SupportedShoes');
const cronCrawler = require('./../crawlers/CronCrawler');
require('./../models/Shoe');

// Load env variables for sendgrid
const environment = process.env.NODE_ENV || 'development';
const { sendgrid_key } = require('./../config/config')[environment].server;
const sgMail = require('@sendgrid/mail'); 
sgMail.setApiKey(sendgrid_key);

// Global variables
cronCount = 0; 
let cBrowser; 
const shoeController = new ShoeController();

/*
  Retrieve the list of shoes to crawl
  from the supportedShoes table. 
*/
const getSearches = () => {
    return new Promise((resolve, reject) => {
        // Query
        SupportedShoes
            .query()
            .distinct('model', 'size')
            .select()
            .then(results => {
                console.log("Successfully retrieved db data");
                resolve(results);
            })
            .catch(err => {
                console.log("Error retrieving db data");
                const msg = {
                    to: 'solem8api@gmail.com',
                    from: 'solem8api@gmail.com', 
                    subject: `[ERROR] RETREVING SUPPORTED SHOES`,
                    text: `There was an error retrieving shoes from supportedShoes table on crawl ${cronCount}: ${err}`
                  };
                sgMail.send(msg);
                reject(err); 
            });
        // let q = "select distinct model, size from supportedShoes"; 
        // // Select from table
        // db.query(q, (err, results) => {
        //     // Need to handle errors properly
        //     if (err) {
        //         console.log("Error retrieving db data")
        //         reject(err); 
        //     } else if (results) {
        //         console.log("Successfully retrieved db data");
        //         resolve(results)
        //     }
        // });
    }); 
}; 

/*
  Delete old shoe data and update table 
  with freshly crawled data
*/
const updateShoeTable = (searches, data) => {
    Promise.all(
        searches.map((search) => {
            deleteEntries(search.model, search.size)
        }))
        .then(() => {
            console.log("---WIPED OLD DATA")
            // [[shoe,shoe,shoe],[]]
            console.log(data.length)
            data.forEach((array) => {
                array.forEach((subarray) => {
                    subarray.forEach((shoe) => {
                        console.log(shoe);
                        shoeController.insert(shoe);
                    })
                })
            })
        console.log("---SUCCESSFULLY UPDATED DATA")
    })
    .catch((err) => {
        // Handle err
        console.log(err)
        const msg = {
            to: 'solem8api@gmail.com',
            from: 'solem8api@gmail.com', 
            subject: `[ERROR] UPDATING SHOE TABLE`,
            text: `There was an error updating the shoes table on crawl ${cronCount}: ${err}`
          };
        sgMail.send(msg);
    })

}

/*
  Delete old entries from table
*/
const deleteEntries = (model, size) => {
    return new Promise((resolve, reject) => {
        try {
            shoeController.delete(model, size);
            resolve(1);
        } catch(err) {
            console.log("Error deleting from table");
            const msg = {
                to: 'solem8api@gmail.com',
                from: 'solem8api@gmail.com', 
                subject: `[ERROR] DELETING FROM SHOE TABLE`,
                text: `There was an error deleting from the shoes table on crawl ${cronCount}: ${err}`
              };
            sgMail.send(msg);
            reject(err); 
        }
        // let q = "delete from shoes where " 
        // q += "model = " + `'${model}'` + " and size = " + parseFloat(size)
        // console.log(q)
        // db.query(q, (err, results) => {
        //     // Need to handle errors properly
        //     if (err) {
        //         console.log("Error deleting from table");
        //         reject(err); 
        //     } else if (results) {
        //         console.log("Successfully deleted rows");
        //         resolve(1)
        //     }
        // });
    });
}

/*
    A helper function to split the supportedShoes
    list into subarrays of 3 (these are called chunks)
*/
const chunk = (arr, len) => {

    var chunks = [],
        i = 0,
        n = arr.length;
  
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
  
    return chunks;
  }

/*
  This function performs a crawl on each model, size pair
*/
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
            console.log(err);
            const msg = {
                to: 'solem8api@gmail.com',
                from: 'solem8api@gmail.com', 
                subject: `[ERROR] INITIATING CRAWL`,
                text: `There was an error updating the shoes table on crawl ${cronCount}: ${err}`
              };
            sgMail.send(msg);
            reject(err)
        })

    })
};

/*
  This is the function the cron crawl function will call
  It crawls 1 chunk at a time 
*/
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
            const msg = {
                to: 'solem8api@gmail.com',
                from: 'solem8api@gmail.com', 
                subject: `[ERROR] INITIATING CRAWL ON CHUNK`,
                text: `There was an error crawling on chunk ${chunk}: ${err}`
              };
            sgMail.send(msg);
        }) 

}; 

/*
  This is the ACTUAL function that will be called to initate 
  scheduled crawls 
*/
scheduledCrawl = () => {
    // Uncomment me with appropriate interval in production 
    cron.schedule('*/2 * * * *', () => {
        cronCount++; 
        console.log(`------------------Initiating crawl # ${cronCount} @ ${new Date().toISOString()}`);
        const msg = {
            to: 'solem8api@gmail.com',
            from: 'solem8api@gmail.com', 
            subject: `Initiating crawl ${cronCount}`,
            text: `A crawl is being initiated @ ${new Date().toISOString()}`
          };
        console.log('----------SENDING EMAIL')
        sgMail.send(msg);
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
    })
};


module.exports = crawl;








