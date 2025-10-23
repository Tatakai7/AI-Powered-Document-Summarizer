const validateDocumentCreate = (req, res, next) => {
  const { title, content, file_type, file_size, word_count } = req.body

  const errors = []

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("Title is required and must be a non-empty string")
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    errors.push("Content is required and must be a non-empty string")
  }

  if (!file_type || typeof file_type !== "string") {
    errors.push("File type is required and must be a string")
  }

  if (!file_size || typeof file_size !== "number" || file_size <= 0) {
    errors.push("File size is required and must be a positive number")
  }

  if (!word_count || typeof word_count !== "number" || word_count <= 0) {
    errors.push("Word count is required and must be a positive number")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    })
  }

  next()
}

const validateSummaryCreate = (req, res, next) => {
  const { document_id, summary_text, key_points, sentiment_score, sentiment_label, tone_analysis, compression_ratio } =
    req.body

  const errors = []

  if (!document_id || typeof document_id !== "string") {
    errors.push("Document ID is required and must be a string")
  }

  if (!summary_text || typeof summary_text !== "string" || summary_text.trim().length === 0) {
    errors.push("Summary text is required and must be a non-empty string")
  }

  if (!Array.isArray(key_points)) {
    errors.push("Key points must be an array")
  }

  if (
    sentiment_score === undefined ||
    typeof sentiment_score !== "number" ||
    sentiment_score < -1 ||
    sentiment_score > 1
  ) {
    errors.push("Sentiment score is required and must be a number between -1 and 1")
  }

  if (!sentiment_label || !["positive", "negative", "neutral"].includes(sentiment_label)) {
    errors.push("Sentiment label must be 'positive', 'negative', or 'neutral'")
  }

  if (!tone_analysis || typeof tone_analysis !== "object") {
    errors.push("Tone analysis is required and must be an object")
  }

  if (
    compression_ratio === undefined ||
    typeof compression_ratio !== "number" ||
    compression_ratio < 0 ||
    compression_ratio > 1
  ) {
    errors.push("Compression ratio is required and must be a number between 0 and 1")
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    })
  }

  next()
}

module.exports = {
  validateDocumentCreate,
  validateSummaryCreate,
}
