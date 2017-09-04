// before everything else. load the .env file
// require modules
// create the app
// set up DB (location) and connect to mongoose ODM
// enable sessions functionality. connect sessions to mongoose > the database
// initialize authentication (passport), then connect to [sessions > mongoose > the database]
// set up morgan (to log http requests in the shell)
// install flash middleware
// set up body parser to handle requests
// set up methodOverride
// state the static/public directory
// set views engine
// set routes to use
// mount the app and start listening on the designated port

// load the .env file
// require('dotenv').config()

// require modules
// Key modules: express sessions mongoose passport handlebars. Auxiliary: body-parser, MongoStore/connect-mongo, methodOverride, morgan. Note: passport strategies, e.g. passport-local, are required in the passport.js file, not here! Morgan only required below, after app is created
const express = require('express')
// create the app
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')
const exphbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
// connect the session to mongoose > the database
const MongoStore = require('connect-mongo')(session)
const methodOverride = require('method-override')
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
var SHA256 = require("crypto-js/sha256");

// prep mongoose
mongoose.Promise = global.Promise

// set up DB (location) and connect to mongoose ODM
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/veridox'
mongoose.connect(url, {
  useMongoClient: true
}).then(
  function () { // this is the resolve callback
    console.log(`connected successfully to mongodb at server location ${url}`)
  },
  function (err) { // this is the error callback
    console.log(`connection error: ${err}`)
  }
)

// enable sessions functionality. connect sessions to mongoose > the database
app.use(session({
  store: new MongoStore({
    url: url
  }),
  secret: 'salty bacon and creamy eggs make a delectable breakfast',   // the secret that verifies that the cookie sent back by client is valid. it salts the session id that is returned (??? i think)
  resave: false,            // convention
  saveUninitialized: true   // convention
}))

// initialize authentication (passport), then connect to [sessions > mongoose > the database]
  // initialize passport
app.use(passport.initialize())
  // the line below must be AFTER the session setup
app.use(passport.session())
// [AXN] what does this do?
require('./config/passport')(passport)

  // set up morgan (to log http requests in the shell)
app.use(require('morgan')('dev'))

// install flash middleware. Flash depends on cookieParser, so have to set that up too
app.use(cookieParser());
app.use(flash());

// set up body parser to handle requests
  // requests submitted via ajax
app.use(bodyParser.json())
  // requests submitted via form submission
app.use(bodyParser.urlencoded({extended: true}))

// set up methodOverride [AXN not yet sure where and how this would be used]
app.use(methodOverride(function(req, res) {
  if(req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}))
// alternatively, as used in brian's project: app.use(methodOverride('_method'))

// this doesn't work: "req" is not defined. How to fix it???
// app.locals = {
//   user: req.user
// }

// state the static/public directory
app.use(express.static('public'))

// set views engine
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')
// do i need this?
// app.set("views", __dirname + "/views");

// set routes to use
app.get('/', function (req, res) {
  res.render('index')
})

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

// hashtest
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

// showreceipt
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

// validate receipt (using receipt generated by HashAPI)
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
// xhr_createRecord = new XMLHttpRequest()
// xhr_createRecord.onreadystatechange = function () {
//   if (xhr_createRecord.readyState === 4) {
//     // console.log(`The default RETURN of xhr_createRecord is:`)
//     // console.log(xhr_createRecord)
//     // console.log(`xhr_createRecord.responseText is:`)
//     // console.log(JSON.parse(xhr_createRecord.responseText))
//     const parsedResText = JSON.parse(xhr_createRecord.responseText)
//     const recordId = parsedResText.id
//     const dataObject = parsedResText.data
//     const dataJsonString = parsedResText.json
//     const hash = parsedResText.sha256
//     const timestamp = parsedResText.timestamp
//     const date = new Date(timestamp * 1000)
//     // const dateValues = [
//     //    date.getUTCFullYear(),
//     //    date.getUTCMonth()+1,
//     //    date.getUTCDate(),
//     //    date.getUTCHours(),
//     //    date.getUTCMinutes(),
//     //    date.getUTCSeconds(),
//     // ]
//     // const dateForHumans = dateValues.join("-")
//   }
// }
// const method = "POST"
// const datastoreId = 3053
// const urlToPostRecord = `https://api.tierion.com/v1/records`
// xhr_createRecord.open(method, urlToPostRecord, true)
// // stick email and api key into .env file, for security?
// // create locals, a default, or a filter for this, for DRY?
// xhr_createRecord.setRequestHeader("X-Username", "michelle.y.lai@gmail.com")
// xhr_createRecord.setRequestHeader("X-Api-Key", "w+2WHLUX7KdcJzaaTar+NT5BQZ12TZMDvykV2ZFjCu8=")
// xhr_createRecord.setRequestHeader("Content-Type", "application/json")
// const recordData = JSON.stringify({
//   datastoreId: datastoreId,
//   data: "test"
// })
// xhr_createRecord.send(recordData)

// show one record
// xhr_showRecord = new XMLHttpRequest()
// xhr_showRecord.onreadystatechange = function () {
//   if (xhr_showRecord.readyState === 4) {
//     console.log(`The default RETURN of xhr_showRecord is:`)
//     console.log(xhr_showRecord)
//     const parsedResText = JSON.parse(xhr_showRecord.responseText)
//     const data = parsedResText.data
//     console.log(data)
//     const timestamp = parsedResText.timestamp
//     const date = new Date(timestamp * 1000)
//     console.log(date)
//     const receipt = parsedResText.blockchain_receipt
//     console.log(receipt)
//   }
// }
// const method = "GET"
// const recordId = "c1BMEDWP0ECKdn1_1P7-lg"
// const urlToShowRecord = `https://api.tierion.com/v1/records/${recordId}`
// xhr_showRecord.open(method, urlToShowRecord, true)
// xhr_showRecord.setRequestHeader("X-Username", "michelle.y.lai@gmail.com")
// xhr_showRecord.setRequestHeader("X-Api-Key", "w+2WHLUX7KdcJzaaTar+NT5BQZ12TZMDvykV2ZFjCu8=")
// xhr_showRecord.setRequestHeader("Content-Type", "application/json")
// xhr_showRecord.send()

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

// routes for auth and user
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
app.use('/auth', authRoutes)
app.use('/user', userRoutes)

// other generic routes
  // they have their own controller file
const rootController = require('./controllers/rootController')
app.route('/verify')
  .get(rootController.getVerify)
  .post(rootController.postVerify)

app.get('/features', rootController.getFeatures)

app.route('/contact')
  .get(rootController.getContact)
  // .post(rootController.postContact)

// mount the app and start listening on the designated port
const port = process.env.PORT || 5000
app.listen(port, function () {
  console.log(`express is running on port ${port}`)
})
