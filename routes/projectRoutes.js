const express = require('express');
const router = express.Router();
const Project = require('../models/projectModel');

// CREATE
router.post('/', async (req, res) => {
  const project = await Project.create(req.body);
  res.status(201).json(project);
});

// READ ALL
router.get('/', async (req, res) => {
  const projects = await Project.find().populate('members').populate('owner');
  res.json(projects);
  console.log();
  
});

// READ ONE
router.get('/:id', async (req, res) => {
  const project = await Project.findById(req.params.id);
  res.json(project);
});

// UPDATE
router.put('/:id', async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(project);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted' });
});

module.exports = router;
