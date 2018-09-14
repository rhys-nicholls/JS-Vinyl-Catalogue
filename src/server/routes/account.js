const express = require('express');
const passport = require('passport');
const User = require('../models/user');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const newUser = new User({ username: req.body.username });

  User.register(newUser, req.body.password, (err, user) => { // eslint-disable-line
    if (err) {
      console.log(err);
      return res.redirect('register');
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('collection/');
    });
  });
});

router.get('/login', (req, res) => {
  res.render('index');
});

router.post('/login', passport.authenticate('local',
  {
    successRedirect: 'collection/',
    failureRedirect: 'login',
  }), (req, res) => {}); // eslint-disable-line

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
