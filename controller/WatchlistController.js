'use strict';
const Watchlist = require('../models/Watchlist');

/*
  The Watchlist Controller is responsible 
  for all DB operations on Shoe objects
  Errors are logged and are propogated back up 
  to parent call
*/
class WatchlistController {
    constructor() {

    }

    /*
        Retrieve a user's watchlist from DB
    */
    async getWatchlist(username) {
        try {
            let watchlist;
            watchlist = await Watchlist.query() 
                        .select('model', 'size', 'priceMin', 'priceMax')
                        .where('username', username)
            return watchlist; 
        } catch(err) {
            console.log(err);
        }
    }

    /*
        Check if a watchlist item can be added to
        user's watchlist 
    */
    async validateWatchlistItem(watchlistItem) {
        try {
            let watchlist;
            watchlist = await Watchlist.query() 
                        .where('username', watchlistItem.username)
                        .andWhere('model', watchlistItem.model)
                        .andWhere('size', watchlistItem.size)
                        .andWhere('priceMin', watchlistItem.priceMin)
                        .andWhere('priceMax', watchlistItem.priceMax); 
            // If list is empty, it means the item does not
            // currently exist for the user 
            if (watchlist.length == 0) {
                return true; 
            } else {
                return false; 
            }
        } catch(err) {
            console.log(err)
        }
    }

    /*
       Insert a watchlist item for a user into DB
    */
    async addToWatchlist(watchlistItem) {
        try {
            await Watchlist
                .query()
                .insert(watchlistItem); 
        } catch(err) {
            console.log(err)
        }
    }

   /*
       Delete a watchlist item for a user into DB
    */
    async delete(watchlistItem) {
       await Watchlist
        .query()
        .delete()
        .where('username', watchlistItem.username)
        .andWhere('model', watchlistItem.model)
        .andWhere('size', watchlistItem.size)
        .andWhere('priceMin', watchlistItem.priceMin)
        .andWhere('priceMax', watchlistItem.priceMax); 
    }
}

module.exports = WatchlistController;
