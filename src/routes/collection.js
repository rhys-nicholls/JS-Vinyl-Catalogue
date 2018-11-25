const express = require('express');
const middleware = require('../middleware/index');
const Vinyl = require('../models/vinyl');
const Discogs = require('../modules/discogs.js');

const router = express.Router();

// To be hidden when in production
const key = 'mzyVxGVrLGQwIjqViCeS'; // Key for DiscogsAPI
const secret = 'rKMIXAiOABcXlIVTuiBDunruiYCEXzqr'; // Secret for Discogs API
// const token = 'jWpfVnLlYPqruBobYHpgftCanMPOzkDXRgkymMlN'; // User token for DiscogsAPI

// INDEX - Show all Vinyls in collection
router.get('/', middleware.isLoggedIn, (req, res) => {
  Vinyl.find({ 'owner.id': res.locals.currentUser.id })
    .then(vinyls => res.render('collection', { vinyls }));
});

// SHOW - Show page for adding a new Vinyl to collection
router.get('/new', middleware.isLoggedIn, (req, res) => res.render('collection/new'));

// CREATE - Add new Vinyl to db
router.post('/new', middleware.isLoggedIn, (req, res) => {
// Params to be added to Discogs API call
  const params = {
    title: req.body.title,
    artist: req.body.artist,
    country: req.body.country,
    format: 'vinyl', // Vinyl format used to narrow down search results
    type: 'release', // Release type used to narrow down search results
    key,
    secret,
  };

  Discogs.createVinyl(params).then((result) => {
    Vinyl.create(result, (err, newlyCreated) => {
      if (err) {
        console.error(err);
        req.flash('error', 'Could not find Vinyl. Try selecting a different region');
      } else {
        const newVinyl = newlyCreated;
        newVinyl.condition = req.body.condition;
        newVinyl.owner.id = req.user.id;
        newVinyl.save();
        Discogs.getPrice(result.discogsId).then((price) => {
          req.flash('success', 'Vinyl Successfully Added');
          res.render('collection/show', { vinyl: newlyCreated, price });
        });
      }
    });
  });
});

// SHOW - for an individual vinyl
router.get('/:id', middleware.isLoggedIn, (req, res) => {
  Vinyl.findById(req.params.id).then((vinyl) => {
    const foundVinyl = vinyl;
    Discogs.getPrice(foundVinyl.discogsId).then((price) => {
      foundVinyl.price = price;
      res.render('collection/show', { vinyl });
    });
  });
});

// DESTROY - Destroy route
router.delete('/:id', middleware.isLoggedIn, (req, res) => {
  Vinyl.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      req.flash('error', 'There was an error. Please try again');
      res.redirect('/collection');
    } else {
      req.flash('success', 'Vinyl removed from your collection');
      res.redirect('/collection');
    }
  });
});

// SHOW - Edit existing vinyl
router.get('/:id/edit', middleware.isLoggedIn, (req, res) => {
  Vinyl.findById(req.params.id, (err, foundVinyl) => {
    res.render('collection/edit', { vinyl: foundVinyl });
  });
});

// UPDATE - Update existing vinyl
router.put('/:id', middleware.isLoggedIn, (req, res) => {
  console.log(req.body.vinyl);
  Vinyl.findByIdAndUpdate(req.params.id, req.body.vinyl, (err, updatedVinyl) => { // eslint-disable-line
    if (err) {
      req.flash('error', 'There was an error. Please try again');
      res.redirect('/collection');
    } else {
      req.flash('success', 'Vinyl Successfully Edited');
      res.redirect(`/collection/${req.params.id}`);
    }
  });
});

module.exports = router;
