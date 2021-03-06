const express = require('express');
const middleware = require('../middleware/index');
const Vinyl = require('../models/vinyl');
const Discogs = require('../modules/discogs.js');
const Conversions = require('../modules/currencyConverter');
const keys = require('../config/keys');

const router = express.Router();

// INDEX - Show all Vinyls in collection
router.get('/', middleware.isLoggedIn, (req, res) => {
  Conversions.getConversionRate('USD', 'GBP').then((rate) => {
    Vinyl.find({ 'owner.id': res.locals.currentUser.id })
      .then((vinyls) => {
        let vinylTotalUSD = 0;
        let vinylTotalGBP = 0;

        vinyls.forEach((vinyl) => {
          const priceGBP = (vinyl.priceUSD * rate);
          vinylTotalUSD += vinyl.priceUSD;
          vinylTotalGBP += parseFloat(priceGBP.toFixed(2));
        });

        const formattedUSD = Conversions.formatToCurrency(vinylTotalUSD, 'USD');
        const formattedGBP = Conversions.formatToCurrency(vinylTotalGBP, 'GBP');

        res.render('collection', { vinyls, formattedGBP, formattedUSD });
      });
  });
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
    barcode: req.body.barcode,
    format: 'vinyl', // Vinyl format used to narrow down search results
    type: 'release', // Release type used to narrow down search results
    key: keys.discogsKey,
    secret: keys.discogsSecret,
  };

  Discogs.createVinyl(params).then((result) => {
    if (result === undefined) {
      req.flash('error', 'Could not find Vinyl. Try selecting a different region');
      res.redirect('/collection');
    } else {
      Vinyl.create(result, (err, newlyCreated) => {
        if (err) {
          console.error(err);
        } else {
          const newVinyl = newlyCreated;
          Discogs.getPrice(result.discogsId).then((priceUSD) => {
            Conversions.convertCurrency(priceUSD, 'USD', 'GBP')
              .then((priceGBP) => {
                newVinyl.priceUSD = parseFloat(priceUSD);
                newVinyl.condition = req.body.condition;
                newVinyl.owner.id = req.user.id;
                newVinyl.save();
                newVinyl.priceGBP = priceGBP;
                res.render('collection/show', { vinyl: newVinyl });
              });
          });
        }
      });
    }
  })
    .catch(() => {
      req.flash('error', 'Could not find Vinyl. Try selecting a different region');
      res.redirect('/collection');
    });
});

// SHOW - for an individual vinyl
router.get('/:id', middleware.isLoggedIn, (req, res) => {
  Vinyl.findById(req.params.id).then((vinyl) => {
    const foundVinyl = vinyl;
    Discogs.getPrice(foundVinyl.discogsId).then((price) => {
      Conversions.convertCurrency(price, 'USD', 'GBP')
        .then((priceGBP) => {
          foundVinyl.priceUSD = price;
          foundVinyl.priceGBP = priceGBP;
          res.render('collection/show', { vinyl: foundVinyl });
        });
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
