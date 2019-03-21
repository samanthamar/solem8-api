const dotenv = require('dotenv');
// Setup the configurations to be used by the app
dotenv.config({ path: './config/.env' });

// Configure settings
const settings = {
  development: {
    server: {
      port: 3000
    }
  }, 
  production: {
    server: {
      port: 3000
    }
  }
}
module.exports = settings;

