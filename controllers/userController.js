const Entry = require('../models/Entry')
const TierionRecord = require('../models/TierionRecord')
const BlockchainReceipt = require('../models/BlockchainReceipt')
const tierionApiController = require('./tierionApiController')
const async = require('async')
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest

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
    // console.log('result:')
    // console.log(result)
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

// [AXN-done] When i used just ".find" rather than "".findById", the .find operation didn't return anything
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
      const status = foundRecord.status
      // the variable statusIsComplete holds true or false
      const statusIsComplete = status === 'complete'
      // console.log('statusIsComplete is:')
      // console.log(statusIsComplete)
      if (statusIsComplete === true) {
        BlockchainReceipt.findOne({tierion_record_id_as_string: recordId})
          .populate('anchors')
          .exec(function (err, foundReceipt) {
            if (err) res.send(err)
            // console.log('foundReceipt is:')
            // console.log(foundReceipt)
            // note that i cannot define sourceId inside the if statement (const sourceId = ...), if i want to access it in the res.render below
            let sourceId = ''
            if (foundReceipt.anchors.length > 0) {
              sourceId = foundReceipt.anchors[0].sourceId
            } else {
              sourceId = false
            }

            const xhr_getBR = new XMLHttpRequest()
            xhr_getBR.onreadystatechange = function () {
              if (xhr_getBR.readyState === 4) {
                let receiptFromTierionApi = ''
                // console.log('JSON.parse(xhr_getBR.responseText).blockchain_receipt is:')
                // console.log(JSON.parse(xhr_getBR.responseText).blockchain_receipt)
                if (JSON.parse(xhr_getBR.responseText).blockchain_receipt) {
                  receiptFromTierionApi = JSON.parse(xhr_getBR.responseText).blockchain_receipt
                } else {
                  receiptFromTierionApi = null
                }
                // console.log('receiptFromTierionApi is:')
                // console.log(receiptFromTierionApi)
                res.render('user/entries/show', {
                  user: req.user,
                  entry: foundEntry,
                  record: foundRecord,
                  receipt: JSON.stringify(receiptFromTierionApi),
                  status: status,
                  statusIsComplete: statusIsComplete,
                  sourceId: sourceId,
                  message: req.flash('info')
                })
              }
            }
            const method = "GET"
            // [AXN] change to dynamic recordId
            const urlToShowRecord = `https://api.tierion.com/v1/records/${recordId}`
            xhr_getBR.open(method, urlToShowRecord, true)
            xhr_getBR.setRequestHeader("X-Username", process.env.TIERION_EMAIL)
            xhr_getBR.setRequestHeader("X-Api-Key", process.env.TIERION_API_KEY)
            xhr_getBR.setRequestHeader("Content-Type", "application/json")
            xhr_getBR.send()
          })
      } else {
        const sourceId = false
        res.render('user/entries/show', {
          user: req.user,
          entry: foundEntry,
          record: foundRecord,
          receipt: false,
          status: status,
          statusIsComplete: statusIsComplete,
          sourceId: sourceId,
          message: req.flash('info')
        })
      }
    }
    )
  })
}

