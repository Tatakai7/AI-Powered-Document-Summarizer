const mongoose = require("mongoose")

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  file_type: {
    type: String,
    required: true,
  },
  file_size: {
    type: Number,
    required: true,
  },
  word_count: {
    type: Number,
    required: true,
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

documentSchema.pre("save", function (next) {
  this.updated_at = Date.now()
  next()
})

module.exports = mongoose.model("Document", documentSchema)
