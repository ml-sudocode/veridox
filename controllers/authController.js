// need to require passport to use passport.authenticate
const passport = require('passport')

function getLogin (req, res) {
  res.render('auth/login', {
    message: req.flash('error')[0]
  })
}

function postLogin (req, res) {
  const loginStrategy = passport.authenticate('local-login', {
    successRedirect: "/user/dashboard",
    // if i put "auth/login" here, error: "Cannot GET /auth/auth/login"
    failureRedirect: "/auth/login",
    // I DIDN'T get a flash message... how is this supposed to work? [???]
    failureFlash: true
  })
  return loginStrategy(req, res)
}

function getSignup(req, res) {
  res.render('auth/signup', {
    message: req.flash('error')[0]
  })
}

function postSignup(req, res, next) {
  const signupStrategy = passport.authenticate('local-signup', {
    successRedirect: "/user/dashboard",
    failureRedirect: "/auth/signup",
    failureFlash: true
  })
  return signupStrategy(req, res, next)
}

function getLogout(req, res) {
  req.logout()
  req.flash('info', "Successfully logged out.")
  res.redirect("/")
}


module.exports = {
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  getLogout
}
