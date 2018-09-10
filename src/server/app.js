const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      Discogs = require('../server/modules/discogs.js');

const token = `jWpfVnLlYPqruBobYHpgftCanMPOzkDXRgkymMlN`; // User token for DiscogsAPI

app.set('view engine', 'ejs');
app.set('views', './dist/views');
app.use(express.static('/dist'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.render('index.ejs');
})

app.post('/', (req, res) => {

  const params = {
    title: req.body.title,
    artist: req.body.artist,
    country: req.body.country,
    format: `vinyl`,
    token
  }

  Discogs.createVinyl(params)
  .then(vinyl => {
    res.render('show', {vinyl: vinyl});
  })
})


app.listen(3000, () => console.log(`Listening on port 3000`));