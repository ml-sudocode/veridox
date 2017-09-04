// require the modules that allow me to create a schema and generate the model
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// create schema
const entrySchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please include a title']
  },
  description: {
    type: String,
    required: [true, 'Please include a description']
  },
  contractName: {
    type: String,
    required: [true, 'Please include the contract name']
  },
  contractParties: {
    type: String,
    required: [true, 'Please include the contract parties']
  },
  data: {
    type: String,
    required: [true, 'Please include the data you wish to prove exists at this time']
  },
  createdAt: { type: Date },
  updatedAt: { type: Date }
})

// pre save hook to insert creation and updated dates. copied from https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
entrySchema.pre('save', function (next) {
  now = new Date()
  this.updated_at = now
  if (!this.created_at) {
    this.created_at = now
  }
  next()
})

// create model
const Entry = mongoose.model('Entry', entrySchema)

// export model
module.exports = Entry
