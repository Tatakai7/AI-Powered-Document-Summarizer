const express = require("express")
const router = express.Router()
const Summary = require("../models/Summary")
const Document = require("../models/Document")

// Get all summaries
router.get("/", async (req, res) => {
  try {
    const summaries = await Summary.find().sort({ created_at: -1 }).populate("document_id")

    res.json({
      success: true,
      data: summaries,
    })
  } catch (error) {
    console.error("Error fetching summaries:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch summaries",
    })
  }
})

// Get a single summary
router.get("/:id", async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id).populate("document_id")

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: "Summary not found",
      })
    }

    res.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    console.error("Error fetching summary:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch summary",
    })
  }
})

// Create a new summary
router.post("/", async (req, res) => {
  try {
    const {
      document_id,
      summary_text,
      key_points,
      sentiment_score,
      sentiment_label,
      tone_analysis,
      compression_ratio,
    } = req.body

    console.log('Received summary data:', {
      document_id,
      summary_text: summary_text ? summary_text.substring(0, 100) + '...' : summary_text,
      key_points: Array.isArray(key_points) ? key_points.length : typeof key_points,
      sentiment_score: typeof sentiment_score,
      sentiment_label,
      tone_analysis: typeof tone_analysis,
      compression_ratio: typeof compression_ratio
    });

    if (
      !document_id ||
      !summary_text || summary_text.trim() === '' ||
      !Array.isArray(key_points) ||
      sentiment_score === undefined || typeof sentiment_score !== 'number' ||
      !sentiment_label ||
      !tone_analysis || typeof tone_analysis !== 'object' ||
      compression_ratio === undefined || typeof compression_ratio !== 'number'
    ) {
      console.log('Validation failed for fields:', {
        document_id: !!document_id,
        summary_text: !!summary_text && summary_text.trim() !== '',
        key_points: Array.isArray(key_points),
        sentiment_score: sentiment_score !== undefined && typeof sentiment_score === 'number',
        sentiment_label: !!sentiment_label,
        tone_analysis: !!tone_analysis && typeof tone_analysis === 'object',
        compression_ratio: compression_ratio !== undefined && typeof compression_ratio === 'number'
      });
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      })
    }

    // Verify document exists
    const document = await Document.findById(document_id)
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      })
    }

    const summary = new Summary({
      document_id,
      summary_text,
      key_points,
      sentiment_score,
      sentiment_label,
      tone_analysis,
      compression_ratio,
    })

    await summary.save()

    res.status(201).json({
      success: true,
      data: summary,
    })
  } catch (error) {
    console.error("Error creating summary:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create summary",
    })
  }
})

// Mark summary as exported
router.patch("/:id/exported", async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id)

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: "Summary not found",
      })
    }

    summary.exported = true
    summary.exported_at = new Date()
    await summary.save()

    res.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    console.error("Error updating summary:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update summary",
    })
  }
})

// Delete a summary
router.delete("/:id", async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id)

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: "Summary not found",
      })
    }

    await Summary.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Summary deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting summary:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete summary",
    })
  }
})

module.exports = router
