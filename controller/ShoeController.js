'use strict';
const Shoe = require('../models/Shoe');

class ShoeController {
    constructor() {

    }
    async delete(model, size) {
        const numShoesDeleted = await Shoe
        .query()
        .delete()
        .where('model', model)
        .andWhere('size', size);
        console.log(numShoesDeleted + "entries is deleted");
    }

    async insert(shoeDetail) {
        try {
            await Shoe
                .query()
                .insert(shoeDetail)
        } catch(err) {
            console.log(err)
        }
    }

    async getAllShoes() {
        try {
            const allShoes = await Shoe.query()
        } catch(err) {
            console.log(err);
        }
    }

    async queryShoes(searchParams) {
        try {
            const shoes = await Shoe.query()
                .where('model', searchParams.model)
                .andWhere('size', searchParams.size)
                .andWhere('price', '>=', searchParams.priceMin)
                .andWhere('price', '<=', searchParams.priceMax);
            console.log(shoes.length + "Shoes found in the database");
            return shoes;
        } catch(err) {
            console.log(err);
        }
    }
}

module.exports = ShoeController;
