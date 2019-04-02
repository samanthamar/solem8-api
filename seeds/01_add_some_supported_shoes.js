
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('supportedShoes').del()
    .then(function () {
      // Inserts seed entries
      // Supported sizes 
      let sizes = [5,6,7,8,9,10,11,12]
      // let sizes = [8,9,10,]
      // let sizes = [8]

      // Supported models
      let models = [
          'air+jordan',
          'nike+air+max',
          'nike+air+force',
          'adidas+ultra+boost', 
          'nike+vapor+max', 
          'yeezy'
      ]

      seeds = [];

      models.forEach((model) => {
          sizes.forEach((size) => {
            seeds.push({ model: model, size: size });
          })
      }); 

      return knex('supportedShoes').insert(
        seeds
      );
    });
};
