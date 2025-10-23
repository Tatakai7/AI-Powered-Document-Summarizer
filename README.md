# Development Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

## Step 1: Setup Backend

### 1.1 Navigate to backend directory

\`\`\`bash
cd backend
\`\`\`

### 1.2 Install dependencies

\`\`\`bash
npm install
\`\`\`

### 1.3 Configure environment variables

Create a `.env` file in the backend directory:
\`\`\`
MONGODB_URI=mongodb://localhost:27017/document-summarizer

# OR for MongoDB Atlas:

# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/document-summarizer

PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
\`\`\`

### 1.4 Start the backend server

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
Server running on port 3001
Connected to MongoDB
NLP Model loaded successfully
\`\`\`

## Step 2: Setup Frontend

### 2.1 Navigate to frontend directory

\`\`\`bash
cd AI-Powered-Document-Summarizer
\`\`\`

### 2.2 Install dependencies

\`\`\`bash
npm install
\`\`\`

### 2.3 Start the development server

\`\`\`bash
npm run dev
\`\`\`

The frontend will be available at `http://localhost:5173`

## Troubleshooting

### Error: ECONNREFUSED

**Problem:** Backend server is not running
**Solution:**

1. Make sure you started the backend with `npm run dev` in the backend directory
2. Verify the backend is running on port 3001
3. Check that MongoDB is running and accessible

### Error: MongoDB connection failed

**Problem:** MongoDB is not running or connection string is wrong
**Solution:**

1. If using local MongoDB, ensure MongoDB service is running
2. If using MongoDB Atlas, verify your connection string in `.env`
3. Check your firewall settings

### Error: Port 3001 already in use

**Problem:** Another process is using port 3001
**Solution:**
\`\`\`bash

# Find process using port 3001

lsof -i :3001

# Kill the process

kill -9 <PID>
\`\`\`

### Error: TensorFlow.js model loading fails

**Problem:** Model download is slow or network issue
**Solution:**

1. Check your internet connection
2. The model downloads on first run (~100MB)
3. Wait for the "NLP Model loaded successfully" message

## Running Both Servers

**Terminal 1 - Backend:**
\`\`\`bash
cd backend
npm run dev
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`bash
cd AI-Powered-Document-Summarizer
npm run dev
\`\`\`

Both servers must be running for the application to work properly.

## API Endpoints

Once both servers are running, the frontend will communicate with:

- `GET /api/documents` - Fetch all documents
- `POST /api/documents` - Upload a new document
- `GET /api/summaries` - Fetch all summaries
- `POST /api/summaries` - Create a summary
- `POST /api/nlp/summarize` - Generate summary
- `POST /api/nlp/sentiment` - Analyze sentiment
- `POST /api/export/pdf` - Export to PDF
