const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      school
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !department ||
      !school
    ) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    if (!Array.isArray(role) || role.length === 0) {
      return res.status(400).json({
        message: 'At least one role is required'
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      department: department.trim(),
      school: school.trim()
    });

    res.status(201).json({
      message: 'User registered successfully'
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password, selectedRole } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    // --------------------------------------------------
    // ROLE SELECTION
    // --------------------------------------------------

    // User has multiple roles
    if (user.role.length > 1 && !selectedRole) {
      return res.json({
        requiresRoleSelection: true,
        roles: user.role
      });
    }

    // Determine active role
    const activeRole =
      user.role.length === 1
        ? user.role[0]
        : selectedRole;

    // --------------------------------------------------
    // VALIDATE SELECTED ROLE
    // --------------------------------------------------

    if (!user.role.includes(activeRole)) {
      return res.status(403).json({
        message: 'Invalid role selected'
      });
    }

    // --------------------------------------------------
    // CREATE JWT
    // --------------------------------------------------

    const token = jwt.sign(
      {
        id: user._id,
        role: activeRole
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        activeRole: activeRole,
        department: user.department,
        school: user.school
      }
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});
module.exports = router;
