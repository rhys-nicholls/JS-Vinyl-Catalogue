const middleware = {};

middleware.isLoggedIn = (req, res, next) => (req.isAuthenticated() ? next() : res.redirect('/login'));

module.exports = middleware;
