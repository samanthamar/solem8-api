const BaseShoe = require('./BaseShoe');
const db = require('./../db'); 

class Shoe extends BaseShoe {
    constructor(model, size, url, source, title, price) {
        super(model, size);
        this.url = url; 
        this.source = source; 
        this.title = title; 
        this.price = price;
    }

    insert() {
        console.log("-----------inserting shoe")
        // TODO: what if the title has a " ' " in it? 
        let model = "'" + this.model + "'" ;
        let size = parseFloat(this.size);
        let url = "'" + this.url + "'";
        let source = "'" + this.source + "'";
        let title = "'" + this.title + "'"; 
        let price = parseFloat(this.price.replace(/[$,]+/g,""))

        // Build the query
        let baseQuery = "INSERT INTO shoes (model, size, url, source, title, price) VALUES (";
        let q = baseQuery + model + " ," + size + " ," + url + " ," + source
        q += " ," + title + " ," + price + ")"
        
        console.log(q)
      
        // Insert into table
        db.query(q, (err, result) => {
            // Need to handle errors properly
            if (err) throw err;
            console.log("1 record inserted");
        });
    }

}

module.exports = Shoe; 