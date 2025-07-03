// index.js
const express = require('express');
const path = require('path');
const connectDB = require('./db');

const app = express();
const port = 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// CORS Setup
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// API Routes
app.use('/api/auth', require('./Routes/Auth'));

// Serve React Build Static Files (Assuming React is built inside 'frontend/build')
app.use(express.static(path.join(__dirname, 'build')));

// React Routing Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
