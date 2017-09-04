// require the modules that allow me to create a schema and generate the model
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bcrypt = require('bcrypt')

// create schema
// const referralSchema = new Schema({
//   referToken: String,
//   referrer: {type: Schema.Types.ObjectId, ref: 'User'},
//   referreds: [{type: Schema.Types.ObjectId, ref: 'User'}]
// })

// create schema
const userSchema = new Schema({
  firstname: {
    type: String,
    required: [true, 'Please type your name']
  },
  email: {
    type: String,
    required: [true, 'Please type your email'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    minlength: [8, 'Password too short']
  },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  // this is an embedded schema
  // referral: [referralSchema],
  // these are referenced schemas
  entries: [{
    type: Schema.Types.ObjectId,
    ref: 'Entry'
  }]
})

// pre save hook to hash pwd before saving to DB. copied from placies repo
userSchema.pre('save', function (next) {
  var user = this
   // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next()

  // hash the password
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err)
    // Override the cleartext password with the hashed one
    user.password = hash
    next()
  })
})

// assign a method so that passport.js file can define how a password submitted in a request can be compared
userSchema.methods.validPassword = function (givenPassword) {
  // t/f based on the user.hashed compared with form.password
  return bcrypt.compareSync(givenPassword, this.password)
}

// pre save hook to insert creation and updated dates. copied from https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
userSchema.pre('save', function (next) {
  now = new Date()
  this.updated_at = now
  if (!this.created_at) {
    this.created_at = now
  }
  next()
})

// create models
// const Referral = mongoose.model('Referral', referralSchema)
const User = mongoose.model('User', userSchema)

// export the model
// module.exports = {
//   Referral,
//   User
// }

module.exports = User
