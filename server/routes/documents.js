const express = require("express")
const router = express.Router()
const Document = require("../models/Document")
const Summary = require("../models/Summary")

// Get all documents
router.get("/", async (req, res) => {
  try {
    const documents = await Document.find().sort({ created_at: -1 })

    res.json({
      success: true,
      data: documents,
    })
  } catch (error) {
    console.error("Error fetching documents:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch documents",
    })
  }
})

// Get a single document
router.get("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      })
    }

    res.json({
      success: true,
      data: document,
    })
  } catch (error) {
    console.error("Error fetching document:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch document",
    })
  }
})

// Create a new document
router.post("/", async (req, res) => {
  try {
    const { title, content, file_type, file_size, word_count } = req.body

    if (!title || !content || !file_type || !file_size || !word_count) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      })
    }

    const document = new Document({
      title,
      content,
      file_type,
      file_size,
      word_count,
    })

    await document.save()

    res.status(201).json({
      success: true,
      data: document,
    })
  } catch (error) {
    console.error("Error creating document:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create document",
    })
  }
})

// Delete a document and its summaries
router.delete("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      })
    }

    // Delete all summaries associated with this document
    await Summary.deleteMany({ document_id: req.params.id })

    // Delete the document
    await Document.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Document and associated summaries deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting document:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete document",
    })
  }
})

module.exports = router
