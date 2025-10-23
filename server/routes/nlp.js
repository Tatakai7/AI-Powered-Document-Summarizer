const express = require("express")
const router = express.Router()
const { generateAISummary, analyzeSentiment, extractKeyPoints } = require("../services/nlpService")

// Generate summary for text
router.post("/summarize", async (req, res) => {
  try {
    const { text } = req.body

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Text is required and must be a non-empty string",
      })
    }

    const summary = await generateAISummary(text)

    res.json({
      success: true,
      data: {
        summary,
      },
    })
  } catch (error) {
    console.error("Error generating summary:", error)
    res.status(500).json({
      success: false,
      error: "Failed to generate summary",
    })
  }
})

// Analyze sentiment of text
router.post("/sentiment", async (req, res) => {
  try {
    const { text } = req.body

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Text is required and must be a non-empty string",
      })
    }

    const sentimentResult = analyzeSentiment(text)

    res.json({
      success: true,
      data: sentimentResult,
    })
  } catch (error) {
    console.error("Error analyzing sentiment:", error)
    res.status(500).json({
      success: false,
      error: "Failed to analyze sentiment",
    })
  }
})

// Extract key points from text
router.post("/keypoints", async (req, res) => {
  try {
    const { text } = req.body

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Text is required and must be a non-empty string",
      })
    }

    const keyPoints = extractKeyPoints(text)

    res.json({
      success: true,
      data: {
        keyPoints,
      },
    })
  } catch (error) {
    console.error("Error extracting key points:", error)
    res.status(500).json({
      success: false,
      error: "Failed to extract key points",
    })
  }
})

// Comprehensive analysis endpoint
router.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Text is required and must be a non-empty string",
      })
    }

    const [summary, sentimentResult, keyPoints] = await Promise.all([
      generateAISummary(text),
      Promise.resolve(analyzeSentiment(text)),
      Promise.resolve(extractKeyPoints(text)),
    ])

    const compressionRatio = summary.length / text.length

    res.json({
      success: true,
      data: {
        summary,
        keyPoints,
        sentiment: sentimentResult,
        compressionRatio,
      },
    })
  } catch (error) {
    console.error("Error performing comprehensive analysis:", error)
    res.status(500).json({
      success: false,
      error: "Failed to perform comprehensive analysis",
    })
  }
})

module.exports = router
