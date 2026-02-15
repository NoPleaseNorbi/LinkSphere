const axios = require("axios");

const createAtlassianClient = (email, apiToken, domain) => {    
  return axios.create({
    baseURL: `https://${domain}`,
    headers: {
      'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}

module.exports = createAtlassianClient;