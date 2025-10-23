require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/database")
const errorHandler = require("./middleware/errorHandler")
const documentsRouter = require("./routes/documents")
const summariesRouter = require("./routes/summaries")
const nlpRouter = require("./routes/nlp")
const exportRouter = require("./routes/export")

const app = express()
const PORT = process.env.PORT || 3001

// Connect to MongoDB
connectDB()

const { loadModel } = require("./services/nlpService")
loadModel().catch((err) => console.error("Failed to preload NLP model:", err))

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:3001"],
    credentials: true,
  }),
)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use("/api/documents", documentsRouter)
app.use("/api/summaries", summariesRouter)
app.use("/api/nlp", nlpRouter)
app.use("/api/export", exportRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server")
  app.close(() => {
    console.log("HTTP server closed")
    process.exit(0)
  })
})
