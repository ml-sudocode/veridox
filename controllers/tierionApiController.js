const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
const SHA256 = require("crypto-js/sha256")
const TierionRecord = require('../models/TierionRecord')
const BlockchainReceipt = require('../models/BlockchainReceipt')

// the below uses Data API to create a record (which includes the blockchain_receipt), rather than the Hash API
// show all records
// xhr_getRecords = new XMLHttpRequest()
// xhr_getRecords.onreadystatechange = function () {
//   if (xhr_getRecords.readyState === 4) {
//     console.log(`The default RETURN of xhr_getRecords is:`)
//     console.log(xhr_getRecords)
//     console.log(`xhr_getRecords.responseText is:`)
//     console.log(JSON.parse(xhr_getRecords.responseText))
//   }
// }
// const method = "GET"
// const datastoreId = 3053
// // This url can be further specified to pull xx records, from a certain time frame, using query params e.g. ...records?datastoreId=95&pageSize=5&page=10&startDate=1430955005&endDate=1444559468. If not specified, defaults are: 1 page, 100 records (page size), datastore creation time, time now
// const urlToGetRecords = `https://api.tierion.com/v1/records?datastoreId=${datastoreId}`
// xhr_getRecords.open(method, urlToGetRecords, true)
// // stick email and api key into .env file, for security?
// xhr_getRecords.setRequestHeader("X-Username", "michelle.y.lai@gmail.com")
// xhr_getRecords.setRequestHeader("X-Api-Key", "w+2WHLUX7KdcJzaaTar+NT5BQZ12TZMDvykV2ZFjCu8=")
// xhr_getRecords.setRequestHeader("Content-Type", "application/json")
// xhr_getRecords.send()

// create record
function createRecord (dataFromUser, entryId, callback) {
  const xhr_createRecord = new XMLHttpRequest()
  xhr_createRecord.onreadystatechange = function () {
    if (xhr_createRecord.readyState === 4) {
      // console.log(`xhr_createRecord is:`)
      // console.log(xhr_createRecord)
      // console.log(`xhr_createRecord.responseText is:`)
      // console.log(JSON.parse(xhr_createRecord.responseText))
      const parsedResText = JSON.parse(xhr_createRecord.responseText)
      const timestamp = parsedResText.timestamp
      const newTierionRecord = new TierionRecord({
        _id: parsedResText.id,
        entry_id: entryId,
        datastore_id: parsedResText.datastoreId,
        status: parsedResText.status,
        dataStringify: JSON.stringify(parsedResText.data),
        json: parsedResText.json,
        hash: parsedResText.SHA256,
        timestamp: timestamp,
        date: new Date(timestamp * 1000)
      })
      newTierionRecord.save(function (err, record) {
        if (err) throw err
        callback(null, record.id)
      })
    }
  }
  const method = "POST"
  const datastoreId = process.env.TIERION_DATASTORE_ID
  const urlToPostRecord = `https://api.tierion.com/v1/records`
  xhr_createRecord.open(method, urlToPostRecord, true)
  // create locals, a default, or a filter for this, for DRY?
  xhr_createRecord.setRequestHeader("X-Username", process.env.TIERION_EMAIL)
  xhr_createRecord.setRequestHeader("X-Api-Key", process.env.TIERION_API_KEY)
  xhr_createRecord.setRequestHeader("Content-Type", "application/json")
  const recordData = JSON.stringify({
    datastoreId: datastoreId,
    data: dataFromUser
  })
  // console.log(recordData)
  xhr_createRecord.send(recordData)
}

