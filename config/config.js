const dotenv = require('dotenv');
// Setup the configurations to be used by the app
dotenv.config({ path: './config/.env' });

// Configure settings
const settings = {
  development: {
    server: {
      port: 3000,
      sendgrid_key: process.env.SENDGRID_API_KEY,
      secret: process.env.SECRET_KEY
    }
  }, 
  production: {
    server: {
      port: 3000,
      sendgrid_key: process.env.SENDGRID_API_KEY,
      secret: process.env.SECRET_KEY
    }
  }
}
module.exports = settings;

