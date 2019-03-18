const BaseShoe = require('./BaseShoe');
const db = require('./../db'); 
const { Model } = require('objection')

Model.knex(db)

class Shoe extends Model {
    static get tableName () {
        return 'shoes'
    }

    static get jsonSchema () {
        return {
          type: 'object',
          required: ['model'],
    
          properties: {
            id: {type: 'integer'},
            parentId: {type: ['integer', 'null']},
            firstName: {type: 'string', minLength: 1, maxLength: 255},
            lastName: {type: 'string', minLength: 1, maxLength: 255},
            age: {type: 'number'},
    
            // Properties defined as objects or arrays are
            // automatically converted to JSON strings when
            // writing to database and back to objects and arrays
            // when reading from database. To override this
            // behaviour, you can override the
            // Person.jsonAttributes property.
            address: {
              type: 'object',
              properties: {
                street: {type: 'string'},
                city: {type: 'string'},
                zipCode: {type: 'string'}
              }
            }
          }
        };
      }
}
// class Shoe extends BaseShoe {
//     constructor(model, size, url, source, title, price) {
//         super(model, size);
//         this.url = url; 
//         this.source = source; 
//         this.title = title; 
//         this.price = price;
//     }

//     insert() {
//         console.log("-----------inserting shoe")
//         // TODO: what if the title has a " ' " in it? 
//         let model = "'" + this.model + "'" ;
//         let size = parseFloat(this.size);
//         let url = "'" + this.url + "'";
//         let source = "'" + this.source + "'";
//         let title = "'" + this.title + "'"; 
//         let price = parseFloat(this.price.replace(/[$,]+/g,""))

//         // Build the query
//         let baseQuery = "INSERT INTO shoes (model, size, url, source, title, price) VALUES (";
//         let q = baseQuery + model + " ," + size + " ," + url + " ," + source
//         q += " ," + title + " ," + price + ")"
        
//         console.log(q)
      
//         // Insert into table
//         db.query(q, (err, result) => {
//             // Need to handle errors properly
//             if (err) throw err;
//             console.log("1 record inserted");
//         });
//     }

// }

module.exports = Shoe; 