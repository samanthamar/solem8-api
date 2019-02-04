// All crawlers must inherit from this class and 
// implement the methods below
class BaseCrawler {

    constructor(url) {
        this.url = url;
        // this.keywords = keywords; 
    }   

    crawl() {
        throw new Error("NotImplementedError")
    }; 

}

module.exports = BaseCrawler;