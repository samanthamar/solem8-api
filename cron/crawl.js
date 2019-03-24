const db = require('./../db');  
const puppeteer = require('puppeteer');
const cron = require('node-cron'); 
const BaseShoe = require('./../models/BaseShoe');
const cronCrawler = require('./../crawlers/CronCrawler');
require('./../models/Shoe');
const sgMail = require('@sendgrid/mail'); 
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
cronCount = 0; 
let cBrowser; 

getSearches = () => {
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

// Mostly copy and paste
crawl = (model, size) => {
    return new Promise((resolve, reject) => {
        // Create the baseurl
        let baseShoe = new BaseShoe(model.toLowerCase(), size);
        let searchParams = baseShoe.model+"+"+"size"+"+"+baseShoe.size; // ie.Yeezy+desert+size+9
        // Limited to Toronto
        baseUrl = 'https://toronto.craigslist.org/search/sss?query='+searchParams+'&sort=rel'+'&searchNearby=1';
        console.log(baseUrl)
        // console.log(baseShoe)
        // This is the browser for this request
        // let cBrowser; 
        // puppeteer
        //     .launch()
        //     .then((browser) => {
        //         console.log("-----------LAUNCHING PHANTOM BROWSER");
        //         cBrowser = browser; 
        //         return cBrowser.newPage();
        //     })
        cBrowser
            .newPage()
            .then((page) => {
                // Create new Craigslist crawler object 
                cc = new cronCrawler(baseUrl, page, baseShoe); 
                // Initiate the crawl
                cc.crawl()
                // THE IMPORTANT DATA! 
                    .then((results) => {
                        console.log(results) 
                        console.log("-------CLOSING BROWSER")
                        // cBrowser.close() 
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

updateShoeTable = (searches, data) => {
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
                       console.log(shoe)
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

deleteEntries = (model, size) => {
    return new Promise((resolve, reject) => {
        let q = "delete from shoes where " 
        q += "model = " + `'${model}'` + " and size = " + parseFloat(size)
        console.log(q)
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

// Sanity checks 
// console.log(getSearches())
// console.log(crawl("yeezy", 10));

// Below is what the cron job will need to do!!!

cronCrawl = () => {
    let searches; 
    getSearches()
        .then((results) => {
            searches = results; 
            // For each url, scrape the data
            return Promise.all(
            results.map((search) => {
                    return crawl(search.model, search.size)
            })).then((data)=> {
                // Debugging
                console.log("-----ALL PROMISES FULFILLED")
                console.log(data)
                console.log(searches)
                updateShoeTable(searches, data)
                // const msg = {
                //     to: 'solem8api@gmail.com',
                //     from: 'solem8api@gmail.com', 
                //     subject: `Successfully completed crawl # ${cronCount}`,
                //     text: `Cron crawl job #${cronCount} successfully completed.`
                //   };
                // sgMail.send(msg);

            })
        })
        .catch((err) => {
            // Handle error properly
            console.log(err)
        });
}

scheduledCrawl = () => {
    cron.schedule('*/5 * * * *', () => {
        cronCount++; 
        console.log(`------------------Initiating crawl # ${cronCount}`);
        puppeteer
            .launch()
            .then((browser) => {
            console.log("-----------CREATING BROWSER INSTANCE");
                cBrowser = browser; 
            })
            .then(()=> {
                cronCrawl(); 
            })
        // const msg = {
        //     to: 'solem8api@gmail.com',
        //     from: 'solem8api@gmail.com', 
        //     subject: `Initiating crawl ${cronCount}`,
        //     text: 'A crawl is being initiated'
        //     // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        //   };
        // sgMail.send(msg);
        // cronCrawl(); 
        });
};

module.exports = crawl;