// show one record
// showRecord returns two more fields than createRecord: blockchain_receipt and insights
function saveBlockchainReceipt (recordId, callback) {

  const xhr_showRecord = new XMLHttpRequest()
  xhr_showRecord.onreadystatechange = function () {
    if (xhr_showRecord.readyState === 4) {
      // console.log(`The default RETURN of xhr_showRecord is:`)
      // console.log(xhr_showRecord)
      const parsedResText = JSON.parse(xhr_showRecord.responseText)
      const receiptObj = parsedResText.blockchain_receipt
      // console.log(receiptObj)
      const newReceipt = new BlockchainReceipt({
        // note that this recordId is NOT a reference, because it was giving me this error. I changed the type in the BlockchainReceipt model to String rather than ObjectId. ValidationError: BlockchainReceipt validation failed: tierion_record_id: Cast to ObjectID failed for value "VMMLFetBgkiC21L4GaHrgA" at path "tierion_record_id"
        tierion_record_id_as_string: recordId,
        "@context": receiptObj["@context"],
        type: receiptObj.type,
        targetHash: receiptObj.targetHash,
        merkleRoot: receiptObj.merkleRoot,
        // [AXN] below are stand-ins, need to check compliance with sub schema
        proof: receiptObj.proof,
        anchors: receiptObj.anchors
      })
      newReceipt.save(function (err, receipt) {
        if (err) throw err
        callback(null, receipt.id)
      })
    }
  }
  const method = "GET"
  const record_id = recordId
  const urlToShowRecord = `https://api.tierion.com/v1/records/VMMLFetBgkiC21L4GaHrgA`
  // const urlToShowRecord = `https://api.tierion.com/v1/records/${recordId}`
  xhr_showRecord.open(method, urlToShowRecord, true)
  xhr_showRecord.setRequestHeader("X-Username", process.env.TIERION_EMAIL)
  xhr_showRecord.setRequestHeader("X-Api-Key", process.env.TIERION_API_KEY)
  xhr_showRecord.setRequestHeader("Content-Type", "application/json")
  xhr_showRecord.send()
}

// check for updated status in the Tierion record
// [AXN] opps for DRY here; code duplicated in saveBlockchainReceipt
function updateStatus (recordId, callback) {

  const xhr_updateStatus = new XMLHttpRequest()
  xhr_updateStatus.onreadystatechange = function () {
    if (xhr_updateStatus.readyState === 4) {
      const parsedResText = JSON.parse(xhr_updateStatus.responseText)
      const status = parsedResText.status
      if (status === "complete") {
        // look up the record in my db, update the status, and save the record
        // then, get the blockchain receipt data from the same parsedResText above, save into my database (update the existing receipt), and send to the View
      }
    }
  }
  const method = "GET"
  const record_id = recordId
  // [AXN] change to dynamic recordId
  // const urlToShowRecord = `https://api.tierion.com/v1/records/VMMLFetBgkiC21L4GaHrgA`
  const urlToShowRecord = `https://api.tierion.com/v1/records/${recordId}`
  xhr_updateStatus.open(method, urlToShowRecord, true)
  xhr_updateStatus.setRequestHeader("X-Username", process.env.TIERION_EMAIL)
  xhr_updateStatus.setRequestHeader("X-Api-Key", process.env.TIERION_API_KEY)
  xhr_updateStatus.setRequestHeader("Content-Type", "application/json")
  xhr_updateStatus.send()
}

//
// validate receipt (using receipt pulled from Datastore Record)
// xhr_validateReceipt = new XMLHttpRequest()
// xhr_validateReceipt.onreadystatechange = function () {
//   if (xhr_validateReceipt.readyState === 4) {
//     result = JSON.parse(xhr_validateReceipt.responseText)
//     console.log(`result is:`)
//     console.log(result)
//   }
// }
// const method = "POST"
// const urlToValidateReceipt = "https://api.tierion.com/v1/validatereceipt"
// xhr_validateReceipt.open(method, urlToValidateReceipt, true)
// xhr_validateReceipt.setRequestHeader("Content-Type", "application/json")
// const receiptWithKeyName = JSON.stringify({
//   "blockchain_receipt": {
//     "@context": "https://w3id.org/chainpoint/v2",
//     "type": "ChainpointSHA256v2",
//     "targetHash": "476b9a271bf3fffee4c1eeaf353719f4a5437ccd4decc0a9a176dff6baf700f9",
//     "merkleRoot": "945a7a81a84abf938b40ec87c03823faf1f766de931deab21c50673c5ddbb036",
//     "proof": [
//       {
//         "left": "02f83019bca7b6877ea5c10b9ab773352881c3c617d5fb77911a925d73f4f44b"
//       },
//       {
//         "left": "38edaca2a81a9638f8175c5cf687fef9af1d7be12a3405d3163973f3c50a3825"
//       },
//       {
//         "right": "7f05b6c69c80c97cb8d51a40bf573c94b77e47915900795669a0df344dc28f18"
//       }
//     ],
//     "anchors": [
//       {
//         "type": "BTCOpReturn",
//         "sourceId": "0f22cc68a6b265850d29f329a15c9a4b0ff5c68c0f0aff260eff372412b72f54"
//       }
//     ]
//   }
// })
// xhr_validateReceipt.send(receiptWithKeyName)

// delete one record
// TBU!!!

