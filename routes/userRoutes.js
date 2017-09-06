// [AXN] move the functions here into a separate controller fileres.render
const express = require('express')
const router = express.Router()
// const passport = require('passport')

// const Entry = require('../models/Entry')
// const TierionRecord = require('../models/TierionRecord')
// const BlockchainReceipt = require('../models/BlockchainReceipt')

const userController = require('../controllers/userController')

// create function to determine what happens if use navigates to a page that requires log in
function authenticatedUser (req, res, next) {
  // if user is authenticated, then we proceed with the next callback
  if (req.isAuthenticated()) return next()
  // if user is not authenticated, show error message via flash and redirect to login page
  // this flash doesn't seem to work
  req.flash('info', 'Log in to access!')
  res.redirect('/auth/login')
}

router.route('/dashboard')
  .get(authenticatedUser, userController.showDashboard)

router.route('/entries')
  .get(authenticatedUser, userController.indexEntries)
  .post(authenticatedUser, userController.createEntry)

router.route('/entries/new')
  .get(authenticatedUser, userController.newEntry)

router.route('/entries/:id')
    .get(authenticatedUser, userController.showEntry)
    // should this be patch or put? [AXN]
    .put(authenticatedUser, userController.updateEntry)
    .delete(authenticatedUser, userController.destroyEntry)
    .post(authenticatedUser, userController.checkAndUpdate)

router.route('/entries/:id/edit')
  .get(authenticatedUser, userController.editEntry)

module.exports = router
