// DOES NOT WORK YET

'use strict';
const Shoe = require('../models/Shoe');

class ShoeController {
    constructor() {

    }

    async insert(shoe_info) {
        return await Shoe
        .query()
        .insert(shoe_info)
        .then(name => {
            console.log("Successfully Inserted 1 Record");
        })
        .catch(err => {
            console.log(err)
        });
    }

    async getAllShoes() {
        return await Shoe.query()
        .catch(err => {
            console.log(err);
        });

        
    }
}

module.exports = ShoeController;
