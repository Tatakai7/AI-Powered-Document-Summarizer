const mongoose = require("mongoose")

const summarySchema = new mongoose.Schema({
  document_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  summary_text: {
    type: String,
    required: true,
  },
  key_points: {
    type: [String],
    default: [],
  },
  sentiment_score: {
    type: Number,
    required: true,
    min: -1,
    max: 1,
  },
  sentiment_label: {
    type: String,
    enum: ["positive", "negative", "neutral"],
    required: true,
  },
  tone_analysis: {
    emotions: {
      type: Map,
      of: Number,
      default: {},
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
  },
  compression_ratio: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  exported: {
    type: Boolean,
    default: false,
  },
  exported_at: {
    type: Date,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
})

summarySchema.pre("save", function (next) {
  this.updated_at = Date.now()
  next()
})

summarySchema.index({ document_id: 1 })
summarySchema.index({ created_at: -1 })

module.exports = mongoose.model("Summary", summarySchema)
