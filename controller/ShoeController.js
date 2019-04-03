'use strict';
const Shoe = require('../models/Shoe');
const SupportedShoes = require('../models/SupportedShoes');

/*
  The Shoe Controller is responsible 
  for all DB operations on Shoe objects
  Errors are logged and are propogated back up 
  to parent call
*/
class ShoeController {
    constructor() {

    }

    validateInput(shoeDetail) {
        for (var propName in shoeDetail) { 
            if (shoeDetail[propName] === null || shoeDetail[propName] === undefined) {
              delete shoeDetail[propName];
            }
        }
    }

    async delete(model, size) {
        const numShoesDeleted = await Shoe
            .query()
            .delete()
            .where('model', model)
            .andWhere('size', size);
        console.log(numShoesDeleted + " entries is deleted");
    }

    async insert(shoeDetail) {
        this.validateInput(shoeDetail)
        await Shoe
            .query()
            .insert(shoeDetail)
    }

    async getAllShoes() {
        const allShoes = await Shoe.query()
        return allShoes
    }

    async queryShoes(searchParams) {
        // Don't know how the frontend will send this param
        let shoes; 
        if (searchParams.sortLowHigh == 'True') {
            shoes = await Shoe.query()
                .where('model', searchParams.model)
                .andWhere('size', searchParams.size)
                .andWhere('price', '>=', searchParams.priceMin)
                .andWhere('price', '<=', searchParams.priceMax)
                .orderBy('price', 'asc')   
        } else {
            shoes = await Shoe.query()
                .where('model', searchParams.model)
                .andWhere('size', searchParams.size)
                .andWhere('price', '>=', searchParams.priceMin)
                .andWhere('price', '<=', searchParams.priceMax)
                .orderBy('price', 'desc')   
        }
        console.log(shoes.length + " Shoes found in the database");
        return shoes;
    }

    async getSupportedShoes() {
        const data = await SupportedShoes
                .query()
                .distinct('model')
                .select()
        console.log(data)
        return data
    }
}

module.exports = ShoeController;
