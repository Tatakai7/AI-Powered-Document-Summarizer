const mongoose = require("mongoose")

const connectDB = async (retries = 5, delay = 5000) => {
  const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/document-summarizer"

  console.log("Attempting to connect to MongoDB...")
  console.log(`MongoDB URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`)

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })

      console.log("✓ MongoDB connected successfully")

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err.message)
      })

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected")
      })

      return // Successfully connected
    } catch (error) {
      console.error(`✗ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`)

      if (attempt === retries) {
        console.error("\n❌ All MongoDB connection attempts failed")
        console.error("\nPlease ensure MongoDB is running or provide a valid MONGODB_URI in .env file")
        console.error("\nOptions:")
        console.error("  1. Install and start MongoDB locally:")
        console.error("     - Download: https://www.mongodb.com/docs/manual/installation/")
        console.error("     - Start: mongod --dbpath /path/to/data")
        console.error("  2. Use MongoDB Atlas (free cloud): https://www.mongodb.com/cloud/atlas")
        console.error("  3. Set MONGODB_URI in server/.env file")
        console.error("  4. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest\n")

        // Don't exit in development to allow server to run without DB for testing
        if (process.env.NODE_ENV === "production") {
          process.exit(1)
        } else {
          console.log("⚠ Server will continue running without database connection (development mode)")
          console.log("⚠ API endpoints requiring database will not work until MongoDB is connected\n")
        }
      } else {
        console.log(`Retrying in ${delay / 1000} seconds...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
}

module.exports = connectDB
