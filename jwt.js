const jwt = require("jsonwebtoken");
const config = require("./config");

//Use the ApiKey and APISecret from config.js
const payload = {
  iss: config.APIKey,
  exp: new Date().getTime() + 5000
};

const token = jwt.sign(payload, config.APISecret);

module.exports = token;
