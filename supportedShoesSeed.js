const db = require('./db');

// Supported sizes 
let sizes = [5,6,7,8,9,10,11,12]
// let sizes = [8,9,10,]
// let sizes = [8]

// Supported models
let models = [
    'jir+aordan',
    'air+jordan',
    'nike+air+max',
    'nike+air+force',
    'adidas+ultra+boost', 
    'nike+vapor+max', 
    'yeezy'
]

models.forEach((model) => {
    sizes.forEach((size) => {
        let q = `insert into supportedShoes (model, size) VALUES ('${model}', ${size})`;
        db.query(q, (err, result) => {
            if (err) throw err; 
            else {
                console.log('Successfully inserted into DB'); 
            }
        });
    })
}); 