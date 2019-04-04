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
        let watchlist;
        watchlist = await Watchlist.query() 
                    .select('model', 'size', 'priceMin', 'priceMax')
                    .where('username', username)
        return watchlist; 
    }

    /*
        Check if a watchlist item can be added to
        user's watchlist 
    */
    async validateWatchlistItem(watchlistItem) {
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
    }

    /*
       Insert a watchlist item for a user into DB
    */
    async addToWatchlist(watchlistItem) {
        await Watchlist
            .query()
            .insert(watchlistItem); 
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
