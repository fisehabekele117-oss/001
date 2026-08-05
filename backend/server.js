require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS: allow the frontend (e.g. your Vercel site) to call this API ---
// Set ALLOWED_ORIGINS in your .env as a comma-separated list, e.g.:
// ALLOWED_ORIGINS=https://fisehabekele.vercel.app,http://localhost:3000
// If ALLOWED_ORIGINS is not set, all origins are allowed (fine for testing).
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length === 0 ? true : allowedOrigins,
}));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'jobs.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// --- Ensure storage exists ---
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// --- Simple JSON "database" helpers ---
function readJobs() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    console.error('Failed to read jobs.json, resetting to empty list:', e);
    return [];
  }
}

function writeJobs(jobs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2));
}

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(FRONTEND_DIR));

// --- Routes for the two pages (nice URLs for the Telegram bot buttons) ---
app.get('/register', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'register.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'admin.html')));

// --- REST API ---

// GET all jobs
app.get('/api/workers', (req, res) => {
  res.json(readJobs());
});

// POST create a new job (multipart/form-data, supports optional "photo")
app.post('/api/workers', upload.single('photo'), (req, res) => {
  try {
    const { year, month, day, employerName, jobTitle, quantity, location, contactPersonName, contactPersonPhone, description } = req.body;

    if (!year || !employerName || !jobTitle || !quantity) {
      return res.status(400).json({ error: 'year, employerName, jobTitle እና quantity ያስፈልጋሉ' });
    }

    const jobs = readJobs();
    const newJob = {
      id: crypto.randomUUID(),
      year: String(year),
      month: month ? String(month) : '',
      day: day ? String(day) : '',
      employerName: String(employerName),
      jobTitle: String(jobTitle),
      quantity: String(quantity),
      location: location || '',
      contactPersonName: contactPersonName || '',
      contactPersonPhone: contactPersonPhone || '',
      description: description || '',
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    jobs.push(newJob);
    writeJobs(jobs);

    res.status(201).json(newJob);
  } catch (err) {
    console.error('POST /api/workers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH toggle status (active <-> finished)
app.patch('/api/workers/:id', (req, res) => {
  const jobs = readJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  job.status = job.status === 'active' ? 'finished' : 'active';
  writeJobs(jobs);
  res.json(job);
});

// DELETE a job
app.delete('/api/workers/:id', (req, res) => {
  const jobs = readJobs();
  const exists = jobs.some(j => j.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Job not found' });

  writeJobs(jobs.filter(j => j.id !== req.params.id));
  res.json({ success: true });
});

// Multer / general error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Unexpected error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// --- Optional: start the Telegram bot (only if a token is configured) ---
require('./bot');