function checkAndUpdate (req, res) {
  // use regex and req.originalUrl to grab the entryId
  var originalUrl = req.originalUrl
  // match '=' and capture everything that follows
  var regex = /=(.+)/
  var matchedPortion = originalUrl.match(regex)
  var entryId = matchedPortion[1]
  console.log('entryId from checkAndUpdate:')
  console.log(entryId)
  // this method below works only when we used form submit, because the form submit / request comes direction from the same page, i.e. /entries/:id
  // const entryId = req.params.id

  // Strange. When i try to pass "entryId" into checkRecord, e.g. function checkRecord(entryId, callback), there are two errors: first, Linter tells me that entryId in the line above "is assigned a value but never used"; second, entryId isn't passed through at all!
  function checkRecord (callback) {
    // console.log('entryId from checkRecord:')
    // console.log(entryId)
    tierionApiController.checkRecordOnCloud(entryId, callback)
  }

  function updateRecordAndReceipt (cloudRecord, callback) {
    const status = cloudRecord.status
    const statusText = "Status of data submission to the blockchain: " + status.toUpperCase()
    // console.log('status is:')
    // console.log(status)
    const blockchain_receipt = cloudRecord.blockchain_receipt
    let receiptNotAvailText = 'Sorry, the blockchain receipt is not yet available. Please try again in 1 minute.'
    // if status is complete or unpublished, update the status in the record in my DB
    if (status === "complete" || status === "unpublished") {
      TierionRecord.findOneAndUpdate({entry_id: entryId}, {$set: {status: status}}, function (err, updatedRecord) {
        if (err) res.send(err)
        if (status === "complete") {
          const dataToAddToReceipt = {
            "@context": blockchain_receipt["@context"],
            type: blockchain_receipt.type,
            targetHash: blockchain_receipt.targetHash,
            merkleRoot: blockchain_receipt.merkleRoot,
            proof: blockchain_receipt.proof,
            anchors: blockchain_receipt.anchors
          }
          BlockchainReceipt.findOneAndUpdate({entry_id: entryId}, {$set: dataToAddToReceipt}, function (err, updatedReceipt) {
            if (err) res.send(err)
            receiptNotAvailText = "Receipt retrieval is complete."
            const dataForViews = [statusText, blockchain_receipt, receiptNotAvailText]
            callback(null, dataForViews)
          })
        }
        if (status === "unpublished") {
          const bRPlaceholder = "No data."
          const dataForViews = [statusText, bRPlaceholder, receiptNotAvailText]
          callback(null, dataForViews)
        }
      })
    } else {
      const bRPlaceholder = "No data."
      const dataForViews = [statusText, bRPlaceholder, receiptNotAvailText]
      callback(null, dataForViews)
    }
  }
  async.waterfall([ checkRecord, updateRecordAndReceipt ], function (err, result) {
    if (err) { console.error("Error :", err) }
    // console.log('result is (dataforViews):')
    // console.log(result)
    // console.log('req.originalUrl is:')
    // console.log(req.originalUrl)
    // /user/entries/59b0529a36507148c0e42080
    // console.log('req.url is:')
    // console.log(req.url)
    // /entries/59b0529a36507148c0e42080
    // console.log("req.header('referrer') is:")
    // console.log(req.header('referrer'))
    // http://localhost:5000/user/entries/59b0529a36507148c0e42080
    // const returnUrl = req.header('referrer').toString()
    // result.push(returnUrl)
    // [AXN] how to do remote scripting, to avoid page refresh? I also don't want to have to re-generate all three docs: entry, record and receipt. Currently my workaround is to send informative text to the browser in the form of res.json; user has to hit Back Button or navigate via URL to exit this page ====================
    res.json(result)
    // res.render('user/entries/show', {
    //   user: req.user,
    //   entry: foundEntry,
    //   record: foundRecord,
    //   receipt: foundReceipt,
    //   status: status,
    //   statusIsComplete: statusIsComplete,
    //   sourceId: sourceId,
    //   message: req.flash('info')
    // })
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
    contractParties: req.body.entry.contract_parties,
    updatedAt: new Date()
  }
  }, { new: true }, function (err, updatedEntry) {
    if (err) return res.send(err)
    req.flash('info', 'Thank you, your edit has been saved.')
    // [AXN-done] DOUBTFUL IF THE BELOW WORKS. Yes it does!
    res.redirect(`/user/entries/${req.params.id}`)
  })
}

function destroyEntry (req, res) {
  // delete the entry, its record, and its receipt
  // [AXN] I tried to implement a pre/post hook to delete the subdocs ie record and receipt, but that didn't work. https://stackoverflow.com/questions/14348516/cascade-style-delete-in-mongoose
  Entry.findByIdAndRemove(req.params.id, function (err) {
    if (err) res.send(err)
    TierionRecord.findOneAndRemove({entry_id: req.params.id}, function (err) {
      if (err) res.send(err)
      BlockchainReceipt.findOneAndRemove({entry_id: req.params.id}, function (err) {
        if (err) res.send(err)
        // flash message to confirm deletion
        req.flash('info', 'Successfully deleted.')
        // redirect to entries path
        res.redirect('/user/entries')
      })
    })
  })
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
  checkAndUpdate,
  updateEntry,
  destroyEntry,
  editEntry
}
