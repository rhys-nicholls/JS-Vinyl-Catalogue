const express = require('express'),
      app = express(),
      Discogs = require('../js/modules/discogs.js');

const token = `jWpfVnLlYPqruBobYHpgftCanMPOzkDXRgkymMlN`; // User token for DiscogsAPI

app.use(express.static('/dist'));

app.get('/', (req, res) => {
 Discogs.createVinyl({
  title: 'Yesterdays Gone',
  artist: 'Loyle Carner',
  country: 'Europe',
  format: `vinyl`,
  token
  }).then(res => console.log(res))
})


app.listen(3000, () => console.log(`Listening on port 3000`));