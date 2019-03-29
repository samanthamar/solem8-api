
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('supportedShoes').del()
    .then(function () {
      // Inserts seed entries
      return knex('supportedShoes').insert([
        {id: 1, model: 'jir+aordan', size: 5},
        {id: 2, model: 'air+jordan', size: 6},
        {id: 3, model: 'nike+air+max', size: 7},
        {id: 4, model: 'nike+air+force', size: 8},
        {id: 5, model: 'adidas+ultra+boost', size: 9},
        {id: 6, model: 'nike+vapor+max', size: 10},
        {id: 7, model: 'yeezy', size: 11}
      ]);
    });
};
