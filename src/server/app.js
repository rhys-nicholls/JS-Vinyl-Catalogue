const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      Discogs = require('../server/modules/discogs.js');

const token = `jWpfVnLlYPqruBobYHpgftCanMPOzkDXRgkymMlN`; // User token for DiscogsAPI

app.set('view engine', 'ejs');
app.set('views', '/Users/rhysnicholls/Development/WebDev/Vinyl Catalogue/Vinyl Catalogue/dist/views/');
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
  .then(result => {
    res.render('show.ejs', {vinyl: result})
  })

})


app.listen(3000, () => console.log(`Listening on port 3000`));