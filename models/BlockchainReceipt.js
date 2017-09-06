// require the modules that allow me to create a schema and generate the model
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// create schema
const proofSchema = new Schema({
  right: String,
  left: String
})
const anchorsSchema = new Schema({
  type: {
    type: String
  },
  sourceID: {
    type: String
  }
})

const blockchainReceiptSchema = new Schema({
  _id: String,  // this is to be the same as the blockhain receipt ID
  // the parent relationship
  tierion_record_id: {
    type: Schema.Types.ObjectId,
    ref: 'TierionRecord'
  },
  "@context": String,
  type: String,
  targetHash: String,
  merkleRoot: String,
  proof: [proofSchema],
  anchors: [anchorsSchema],
  createdAt: { type: Date },
  updatedAt: { type: Date }
})

// pre save hook to insert creation and updated dates. copied from https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
blockchainReceiptSchema.pre('save', function (next) {
  let now = new Date()
  this.updatedAt = now
  if (!this.createdAt) {
    this.createdAt = now
  }
  next()
})

// create models
const BlockchainReceipt = mongoose.model('BlockchainReceipt', blockchainReceiptSchema)
const Proof = mongoose.model('Proof', proofSchema)
const Anchors = mongoose.model('Anchors', anchorsSchema)

// export model
module.exports = BlockchainReceipt
