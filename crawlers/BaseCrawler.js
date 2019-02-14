// All crawlers must inherit from this class and 
// implement the methods below
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