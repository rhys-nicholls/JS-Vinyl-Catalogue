const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const User = require('./models/user');
const accountRoutes = require('./routes/account');
const collectionRoutes = require('./routes/collection');

const app = express();

mongoose.connect('mongodb://localhost/vinyl_collection', { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', './dist/views');
app.use(express.static('dist'));
app.use(methodOverride('_method'));
app.use(flash());

// Passport Setup
app.use(session({
  secret: 'my name is heman',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// Express Router routes
app.use(accountRoutes);
app.use('/collection', collectionRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => console.log('Listening on port 3000'));
