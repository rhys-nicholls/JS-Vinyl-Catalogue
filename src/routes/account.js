const express = require('express');
const passport = require('passport');
const User = require('../models/user');

const router = express.Router();


// SHOW - Registration Form
router.get('/register', (req, res) => {
  res.render('register');
});

// Registration Logic
router.post('/register', (req, res) => {
  const newUser = new User({ username: req.body.username });

  User.register(newUser, req.body.password, (err, user) => { // eslint-disable-line
    if (err) {
      console.log(err);
      req.flash('error', err.message);
      return res.redirect('register');
    }
    passport.authenticate('local')(req, res, () => {
      req.flash('success', 'Registration sucessful');
      res.redirect('collection');
    });
  });
});

// SHOW = Login Form
router.get('/login', (req, res) => {
  res.render('index');
});

// Login Logic
router.post('/login', passport.authenticate('local',
  {
    successRedirect: 'collection/',
    failureRedirect: 'login',
  }), (req, res) => {}); // eslint-disable-line

// Logout Logic
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
