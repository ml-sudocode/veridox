// require the modules that allow me to create a schema and generate the model
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// create schema
const tierionRecordSchema = new Schema({
  _id: String,  // this is to be the same as the record ID (is there one??) in Tierion Datastore (cloud)
  // the parent relationship
  entry_id: {
    type: Schema.Types.ObjectId,
    ref: 'Entry'
  },
  // the child relationship
  blockchain_receipt_id: {
    type: Schema.Types.ObjectId,
    ref: 'BlockchainReceipt'
  },
  datastore_id: Number,
  timestamp: Number,
  createdAt: { type: Date },
  updatedAt: { type: Date }
})

// pre save hook to insert creation and updated dates. copied from https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
tierionRecordSchema.pre('save', function (next) {
  now = new Date()
  this.updated_at = now
  if (!this.created_at) {
    this.created_at = now
  }
  next()
})

// create model
const TierionRecord = mongoose.model('TierionRecord', tierionRecordSchema)

// export model
module.exports = TierionRecord
