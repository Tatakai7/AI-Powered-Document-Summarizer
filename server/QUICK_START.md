# Quick Start Guide

## Current Status ✅

Your server is **running successfully** on port 3001!

However, MongoDB is not connected. Follow the steps below to complete the setup.

## What's Working Now

✅ Server is running on http://localhost:3001
✅ Health check endpoint: http://localhost:3001/health
✅ NLP analysis endpoints (summarization, sentiment analysis)
✅ Improved error handling and logging

## What Needs MongoDB

⚠️ Document storage and retrieval
⚠️ Summary storage and retrieval
⚠️ PDF export (requires saved summaries)

## Fix MongoDB Connection (Choose One)

### 🌟 Option 1: MongoDB Atlas (Fastest - 5 minutes)

**Best for:** Quick setup, no local installation needed

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Edit `/vercel/sandbox/server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/document-summarizer?retryWrites=true&w=majority
   ```
   (Replace username and password with your credentials)
7. Restart server:
   ```bash
   cd /vercel/sandbox/server
   pkill -f "node server.js"
   npm start
   ```

### 🐧 Option 2: Local MongoDB (Linux)

**Best for:** Local development, offline work

```bash
cd /vercel/sandbox/server
sudo bash setup-mongodb.sh
```

Then restart the server:
```bash
pkill -f "node server.js"
npm start
```

### 🐳 Option 3: Docker (If Available)

**Best for:** Isolated environment, easy cleanup

```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

Then restart the server:
```bash
cd /vercel/sandbox/server
pkill -f "node server.js"
npm start
```

## Verify Everything Works

### 1. Check server is running
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

### 2. Check MongoDB connection
Look for this in server logs:
```
✓ MongoDB connected successfully
```

### 3. Test document creation
```bash
curl -X POST http://localhost:3001/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Document",
    "content": "This is a test document content.",
    "file_type": "txt",
    "file_size": 100,
    "word_count": 6
  }'
```

Should return the created document with an `_id`.

### 4. Test NLP summarization
```bash
curl -X POST http://localhost:3001/api/nlp/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial intelligence is transforming the world. Machine learning algorithms can now process vast amounts of data. Natural language processing enables computers to understand human language. These technologies are revolutionizing industries from healthcare to finance."
  }'
```

Should return a summary of the text.

## Common Issues

### Port 3001 already in use
```bash
# Find and kill the process
lsof -i :3001
kill -9 <PID>

# Or change port in .env
echo "PORT=3002" >> /vercel/sandbox/server/.env
```

### MongoDB connection timeout
- Check if MongoDB is running: `sudo systemctl status mongod`
- Check firewall settings
- Verify MONGODB_URI in `.env` is correct
- For Atlas: Whitelist your IP in Network Access

### Server crashes on startup
- Check Node.js version: `node --version` (need 18+)
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check logs: `cat /vercel/sandbox/server/server.log`

## Need Help?

📖 Full documentation: `/vercel/sandbox/server/README.md`
🐛 Debugging info: `/vercel/sandbox/server/DEBUGGING_SUMMARY.md`
📝 Server logs: `/vercel/sandbox/server/server.log`

## Next Steps

1. ✅ Choose and complete one MongoDB setup option above
2. ✅ Restart the server
3. ✅ Run the verification tests
4. ✅ Start using the API!

---

**Current Server Status:** Running on port 3001 (MongoDB not connected)
**To view logs:** `tail -f /vercel/sandbox/server/server.log`
**To stop server:** `pkill -f "node server.js"`
