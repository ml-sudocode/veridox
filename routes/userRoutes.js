// [AXN] move the functions here into a separate controller fileres.render
const express = require('express')
const router = express.Router()
// const passport = require('passport')

const Entry = require('../models/Entry')
// const TierionRecord = require('../models/TierionRecord')
// const BlockchainReceipt = require('../models/BlockchainReceipt')

// const userController = require('../controllers/userController')

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
  .get(authenticatedUser, function (req, res) {
    console.log(`req.user is: `)
    console.log(req.user)             // undefined, until Passport is working
    Entry.find({ user_id: req.user.id }, function (err, entriesFound) {
      if (err) res.send(err)
    })
      .exec(function (err, entriesFound) {
        if (err) res.send(err)
        res.render('user/dashboard', {
          user: req.user,
          entries: entriesFound
          // info: req.flash('info'),
          // error: req.flash('error')
        })
      })
  })

router.route('/entries')
  .get(authenticatedUser, function (req, res) {
    Entry.find({id: req.params.id}, function (err, entriesFound) {
      if (err) res.send(err)
    })
    .exec(function (err, entriesFound) {
      if (err) res.send(err)
      res.render('user/entries/index', {
        user: req.user,           // this passes user to main.hbs, so that the right nav menu is shown
        entries: entriesFound
      })
    })
  })
  .post(authenticatedUser, function (req, res) {
    // save new entry
    const newEntry = new Entry({
      user_id: req.user.id,
      title: req.body.entry.title,
      description: req.body.entry.description,
      contractName: req.body.entry.contract_name,
      contractParties: req.body.entry.contract_parties,
      data: req.body.entry.data
    })
    newEntry.save(function (err, savedEntry) {
      if (err) { return res.send(err) }
    })
    // CHECK IF THIS WORKS [AXN]
    req.flash('info', 'Success, new entry saved!')
    res.redirect('/user/entries')
  })

router.route('/entries/new')
  .get(authenticatedUser, function (req, res) {
    res.render('user/entries/new')
  })

router.route('/entries/:id')
    .get(authenticatedUser, function (req, res) {
      Entry.find({id: req.params.id}, function (err, entryFound) {
        if (err) res.send(err)
      })
      .exec(function (err, foundEntry) {
        if (err) res.send(err)
        res.render('user/entries/show', {
          user: req.user,
          entry: foundEntry
        })
      })
    })
    .post(function (req, res) {
      // this updates the entry
      // [AXN] DOUBTFUL IF THE BELOW WORKS
      Entry.findOneAndUpdate({ id: req.params.id }, { $set: {
        title: req.body.entry.title,
        description: req.body.entry.description,
        contractName: req.body.entry.contract_name,
        contractParties: req.body.entry.contract_parties}
      }, { new: true }, function (err, updatedEntry) {
        if (err) return res.send(err)
        req.flash('info', 'Thank you, your update has been saved.')
        // [AXN] DOUBTFUL IF THE BELOW WORKS
        res.redirect(`/entries/${req.params.id}`)
      })
    })

router.route('/entries/:id/edit')
  .get(authenticatedUser, function (req, res) {
    Entry.find({id: req.params.id}, function (err, foundEntry) {
      if (err) res.send(err)
    })
    .exec(function (err, foundEntry) {
      if (err) res.send(err)
      res.render('user/entries/edit', {
        user: req.user,
        entry: foundEntry
      })
    })
  })

module.exports = router
