# AI-Powered Document Summarizer

A modern, fast, and intuitive **AI-powered document summarization tool** that helps users condense long PDFs, articles, and text files into clear and concise summaries. Built with cutting-edge technologies like **React**, **Node.js**, **MongoDB**, and **TensorFlow.js**, this project delivers efficient NLP-driven insights with a smooth user experience.

---

## 🚀 Features

- **AI-Based Summarization** – Uses NLP models powered by TensorFlow.js to generate accurate and concise summaries.
- **Multi-Format Support** – Upload and summarize PDF, TXT, and DOCX files.
- **Real-Time Processing** – Fast server responses using Node.js.
- **Modern UI** – Clean and responsive interface built with React.
- **Document History** – Stores past summaries using MongoDB.
- **Secure API** – Well-structured backend with proper routing and validation.

---

## 🛠️ Tech Stack

### **Frontend**

- React
- Tailwind CSS / CSS Modules
- Vite (optional)

### **Backend**

- Node.js
- Express.js
- TensorFlow.js (NLP models)

### **Database**

- MongoDB / Mongoose

### **Others**

- JWT Authentication
- REST API Architecture

---

## 📦 Installation

### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/ai-document-summarizer.git
cd ai-document-summarizer
```

### **2. Install Dependencies**

# Install backend dependencies

```bash
cd server
npm install
```

# Install frontend dependencies

```bash
cd ../client
npm install
```

### **3. Environment Variables**

Create `.env` file in the **server** directory:

```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

---

## ▶️ Running the Project

### **Start Backend**

```bash
cd server
npm start
```

### **Start Frontend**

```bash
cd client
npm run dev
```

> The app will be available at: **[http://localhost:5173](http://localhost:5173)**

---

## 📘 API Endpoints

### **POST /api/summarize**

Uploads and summarizes a document.

### **GET /api/history**

Fetches stored summary history.

### **POST /api/auth/login**

Authenticates users.

---

## 📂 Folder Structure

```bash
ai-document-summarizer/
│
├── client/            # React frontend
│   ├── src/
│   ├── public/
│   └── ...
│
├── server/            # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── ...
│
└── README.md
```

---

## 🧠 How It Works

1. User uploads a document.
2. Backend extracts raw text.
3. TensorFlow.js NLP model processes the text.
4. Model generates a structured, concise summary.
5. Summary is returned to the UI and saved in MongoDB.

---

## 🤝 Contributing

Contributions are welcome! Submit issues or create pull requests.

---

## 📝 License

This project is licensed under the **GPL 3.0 License**.
