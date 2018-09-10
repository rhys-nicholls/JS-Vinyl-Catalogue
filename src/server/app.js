const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Discogs = require('../server/modules/discogs.js');
const Vinyl = require('./models/vinyl');

const app = express();
const token = 'jWpfVnLlYPqruBobYHpgftCanMPOzkDXRgkymMlN'; // User token for DiscogsAPI

app.set('view engine', 'ejs');
app.set('views', './dist/views');
app.use(express.static('/dist'));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost/vinyl_collection', { useNewUrlParser: true });

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/', (req, res) => {
  const params = {
    title: req.body.title,
    artist: req.body.artist,
    country: req.body.country,
    format: 'vinyl',
    token,
  };

  Discogs.createVinyl(params).then((result) => {
    Vinyl.create(result, (err, newlyCreated) => {
      if (err) {
        console.error(err);
      } else {
        const newVinyl = newlyCreated;
        newVinyl.condition = req.body.condition;
        newVinyl.save();
        Discogs.getPrice(result.discogsId).then((price) => {
          res.render('show', { vinyl: newlyCreated, price });
        });
      }
    });
  });
});

app.listen(3000, () => console.log('Listening on port 3000'));
