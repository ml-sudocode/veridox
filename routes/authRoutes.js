// create a router from express. Then create routes for these pages: login, signup and resetpassword
// need to require passport as well to use "isAuthenticated" function, which is used to []
// also need to require the controllers files as we direct all routes to them

const express = require('express')
const router = express.Router()
const passport = require('passport')
const authController = require('../controllers/authController')

// create function to determine what happens if use navigates to a page that requires log in
function authenticatedUser (req, res, next) {
  // if user is authenticated, then we proceed with the next callback
  if (req.isAuthenticated()) return next()
  // if user is not authenticated, show error message via flash and redirect to login page
  req.flash('errorMessage', 'Log in to access!')
  return res.redirect('/login')
}

// create function to determine what happens if use navigates to a page that requires user to be logged out
function unauthenticatedUser (req, res, next) {
  // if user is NOT authenticated, then we proceed with the next callback
  if (!req.isAuthenticated()) return next()
  // if user is authenticated, show error message via flash and redirect to [?]]
  req.flash('info', 'You are already logged in!')
  // the above flash definition (label = info, message = you are logged in) is PASSED to the session
  return res.redirect('/user/dashboard')
}

// login routes
router.route('/login')
  .get(unauthenticatedUser, authController.getLogin)
  .post(authController.postLogin)

// signup routes
router.route('/signup')
  .get(unauthenticatedUser, authController.getSignup)
  .post(authController.postSignup)

// logout route
router.route("/logout")
  .get(authController.getLogout)

// export router
module.exports = router
