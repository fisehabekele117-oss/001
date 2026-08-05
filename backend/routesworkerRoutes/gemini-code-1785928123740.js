const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

const router = express.Router();

// Multer configuration for file upload (Memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Worker Schema Definition
const workerSchema = new mongoose.Schema({
    year: String,
    month: String,
    day: String,
    employerName: String,
    jobTitle: String,
    quantity: String,
    location: String,
    contactPersonName: String,
    contactPersonPhone: String,
    description: String,
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

const Worker = mongoose.model('Worker', workerSchema);

// 1. POST: መረጃዎችን ከአስተዳዳሪው ወይም ከተጠቃሚው መቀበል
router.post('/workers', upload.single('photo'), async (req, res) => {
    try {
        const {
            year,
            month,
            day,
            employerName,
            jobTitle,
            quantity,
            location,
            contactPersonName,
            contactPersonPhone,
            description
        } = req.body;

        const newWorker = new Worker({
            year,
            month,
            day,
            employerName,
            jobTitle,
            quantity,
            location,
            contactPersonName,
            contactPersonPhone,
            description
        });

        await newWorker.save();
        res.status(201).json({ message: 'መረጃው በተሳካ ሁኔታ ተመዝግቧል!', worker: newWorker });
    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: 'መረጃውን መዝገብ ላይ ችግር ተፈጥሯል' });
    }
});

// 2. GET: የተመዘገቡ መረጃዎችን ሁሉ ማምጣት (ለ admin.html)
router.get('/workers', async (req, res) => {
    try {
        const workers = await Worker.find().sort({ createdAt: -1 });
        res.json(workers);
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'መረጃዎችን ማምጣት አልተቻለም' });
    }
});

module.exports = router;