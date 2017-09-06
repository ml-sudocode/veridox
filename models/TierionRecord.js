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
  hashOfData: String,
  datastore_id: Number,
  timestamp: Number,
  createdAt: { type: Date },
  updatedAt: { type: Date }
})

// pre save hook to insert creation and updated dates. copied from https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
tierionRecordSchema.pre('save', function (next) {
  let now = new Date()
  this.updatedAt = now
  if (!this.createdAt) {
    this.createdAt = now
  }
  next()
})

// create model
const TierionRecord = mongoose.model('TierionRecord', tierionRecordSchema)

// export model
module.exports = TierionRecord
