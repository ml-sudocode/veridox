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
  _id: String,
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
  anchors: [anchorsSchema]
})

// create models
const BlockchainReceipt = mongoose.model('BlockchainReceipt', blockchainReceiptSchema)
const Proof = mongoose.model('Proof', proofSchema)
const Anchors = mongoose.model('Anchors', anchorsSchema)

// export model
module.exports = BlockchainReceipt
