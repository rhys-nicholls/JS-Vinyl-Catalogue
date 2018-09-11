const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Discogs = require('../server/modules/discogs.js');
const Vinyl = require('./models/vinyl');
const User = require('./models/user');

const app = express();
const token = 'jWpfVnLlYPqruBobYHpgftCanMPOzkDXRgkymMlN'; // User token for DiscogsAPI

app.set('view engine', 'ejs');
app.set('views', './dist/views');
app.use(express.static('/dist'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('express-session')({
  secret: 'my name is heman',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect('mongodb://localhost/vinyl_collection', { useNewUrlParser: true });

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const newUser = new User({ username: req.body.username });

  User.register(newUser, req.body.password, (err, user) => { // eslint-disable-line
    if (err) {
      console.log(err);
      return res.redirect('register');
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('new');
    });
  });
});

app.get('/login', (req, res) => {
  res.render('index');
});

app.post('/login', passport.authenticate('local',
  {
    successRedirect: 'new',
    failureRedirect: 'login',
  }));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/new', (req, res) => res.render('new'));

app.post('/new', (req, res) => {
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
