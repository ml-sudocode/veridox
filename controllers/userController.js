const Entry = require('../models/Entry')
const TierionRecord = require('../models/TierionRecord')
const BlockchainReceipt = require('../models/BlockchainReceipt')
const tierionApiController = require('./tierionApiController')
const async = require('async')

function showDashboard (req, res) {
  // console.log(`req.user is: `)
  // console.log(req.user)             // undefined, until Passport is working and you are signed in
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
}

function indexEntries (req, res) {
  Entry.find({user_id: req.user.id}, function (err, entriesFound) {
    if (err) res.send(err)
  })
  .exec(function (err, entriesFound) {
    if (err) res.send(err)
    res.render('user/entries/index', {
      user: req.user,           // this passes user to main.hbs, so that the right nav menu is shown
      entries: entriesFound,
      message: req.flash('info')
    })
  })
}

function createEntry (req, res) {
  // console.log('req.body is:')
  // console.log(req.body)
  // save new entry
  const entry = new Entry({
    user_id: req.user.id,
    // this also works
    // user_id: req.body.entry.title,
    title: req.body.entry.title,
    description: req.body.entry.description,
    contractName: req.body.entry.contract_name,
    // contractDate: req.body.entry.contract_date,
    contractParties: req.body.entry.contract_parties,
    data: req.body.entry.data
  })

  function saveEntry (callback) {
    entry.save(function (err, savedEntry) {
    // [AXN] no proper error handling for user
      if (err) { return res.send(err) }
      // console.log('savedEntry is:')
      // console.log(savedEntry)
    // passing savedEntry.id to the callback, so that i can save it to the new TierionRecord
      callback(null, savedEntry.id)
    })
  }

  function createTierionRecord (entryId, callback) {
    // not sure how the sync/async may lead to problems here. might have to use async here? or stick the createRecord function inside save?
    // adding the variable assignment here, and including a "return" statment in the createRecord function, allow me to pass a piece of info from createRecord back into the parent function!
    // console.log('req.body.entry.data is:')
    // console.log(req.body.entry.data)
    tierionApiController.createRecord(req.body.entry.data, entryId, callback)
    // moved this callback function to the .createRecord function, because the latter is async, meaning that recordId will not be entered into callback(null, recordId)
    // callback(null, recordId)
  }

  function saveBlockchainReceipt (recordId, callback) {
    tierionApiController.saveBlockchainReceipt(recordId, callback)
  }

  async.waterfall([ saveEntry, createTierionRecord, saveBlockchainReceipt ], function (err, result) {
    if (err) { console.error("Error :", err) }
    console.log('result:')
    console.log(result)
    // ***** The below code is based on using .series instead of .waterfall. Leaving this in, and the comments, because good lesson on .exec, .then (+res.redirect), and how to manage async nature of model operations
    // we need to enter the entry_id (parent) field in the record (child)
    // TierionRecord.findById(recordId, function (err, foundRecord) {
    //   if (err) res.send(err)
    //   foundRecord.entry_id = entryId
    //   // udpating the field doesn't save it!!! Need to .save()!!!
    //   foundRecord.save()
    // })
    //   doing the record updating in .exec, instead of inside findById, is totally extraneous
    //   .exec(function (err, foundRecord) {
    //     foundRecord.entry_id = entryId
    //   })
    //   after the query, can use a promise i.e. .then! Helps with the async nature of the query, i.e. what's in the .then will not be executed until everything in the query is run
    //   .then(function (savedRecord) {
    //     req.flash('info', 'Success, new entry saved!')
    //     res.redirect('/user/entries')
    //   })
    // CHECK IF THIS WORKS [AXN-done]. Works!
    req.flash('info', 'Success, new entry saved!')
    res.redirect('/user/entries')
  })
}

function newEntry (req, res) {
  res.render('user/entries/new')
}

// [AXN-done] When i used just ".find" rather than "".findById", the find operation didn't return anything
function showEntry (req, res) {
  Entry.findById(req.params.id, function (err, foundEntry) {
    if (err) res.send(err)
  })
  .exec(function (err, foundEntry) {
    // console.log('foundEntry is')
    // console.log(foundEntry)
    if (err) res.send(err)
    // find record, find its blockchain receipt, and pass the sourceId argument into the res.render
    // BE CAREFUL: .find returns an ARRAY of documents. Compare: .findOne returns just the first document
    TierionRecord.findOne({entry_id: foundEntry.id}, function (err, foundRecord) {
      if (err) res.send(err)
      // console.log('foundRecord is')
      // console.log(foundRecord)
      const recordId = foundRecord.id
      BlockchainReceipt.findOne({tierion_record_id_as_string: recordId})
        .populate('anchors')
        .exec(function (err, foundReceipt) {
          if (err) res.send(err)
          // console.log('foundReceipt is:')
          // console.log(foundReceipt)
          const sourceId = foundReceipt.anchors[0].sourceId
          res.render('user/entries/show', {
            user: req.user,
            entry: foundEntry,
            message: req.flash('info'),
            status: foundRecord.status,
            sourceId: sourceId
          })
        })
    })
  })
}

function updateRecordAndReceipt (req, res) {
  console.log('successfully entered updateRecordAndReceipt function')
  Entry.findById(req.params.id, function (err, foundEntry) {
    if (err) res.send(err)
  })
  .exec(function (err, foundEntry) {
    if (err) res.send(err)
    // console.log(req.params.id)
    // console.log(foundEntry)
    TierionRecord.find({entry_id: foundEntry.id}, function (err, foundRecord) {
      const status = foundRecord.status
      console.log(status)
      if (status !== "complete") {
        // run API to get blockchain receipt status in the Tierion record
      }
    })
  })
  .then(function (err, foundEntry) {
    res.render('user/entries/show', {
      user: req.user,
      entry: foundEntry,
      message: req.flash('info'),
      status: foundEntry.status,
      sourceId: 'TBC'
    })
  })
}

function updateEntry (req, res) {
  // [AXN] STRONG PARAMS TO PREVENT SOMEONE FROM UPDATING THE DATA, DATE, AND OTHER FIELDS

  // console.log('req.body is:')
  // console.log(req.body)
  // console.log('req.params is:')
  // console.log(req.params)
  // this updates the entry
  // [AXN-done] DOUBTFUL IF THE BELOW WORKS. NEED TO FIGURE OUT HOW TO CONFIGURE THE FORM FOR PUT/PATCH! It works!!!
  Entry.findByIdAndUpdate(req.params.id, { $set: {
    title: req.body.entry.title,
    description: req.body.entry.description,
    contractName: req.body.entry.contract_name,
    contractParties: req.body.entry.contract_parties}
  }, { new: true }, function (err, updatedEntry) {
    if (err) return res.send(err)
    req.flash('info', 'Thank you, your update has been saved.')
    // [AXN-done] DOUBTFUL IF THE BELOW WORKS. Yes it does!
    res.redirect(`/user/entries/${req.params.id}`)
  })
}

function destroyEntry (req, res) {
  // TBC [AXN]
}

function editEntry (req, res) {
  Entry.findById(req.params.id, function (err, foundEntry) {
    if (err) res.send(err)
  })
  .exec(function (err, foundEntry) {
    if (err) res.send(err)
    res.render('user/entries/edit', {
      user: req.user,
      entry: foundEntry
    })
  })
}

module.exports = {
  showDashboard,
  indexEntries,
  createEntry,
  newEntry,
  showEntry,
  updateRecordAndReceipt,
  updateEntry,
  destroyEntry,
  editEntry
}
