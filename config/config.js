const dotenv = require('dotenv');
// Setup the configurations to be used by the app
dotenv.config({ path: './config/.env' });

// env_vars = {};
// switch(process.env.NODE_ENV){
//     case 'dev':
//         console.log(1);
//         env_vars =  {
//             port: process.env.DEV_PORT,
//             mysql_host: process.env.DEV_MYSQL_HOST,
//             mysql_user: process.env.DEV_MYSQL_USER,
//             mysql_password: process.env.DEV_MYSQL_PASSWORD,
//             mysql_db: process.env.DEV_MYSQL_DB
//         };
//         break;
//     default:
//         console.log(2);
//         env_vars = {
//             port: process.env.LOCAL_PORT,
//             mysql_host: process.env.LOCAL_MYSQL_HOST,
//             mysql_user: process.env.LOCAL_MYSQL_USER,
//             mysql_password: process.env.LOCAL_MYSQL_PASSWORD,
//             mysql_db: process.env.LOCAL_MYSQL_DB
//         };
//         break;
// }
// module.exports = env_vars;

module.exports = {
    port: process.env.PORT,
    mysql_host: process.env.MYSQL_HOST_LOCAL,
    mysql_user: process.env.MYSQL_USER,
    mysql_password: process.env.MYSQL_PASSWORD,
    mysql_db: process.env.MYSQL_DB,
    mysql_port: process.env.MYSQL_PORT
};

