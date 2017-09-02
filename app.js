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
// const passport = require('passport')
const flash = require('connect-flash')
const exphbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
// connect the session to mongoose > the database
const MongoStore = require('connect-mongo')(session)
// const methodOverride = require('method-override')
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
var SHA256 = require("crypto-js/sha256");

// prep mongoose
mongoose.Promise = global.Promise

// set up DB (location) and connect to mongoose ODM
// const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-2'
// // const url = 'mongodb://localhost:27017/project-2'
// mongoose.connect(url, {
//   useMongoClient: true
// }).then(
//   function () { // this is the resolve callback
//     console.log(`connected successfully to mongodb at server location ${url}`)
//   },
//   function (err) { // this is the error callback
//     console.log(`connection error: ${err}`)
//   }
// )

// enable sessions functionality. connect sessions to mongoose > the database
// app.use(session({
//   store: new MongoStore({
//     url: url
//   }),
//   secret: 'this is my secret salt',   // the secret that verifies that the cookie sent back by client is valid. it salts the session id that is returned (??? i think)
//   resave: false,            // convention
//   saveUninitialized: true   // convention
// }))

// initialize authentication (passport), then connect to [sessions > mongoose > the database]
  // initialize passport
// app.use(passport.initialize())
//   // the line below must be AFTER the session setup
// app.use(passport.session())
// // [AXN] what does this do?
// require('./config/passport')(passport)

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
// app.use(methodOverride(function(req, res) {
//   if(req.body && typeof req.body === 'object' && '_method' in req.body) {
//     var method = req.body._method;
//     delete req.body._method;
//     return method;
//   }
// }));
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
  // routes for key pages: homepage, terms & conditions page
  // impt: if i put .use instead of .get, i will end up being served the index.hbs file no matter where i navigate to!!
// app.get('/', function (req, res) {
//   res.render('index')
// })

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

// validate receipt
xhr_validateReceipt = new XMLHttpRequest()
xhr_validateReceipt.onreadystatechange = function () {
  if (xhr_validateReceipt.readyState === 4) {
    result = JSON.parse(xhr_validateReceipt.responseText)
    console.log(`result is:`)
    console.log(result)
  }
}
const method = "POST"
const urlToValidateReceipt = "https://api.tierion.com/v1/validatereceipt"
xhr_validateReceipt.open(method, urlToValidateReceipt, true)
// remove this authToken definition after this test, otherwise duplicate
let authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU5OWVhMDI1YjhhZjBhMmY2ZDc0NTQxMSIsInJscyI6MTAwLCJybGgiOjEwMDAsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE1MDQzMjkyNjMsImV4cCI6MTUwNDMzMjg2MywianRpIjoiODZkNDU4NTY0YjQ1NTg4MTMyZTJmZTQ5Y2UxZTM5MTUxNzcyOTNkMCJ9.yeAmdaVlz3JiDEGghUFoqNN6Yt8CwRvwwDQz_EBREu4"
xhr_validateReceipt.setRequestHeader("Authorization", `Bearer ${authToken}`)
xhr_validateReceipt.setRequestHeader("Content-Type", "application/json")
const receipt = JSON.stringify({
  // i had to append "blockchain_" to "receipt" in the receipt obtained from getReceipt!
  blockchain_receipt: '{"@context":"https://w3id.org/chainpoint/v2","type":"ChainpointSHA256v2","targetHash":"9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08","merkleRoot":"6645e0bc94a16f17759aff7f5be8503c8ba71076b8a2271c064817a5f1f21d0b","proof":[{"right":"9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"},{"right":"1b84877d76b0ca92ae4356db6c23df1703779f71800c26304257455512b287a3"},{"right":"e86af5be2da327aae9fbf26f69589c35964026581773ed99547eacc176279c49"}],"anchors":[{"type":"BTCOpReturn","sourceId":"6276bbfd938ad619d7e050d2cf8256588bfd4ee366e7e192cd293be3c226548e"}]}'
})
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
xhr_validateReceipt.send(receipt)

// app.get('/termsandconditions', function (req, res){
//   res.render('termsandconditions')
// })

// app.get('/termsandconditions', function (req, res){
//   res.render('termsandconditions')
// })
  // routes for auth and user
// const authRoutes = require('./routes/authRoutes')
// const userRoutes = require('./routes/userRoutes')
//
// app.use('/auth', authRoutes)
// app.use('/user', userRoutes)

// mount the app and start listening on the designated port
const port = process.env.PORT || 5000
app.listen(port, function () {
  console.log(`express is running on port ${port}`)
})

// Create questions for the database here (i do not want to create a GUI for this yet). Note that we have to delete all qns before running this section, otherwise there will be several copies of the same question
// const Question = require('./models/Question')
// Question.remove({}, function () {
//   console.log(`questions db cleared`)
// })
// const questionsAllControllers = require('./controllers/questionsAllControllers')
// questionsAllControllers('What are your top 5 principles in life?', 'values')
// questionsAllControllers('What are princples that you used to hold, that you have since rejected or deprioritized?', 'values')
// questionsAllControllers('What makes you happy?', 'values')
// questionsAllControllers('The Four Burners Theory (http://jamesclear.com/four-burners-theory) says that in order to be successful you can only have 2-3 burners on at one time: family, friends, health and work. How do you rank these? How do you think your priorities have changed over the years?', 'values')
// questionsAllControllers('Who are the 5 most important people in your life? Who are the 5 people you spend most of your non-work time with?', 'values')
// questionsAllControllers('The Five Love Languages are widely acknowledged to be: gift giving, quality time, words of affirmation, acts of service (devotion), and physical touch (https://en.wikipedia.org/wiki/The_Five_Love_Languages). How do you rank these? If a category is not important at all, leave it out.', 'communication')
// questionsAllControllers('In your past relationships, were disagreements typically fiesty and passionate, or calm and rational? How quickly were they resolved?', 'communication')
// questionsAllControllers('Do you typically expect your partner to be able to tell when you are upset, or are you quite verbal and proactive in sharing your problems?', 'communication')
// questionsAllControllers('Am i free to talk to you about anything? What topics or history are offlimits?', 'communication')
// questionsAllControllers('Am i doing anything now to make you feel disrespected?', 'communication')
// questionsAllControllers('What are you looking for in your next relationship?', 'intentions')
// questionsAllControllers('What do you think is a reasonable amount of time to date before knowing if you are compatible with someome for the long term? What are some milestones do you think you need to hit together to help determine this?', 'intentions')
// questionsAllControllers('What have you learnt from your past relationships that you would like to apply or avoid in your next one?', 'intentions')
// questionsAllControllers('What are your thoughts regarding marriage?', 'intentions')
// questionsAllControllers('Do you intend to have children? If so, how many? If not, why? If unsure, what are your considerations/', 'intentions')
// console.log(`questions are saved into DB`)