// hash API requires token
// obtain auth token - from backend. This works.
// xhr = new XMLHttpRequest()
// xhr.onreadystatechange = function () {
//   if (xhr.readyState === 4) {
//     console.log(`xhr.responseText is:`)
//     console.log(xhr.responseText)
//   }
// }
// const method = "POST"
// const urlForToken = "https://hashapi.tierion.com/v1/auth/token"
// xhr.open(method, urlForToken, true)
// // xhr.setRequestHeader("Authorization", "Bearer ACCESSTOKENHERE")
// xhr.setRequestHeader("Content-Type", "application/json")
// const jsonCredentials = JSON.stringify({
//   username: "michelle.y.lai@gmail.com",
//   password: "flajo(*$3qkjwe&!Kdas",
// })
// console.log('jsonCredentials is:')
// console.log(jsonCredentials)
// xhr.send(jsonCredentials)

// let authToken = ""
// xhr_refreshToken = new XMLHttpRequest()
// xhr_refreshToken.onreadystatechange = function () {
//   if (xhr_refreshToken.readyState === 4) {
//     // console.log(`xhr_refreshToken.responseText is:`)
//     // console.log(JSON.parse(xhr_refreshToken.responseText))
//     authToken = JSON.parse(xhr_refreshToken.responseText).access_token
//     console.log(authToken);
//   }
// }
// const method = "POST"
// const urlForToken = "https://hashapi.tierion.com/v1/auth/refresh"
// xhr_refreshToken.open(method, urlForToken, true)
// // xhr_refreshToken.setRequestHeader("Authorization", "Bearer ACCESSTOKENHERE")
// xhr_refreshToken.setRequestHeader("Content-Type", "application/json")
// const jsonRefreshToken = JSON.stringify({
//   refreshToken: "cbdee5ca506ba67a87513c4e12c80b137c434998"
// })
// xhr_refreshToken.send(jsonRefreshToken)

// obtain auth token - from front end. This works.
// app.get("/gettoken", function (req, res){
//   res.render('gettoken')
// })
//
// app.post("/gettoken", function (req, res){
//   console.log("req.body is: ")
//   console.log(req.body)
//   console.log("reqs is: ")
//   console.log(res)
// })

// hash api test test
// let hash = SHA256("test")
// // console.log(hash)
// // console.log(`This is the hex? ${hash}`)
// xhr_submitHash = new XMLHttpRequest()
// xhr_submitHash.onreadystatechange = function () {
//   if (xhr_submitHash.readyState === 4) {
//     receiptId = JSON.parse(xhr_submitHash.responseText).receiptId
//     console.log(`receiptId is: ${receiptId}`)
//     timestamp = JSON.parse(xhr_submitHash.responseText).timestamp
//     console.log(`timestamp is: ${timestamp}`)
//   }
// }
// const method = "POST"
// const urlToSubmitHash = "https://hashapi.tierion.com/v1/hashitems"
// xhr_submitHash.open(method, urlToSubmitHash, true)
// // remove this authToken definition after this test, otherwise duplicate
// let authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU5OWVhMDI1YjhhZjBhMmY2ZDc0NTQxMSIsInJscyI6MTAwLCJybGgiOjEwMDAsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE1MDQzMjkyNjMsImV4cCI6MTUwNDMzMjg2MywianRpIjoiODZkNDU4NTY0YjQ1NTg4MTMyZTJmZTQ5Y2UxZTM5MTUxNzcyOTNkMCJ9.yeAmdaVlz3JiDEGghUFoqNN6Yt8CwRvwwDQz_EBREu4"
// xhr_submitHash.setRequestHeader("Authorization", `Bearer ${authToken}`)
// xhr_submitHash.setRequestHeader("Content-Type", "application/json")
// const hashInJson = JSON.stringify({
//   hash: hash.toString()
// })
// xhr_submitHash.send(hashInJson)

