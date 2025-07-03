const express = require('express');
const connectDB = require('./db');

const app = express();
const port = 5000;

// Connect to DB
connectDB();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes
app.use('/api/auth', require('./Routes/Auth'));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
