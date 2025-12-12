const express = require("express")
const router = express.Router()
const Summary = require("../models/Summary")
const Document = require("../models/Document")
const { generatePDF } = require("../services/pdfService")

// Export summary as PDF
router.get("/summary/:id/pdf", async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id)

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: "Summary not found",
      })
    }

    const document = await Document.findById(summary.document_id)

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Associated document not found",
      })
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(
      {
        summary_text: summary.summary_text,
        key_points: summary.key_points,
        sentiment_score: summary.sentiment_score,
        sentiment_label: summary.sentiment_label,
        tone_analysis: summary.tone_analysis,
        compression_ratio: summary.compression_ratio,
      },
      {
        title: document.title,
        word_count: document.word_count,
      },
    )

    // Set response headers
    const filename = `summary-${document.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.setHeader("Content-Length", pdfBuffer.length)

    // Send PDF
    res.send(pdfBuffer)

    // Mark summary as exported
    summary.exported = true
    summary.exported_at = new Date()
    await summary.save()
  } catch (error) {
    console.error("Error exporting PDF:", error)
    res.status(500).json({
      success: false,
      error: "Failed to export PDF",
    })
  }
})

// Export multiple summaries as a single PDF
router.post("/summaries/pdf", async (req, res) => {
  try {
    const { summaryIds } = req.body

    if (!Array.isArray(summaryIds) || summaryIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Summary IDs array is required",
      })
    }

    const summaries = await Summary.find({ _id: { $in: summaryIds } })

    if (summaries.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No summaries found",
      })
    }

    // For simplicity, export the first summary
    // In a real application, you would combine multiple summaries
    const summary = summaries[0]
    const document = await Document.findById(summary.document_id)

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Associated document not found",
      })
    }

    const pdfBuffer = await generatePDF(
      {
        summary_text: summary.summary_text,
        key_points: summary.key_points,
        sentiment_score: summary.sentiment_score,
        sentiment_label: summary.sentiment_label,
        tone_analysis: summary.tone_analysis,
        compression_ratio: summary.compression_ratio,
      },
      {
        title: document.title,
        word_count: document.word_count,
      },
    )

    const filename = `summaries-export-${Date.now()}.pdf`

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.setHeader("Content-Length", pdfBuffer.length)

    res.send(pdfBuffer)
  } catch (error) {
    console.error("Error exporting multiple PDFs:", error)
    res.status(500).json({
      success: false,
      error: "Failed to export PDFs",
    })
  }
})

module.exports = router
