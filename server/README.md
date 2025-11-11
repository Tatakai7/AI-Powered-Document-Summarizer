# Document Summarizer Backend

AI-powered document summarizer backend with Node.js, MongoDB, and TensorFlow.js

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup MongoDB

You have several options to run MongoDB:

#### Option A: MongoDB Atlas (Recommended - Free Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/document-summarizer?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB Installation

**Linux (Amazon Linux 2023 / RHEL-based):**
```bash
# Add MongoDB repository
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2023/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF

# Install MongoDB
sudo dnf install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

#### Option C: Docker (Easiest for Development)

```bash
# Pull and run MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# Verify it's running
docker ps | grep mongodb
```

### 3. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and configure your settings:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/document-summarizer
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001`

## Verifying the Setup

### Check Server Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-11T07:30:00.000Z"
}
```

### Check MongoDB Connection

Look for this in the server logs:
```
✓ MongoDB connected successfully
```

If you see connection errors:
```
✗ MongoDB connection attempt 1/5 failed: connect ECONNREFUSED 127.0.0.1:27017
```

This means MongoDB is not running. Follow the MongoDB setup steps above.

## API Endpoints

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get a single document
- `POST /api/documents` - Create a new document
- `DELETE /api/documents/:id` - Delete a document

### Summaries
- `GET /api/summaries` - Get all summaries
- `GET /api/summaries/:id` - Get a single summary
- `POST /api/summaries` - Create a new summary
- `PATCH /api/summaries/:id/exported` - Mark summary as exported
- `DELETE /api/summaries/:id` - Delete a summary

### NLP Analysis
- `POST /api/nlp/summarize` - Generate AI summary
- `POST /api/nlp/sentiment` - Analyze sentiment
- `POST /api/nlp/keypoints` - Extract key points
- `POST /api/nlp/analyze` - Comprehensive analysis

### Export
- `GET /api/export/summary/:id/pdf` - Export summary as PDF
- `POST /api/export/summaries/pdf` - Export multiple summaries as PDF

## Troubleshooting

### MongoDB Connection Issues

**Error: `connect ECONNREFUSED 127.0.0.1:27017`**

Solutions:
1. Make sure MongoDB is installed and running
2. Check if MongoDB is listening on port 27017: `netstat -an | grep 27017`
3. Try restarting MongoDB: `sudo systemctl restart mongod`
4. Use MongoDB Atlas cloud service instead

**Error: `MongoServerError: Authentication failed`**

Solutions:
1. Check your MongoDB username and password in `.env`
2. Ensure the database user has proper permissions
3. For Atlas, whitelist your IP address in Network Access

### Port Already in Use

**Error: `EADDRINUSE: address already in use :::3001`**

Solutions:
```bash
# Find the process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change the port in .env
PORT=3002
```

### TensorFlow.js Warnings

The warning about TensorFlow.js node backend is informational. The app works fine with the current setup. To improve performance (optional):

```bash
npm install @tensorflow/tfjs-node
```

## Development

### Project Structure
```
server/
├── config/          # Configuration files
│   └── database.js  # MongoDB connection
├── middleware/      # Express middleware
│   ├── errorHandler.js
│   └── validateRequest.js
├── models/          # Mongoose models
│   ├── Document.js
│   └── Summary.js
├── routes/          # API routes
│   ├── documents.js
│   ├── summaries.js
│   ├── nlp.js
│   └── export.js
├── services/        # Business logic
│   ├── nlpService.js
│   └── pdfService.js
├── .env            # Environment variables
├── .env.example    # Example environment variables
├── package.json    # Dependencies
└── server.js       # Entry point
```

### Adding New Features

1. Create model in `models/`
2. Create routes in `routes/`
3. Add business logic in `services/`
4. Register routes in `server.js`

## Production Deployment

### Environment Variables
Set these in your production environment:
```env
NODE_ENV=production
MONGODB_URI=<your-production-mongodb-uri>
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com
```

### Security Considerations
- Use strong MongoDB passwords
- Enable MongoDB authentication
- Use HTTPS in production
- Set proper CORS origins
- Keep dependencies updated
- Use environment variables for secrets

## License

MIT
