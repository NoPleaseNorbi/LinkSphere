const axios = require("axios");
require("dotenv").config();

const { ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN, ATLASSIAN_DOMAIN } = process.env;

const atlassian = axios.create({
  baseURL: `https://${ATLASSIAN_DOMAIN}`,
  auth: {
    username: ATLASSIAN_EMAIL,
    password: ATLASSIAN_API_TOKEN,
  },
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

module.exports = atlassian;
