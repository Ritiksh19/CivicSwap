const https = require('https');

const keepAlive = () => {
  setInterval(() => {
    https.get('https://civicswap-backend.onrender.com/api/health', (res) => {
      console.log(`Keep alive ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.log('Keep alive error:', err.message);
    });
  }, 14 * 60 * 1000);
};

module.exports = keepAlive;