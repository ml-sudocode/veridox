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
require('dotenv').config()

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
// app.use(methodOverride(function (req, res) {
//   if (req.body && typeof req.body === 'object' && '_method' in req.body) {
//     var method = req.body._method
//     delete req.body._method
//     return method
//   }
// }))
// alternatively, as used in brian's project: app.use(methodOverride('_method'))
app.use(methodOverride('_method'))

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
