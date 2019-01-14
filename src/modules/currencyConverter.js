const axios = require('axios');

const Conversions = {};

Conversions.convertCurrency = (value, convertFrom, convertTo) => new Promise((resolve) => {
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

Conversions.getConversionRate = (convertFrom, convertTo) => new Promise((resolve) => {
  axios
    .get(
      `https://api.exchangeratesapi.io/latest?base=${convertFrom}&symbols=${convertTo}`,
    )
    .then((res) => {
      const rate = res.data.rates[convertTo];
      resolve(rate);
    })
    .catch(err => console.log(err));
});

// eslint-disable-next-line consistent-return
Conversions.formatToCurrency = (amount, currency) => {
  if (currency === 'GBP') {
    const formatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    });

    return formatter.format(amount);
  }

  if (currency === 'USD') {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });

    return formatter.format(amount);
  }
};

module.exports = Conversions;
