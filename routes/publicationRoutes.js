const express = require('express');
const router = express.Router();
const Publication = require('../models/publicationModel');
const authMiddleware = require('../middleware/authMiddleware');

// 1️⃣ Test route to check if API works
router.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.originalUrl);
  next();
});

router.post('/', authMiddleware, async (req, res) => {
  const publication = await Publication.create(req.body);
  res.status(201).json(publication);
});

// 2️⃣ Add a new publication
router.post('/add', async (req, res) => {
  try {
    const publication = new Publication(req.body);
    await publication.save();
    res.status(201).json({ message: "✅ Publication saved successfully!", data: publication });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3️⃣ Get all publications
router.get('/all', async (req, res) => {
  try {
    const publications = await Publication.find().sort({ createdAt: -1 });
    res.json(publications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single publication by ID
router.get('/:id', async (req, res) => {
  console.log('🆔 GET by ID hit, requested ID:', req.params.id); // <--- log the ID

  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ message: "Publication not found" });
    }
    res.json(publication);
  } catch (error) {
    console.error('❌ Error fetching by ID:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update publication by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedPublication = await Publication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // returns the updated document
    );

    if (!updatedPublication) {
      return res.status(404).json({ message: "❌ Publication not found!" });
    }

    res.json({ message: "✅ Publication updated successfully!", data: updatedPublication });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete publication by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedPublication = await Publication.findByIdAndDelete(req.params.id);

    if (!deletedPublication) {
      return res.status(404).json({ message: "❌ Publication not found!" });
    }

    res.json({ message: "🗑️ Publication deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
