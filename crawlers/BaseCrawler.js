/*
    All future crawlers inherit from this class
    All future crawler must override the described 
    functions 
*/
class BaseCrawler {

    constructor(url) {
        // Give give the crawler the initial  url to crawl
        this.url = url;
        // this.keywords = keywords; 
    }   

    crawl() {
        throw new Error("NotImplementedError")
    }; 

}

module.exports = BaseCrawler;