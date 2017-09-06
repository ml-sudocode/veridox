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
  sourceId: {
    type: String
  }
})

const blockchainReceiptSchema = new Schema({
  // the parent relationship
  tierion_record_id_as_string: String,
  // this definition below gave be problems when tried to save, so i changed the type to just string
  // tierion_record_id: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'TierionRecord'
  // },
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
