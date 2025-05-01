require('dotenv').config();

const ENV = process.env.NODE_ENV || 'development';

const CONFIG = {
  app: {
    port: process.env.PORT || 1337,
    env: ENV
  },

  paypal: {
    client_id: process.env.PAYPAL_CLIENT_ID || 'sample-sandbox-client-id',
    client_secret: process.env.PAYPAL_CLIENT_SECRET || 'sample-sandbox-client-secret',
    api_base: ENV === 'production'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com'
  },

  email: {
    user: process.env.EMAIL_USER || 'sample-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'sample-email-password'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your_default_jwt_secret'
  }
};

module.exports = CONFIG;