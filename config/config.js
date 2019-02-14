const dotenv = require('dotenv');
// Setup the configurations to be used by the app
dotenv.config({ path: './config/.env' });

env_vars = {};
console.log(process.env.NODE_ENV);
switch(process.env.NODE_ENV){
    case 'dev':
        env_vars =  {
            port: process.env.PORT,
            mysql_host: process.env.RDS_HOSTNAME,
            mysql_user: process.env.RDS_USERNAME,
            mysql_password: process.env.RDS_PASSWORD,
            mysql_db: process.env.DEV_MYSQL_DB,
            mysql_port: process.env.MYSQL_PORT
        };
        break;
    default:
        env_vars = {
            port: process.env.PORT,
            mysql_host: process.env.LOCAL_MYSQL_HOST,
            mysql_user: process.env.LOCAL_MYSQL_USER,
            mysql_password: process.env.LOCAL_MYSQL_PASSWORD,
            mysql_db: process.env.LOCAL_MYSQL_DB,
            mysql_port: process.env.MYSQL_PORT
        };
        break;
}
module.exports = env_vars;

// module.exports = {
//     port: process.env.PORT,
//     mysql_host: process.env.MYSQL_HOST_LOCAL,
//     mysql_user: process.env.MYSQL_USER,
//     mysql_password: process.env.MYSQL_PASSWORD,
//     mysql_db: process.env.MYSQL_DB,
//     mysql_port: process.env.MYSQL_PORT
// };

