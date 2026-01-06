const express = require('express');
const router = express.Router();

const User = require('../models/userModel');

// CREATE
router.post('/add', async (req, res) => {
  console.log(req.body); // <--- add this
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err); // <--- log full error
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// READ ONE
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// UPDATE
router.put('/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(user);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;   // 🔴 THIS LINE IS CRITICAL
