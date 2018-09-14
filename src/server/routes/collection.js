const express = require('express');
const middleware = require('../middleware/index');
const Vinyl = require('../models/vinyl');
const Discogs = require('../modules/discogs.js');

const router = express.Router();
const key = 'mzyVxGVrLGQwIjqViCeS';
const secret = 'rKMIXAiOABcXlIVTuiBDunruiYCEXzqr';
// const token = 'jWpfVnLlYPqruBobYHpgftCanMPOzkDXRgkymMlN'; // User token for DiscogsAPI

// INDEX - Show all Vinyls in collection
router.get('/', middleware.isLoggedIn, (req, res) => {
  Vinyl.find({ 'owner.id': res.locals.currentUser.id })
    .then(vinyls => res.render('collection', { vinyls }));
});

router.get('/new', middleware.isLoggedIn, (req, res) => res.render('collection/new'));

// CREATE - Add new Vinyl to db
router.post('/new', middleware.isLoggedIn, (req, res) => {
  const params = {
    title: req.body.title,
    artist: req.body.artist,
    country: req.body.country,
    format: 'vinyl',
    type: 'release',
    key,
    secret,
  };

  Discogs.createVinyl(params).then((result) => {
    Vinyl.create(result, (err, newlyCreated) => {
      if (err) {
        console.error(err);
      } else {
        const newVinyl = newlyCreated;
        newVinyl.condition = req.body.condition;
        newVinyl.owner.id = req.user.id;
        newVinyl.save();
        Discogs.getPrice(result.discogsId).then((price) => {
          res.render('collection/show', { vinyl: newlyCreated, price });
        });
      }
    });
  });
});

module.exports = router;
