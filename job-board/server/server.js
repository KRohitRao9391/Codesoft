require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Serve static client (built or static files)
app.use('/', express.static(path.join(__dirname, '..', 'client')));

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobboard', {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(()=> {
  app.listen(PORT, ()=> console.log('Server running on port', PORT));
}).catch(err => {
  console.error('DB connection error', err);
});
