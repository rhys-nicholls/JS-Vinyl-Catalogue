const express = require('express');
const Vinyl = require('../models/vinyl');
const Discogs = require('../modules/discogs.js');

const router = express.Router();
const token = 'jWpfVnLlYPqruBobYHpgftCanMPOzkDXRgkymMlN'; // User token for DiscogsAPI

router.get('/new', (req, res) => res.render('new'));

router.post('/new', (req, res) => {
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

module.exports = router;
