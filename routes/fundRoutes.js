const express = require('express');
const router = express.Router();
const Fund = require('../models/fundModel');

// CREATE
router.post('/', async (req, res) => {
  const fund = await Fund.create(req.body);
  res.status(201).json(fund);
});

// READ ALL
router.get('/', async (req, res) => {
  const funds = await Fund.find().populate('project');
  res.json(funds);
});

// READ ONE
router.get('/:id', async (req, res) => {
  const fund = await Fund.findById(req.params.id);
  res.json(fund);
});

// UPDATE
router.put('/:id', async (req, res) => {
  const fund = await Fund.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(fund);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await Fund.findByIdAndDelete(req.params.id);
  res.json({ message: 'Fund deleted' });
});

module.exports = router;
