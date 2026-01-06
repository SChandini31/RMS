const express = require('express');
const router = express.Router();
const Document = require('../models/documentModel');

// CREATE
router.post('/', async (req, res) => {
  const document = await Document.create(req.body);
  res.status(201).json(document);
});

// READ ALL
router.get('/', async (req, res) => {
  const documents = await Document.find()
    .populate('uploadedBy')
    .populate('relatedProject');
  res.json(documents);
});

// READ ONE
router.get('/:id', async (req, res) => {
  const document = await Document.findById(req.params.id);
  res.json(document);
});

// UPDATE
router.put('/:id', async (req, res) => {
  const document = await Document.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(document);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  res.json({ message: 'Document deleted' });
});

module.exports = router;
