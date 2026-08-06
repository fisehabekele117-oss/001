require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs'); // <--- ይህ ተጨምሯል

const app = express();
const PORT = process.env.PORT || 3000;

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_CONNECTION_STRING_HERE';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const workerSchema = new mongoose.Schema({
    id: { type: String, default: () => crypto.randomUUID() },
    year: { type: String, required: true },
    month: { type: String, default: '' },
    day: { type: String, default: '' },
    employerName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    size: { type: String, default: '-' },
    quantity: { type: String, required: true },
    location: { type: String, default: '' },
    contactPersonName: { type: String, default: '' },
    contactPersonPhone: { type: String, default: '' },
    description: { type: String, default: '' },
    photo: { type: String, default: null },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

const Worker = mongoose.model('Worker', workerSchema);

// --- CORS ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length === 0 ? true : allowedOrigins,
}));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// --- File upload (photo) config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').slice(0, 10);
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(FRONTEND_DIR));

// --- Routes ---
app.get('/register', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'register.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'admin.html')));

// GET all jobs
app.get('/api/workers', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    // Convert _id to id for frontend compatibility
    const formatted = workers.map(w => ({
      id: w.id || w._id.toString(),
      year: w.year,
      month: w.month,
      day: w.day,
      employerName: w.employerName,
      jobTitle: w.jobTitle,
      size: w.size,
      quantity: w.quantity,
      location: w.location,
      contactPersonName: w.contactPersonName,
      contactPersonPhone: w.contactPersonPhone,
      description: w.description,
      photo: w.photo,
      status: w.status,
      createdAt: w.createdAt
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create a new job
app.post('/api/workers', upload.single('photo'), async (req, res) => {
  try {
    const { year, month, day, employerName, jobTitle, size, quantity, location, contactPersonName, contactPersonPhone, description } = req.body;

    if (!year || !employerName || !jobTitle || !quantity) {
      return res.status(400).json({ error: 'year, employerName, jobTitle እና quantity ያስፈልጋሉ' });
    }

    const newWorker = new Worker({
      year: String(year),
      month: month ? String(month) : '',
      day: day ? String(day) : '',
      employerName: String(employerName),
      jobTitle: String(jobTitle),
      size: size ? String(size) : '-',
      quantity: String(quantity),
      location: location || '',
      contactPersonName: contactPersonName || '',
      contactPersonPhone: contactPersonPhone || '',
      description: description || '',
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'active'
    });

    await newWorker.save();

    res.status(201).json({
      id: newWorker.id,
      year: newWorker.year,
      month: newWorker.month,
      day: newWorker.day,
      employerName: newWorker.employerName,
      jobTitle: newWorker.jobTitle,
      size: newWorker.size,
      quantity: newWorker.quantity,
      location: newWorker.location,
      contactPersonName: newWorker.contactPersonName,
      contactPersonPhone: newWorker.contactPersonPhone,
      description: newWorker.description,
      photo: newWorker.photo,
      status: newWorker.status,
      createdAt: newWorker.createdAt
    });
  } catch (err) {
    console.error('POST /api/workers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH toggle status
app.patch('/api/workers/:id', async (req, res) => {
  try {
    const worker = await Worker.findOne({ id: req.params.id }) || await Worker.findById(req.params.id).catch(() => null);
    if (!worker) return res.status(404).json({ error: 'Job not found' });

    worker.status = worker.status === 'active' ? 'finished' : 'active';
    await worker.save();

    res.json({
      id: worker.id || worker._id.toString(),
      year: worker.year,
      month: worker.month,
      day: worker.day,
      employerName: worker.employerName,
      jobTitle: worker.jobTitle,
      size: worker.size,
      quantity: worker.quantity,
      location: worker.location,
      contactPersonName: worker.contactPersonName,
      contactPersonPhone: worker.contactPersonPhone,
      description: worker.description,
      photo: worker.photo,
      status: worker.status,
      createdAt: worker.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE a job
app.delete('/api/workers/:id', async (req, res) => {
  try {
    const result = await Worker.findOneAndDelete({ id: req.params.id }) || await Worker.findByIdAndDelete(req.params.id).catch(() => null);
    if (!result) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Unexpected error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

require('./bot');
