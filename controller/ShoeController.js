'use strict';
const Shoe = require('../models/Shoe');

class ShoeController {
    constructor() {

    }

    async insert(shoeDetail) {
        await Shoe
        .query()
        .insert(shoeDetail)
        .then(() => {
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

    async queryShoes(searchParams) {
        await Shoe.query()
        .where('model', searchParams.model)
        .andWhere('size', searchParams.size)
        .andWhere('price', '>=', searchParams.priceMin)
        .andWhere('price', '<=', searchParams.priceMax)
        .then(results => {
            return results;
        });
    }
}

module.exports = ShoeController;