// Hash API showreceipt
// xhr_getReceipt = new XMLHttpRequest()
// xhr_getReceipt.onreadystatechange = function () {
//   if (xhr_getReceipt.readyState === 4) {
//     receipt = JSON.parse(xhr_getReceipt.responseText)
//     console.log(`receipt is:`)
//     console.log(receipt)
//   }
// }
// const method = "GET"
// let receiptId = "59aa4195b8af0a2f6d750e19"
// const urlToGetReceipt = `https://hashapi.tierion.com/v1/receipts/${receiptId}`
// xhr_getReceipt.open(method, urlToGetReceipt, true)
// // remove this authToken definition after this test, otherwise duplicate
// let authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU5OWVhMDI1YjhhZjBhMmY2ZDc0NTQxMSIsInJscyI6MTAwLCJybGgiOjEwMDAsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE1MDQzMjkyNjMsImV4cCI6MTUwNDMzMjg2MywianRpIjoiODZkNDU4NTY0YjQ1NTg4MTMyZTJmZTQ5Y2UxZTM5MTUxNzcyOTNkMCJ9.yeAmdaVlz3JiDEGghUFoqNN6Yt8CwRvwwDQz_EBREu4"
// xhr_getReceipt.setRequestHeader("Authorization", `Bearer ${authToken}`)
// xhr_getReceipt.setRequestHeader("Content-Type", "application/json")
// xhr_getReceipt.send()

// validate receipt (using Data API, but inputing receipt generated by HashAPI)
// xhr_validateReceipt = new XMLHttpRequest()
// xhr_validateReceipt.onreadystatechange = function () {
//   if (xhr_validateReceipt.readyState === 4) {
//     result = JSON.parse(xhr_validateReceipt.responseText)
//     console.log(`result is:`)
//     console.log(result)
//   }
// }
// const method = "POST"
// const urlToValidateReceipt = "https://api.tierion.com/v1/validatereceipt"
// xhr_validateReceipt.open(method, urlToValidateReceipt, true)
// // remove this authToken definition after this test, otherwise duplicate
// I don't think authtoken / the header is required for validatereceipt
// let authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU5OWVhMDI1YjhhZjBhMmY2ZDc0NTQxMSIsInJscyI6MTAwLCJybGgiOjEwMDAsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE1MDQzMjkyNjMsImV4cCI6MTUwNDMzMjg2MywianRpIjoiODZkNDU4NTY0YjQ1NTg4MTMyZTJmZTQ5Y2UxZTM5MTUxNzcyOTNkMCJ9.yeAmdaVlz3JiDEGghUFoqNN6Yt8CwRvwwDQz_EBREu4"
// xhr_validateReceipt.setRequestHeader("Authorization", `Bearer ${authToken}`)
// xhr_validateReceipt.setRequestHeader("Content-Type", "application/json")
// const receipt = JSON.stringify({
//   // i had to append "blockchain_" to "receipt" in the receipt obtained from getReceipt!
//   blockchain_receipt: '{"@context":"https://w3id.org/chainpoint/v2","type":"ChainpointSHA256v2","targetHash":"9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08","merkleRoot":"6645e0bc94a16f17759aff7f5be8503c8ba71076b8a2271c064817a5f1f21d0b","proof":[{"right":"9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"},{"right":"1b84877d76b0ca92ae4356db6c23df1703779f71800c26304257455512b287a3"},{"right":"e86af5be2da327aae9fbf26f69589c35964026581773ed99547eacc176279c49"}],"anchors":[{"type":"BTCOpReturn","sourceId":"6276bbfd938ad619d7e050d2cf8256588bfd4ee366e7e192cd293be3c226548e"}]}'
// })
// the below is copied from the example on https://tierion.com/docs/dataapi#api-tools
// const receipt = JSON.stringify({
//   "blockchain_receipt": {
//     "@context": "https://w3id.org/chainpoint/v2",
//     "type": "ChainpointSHA256v2",
//     "targetHash": "ea34398af3d67245a8bfd607e886ad319d14b94fa9125ce0a1dd3dde6be5148e",
//     "merkleRoot": "2d21167d2f2f73e309d5ac00ab9faaf8b530478c5b64dcd5755511c8a3eccfa3",
//     "proof": [
//       {
//         "left": "f5a1219a1411822736eb68da2bcde1169760a3e7a79262b01d8083d3b2828af2"
//       },
//       {
//         "left": "22c28e5f06104615b3790a3cf64a1844b7e2983889afe026c70cdd8ca9fd41f4"
//       },
//       {
//         "right": "67b7ced55a4db4bb0fbaf2036901888a08ab7d8126556431258017652cf62092"
//       }
//     ],
//     "anchors": [
//       {
//         "type": "BTCOpReturn",
//         "sourceId": "33884d525ca1cc54313fa2f27be4cf3442b35314866851cc7fc5ec3973d80250"
//       }
//     ]
//   },
// })
// xhr_validateReceipt.send(receipt)

module.exports = {
  createRecord,
  saveBlockchainReceipt,
  updateStatus
}
