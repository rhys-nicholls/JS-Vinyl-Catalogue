const axios = require('axios');

const convertCurrency = (value, convertFrom, convertTo) => new Promise((resolve) => {
  axios
    .get(
      `https://api.exchangeratesapi.io/latest?base=${convertFrom}&symbols=${convertTo}`,
    )
    .then((res) => {
      const result = (value * res.data.rates[convertTo]).toFixed(2);
      resolve(result);
    })
    .catch(err => console.log(err));
});


module.exports = convertCurrency;
