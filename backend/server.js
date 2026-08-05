const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// 1. MongoDB Connection String
const MONGO_URI = 'mongodb+srv://fisehabekele117_db_user:dCEgHclKmbHAbTym@cluster0.bmcont5.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 2. Define Job Schema & Model
const jobSchema = new mongoose.Schema({
  employer: String,
  jobTitle: String,
  location: String,
  photo: String,
  date: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

// 3. API Routes

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ _id: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Add a new job
app.post('/api/jobs', async (req, res) => {
  try {
    const { employer, jobTitle, location, photo } = req.body;
    const newJob = new Job({ employer, jobTitle, location, photo });
    await newJob.save();
    res.status(201).json({ message: 'Job saved successfully!', job: newJob });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// Serve static files if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
