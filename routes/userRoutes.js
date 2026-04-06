console.log("this is loaded");
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const router = express.Router();
const User = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const AuditLog = require('../models/auditLogModel');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// CREATE user -> only super_admin
router.post('/', authMiddleware, allowRoles('super_admin'), async (req, res) => {
  try {
    const { name, email, password, role, department, school } = req.body;

    if (!name || !email || !password || !role || !department || !school) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      department,
      school
    });

    const safeUser = await User.findById(user._id).select('-password');

    // AUDIT LOG
    const currentUser = await User.findById(req.user.id);
    await AuditLog.create({
      action: 'create_user',
      performedBy: req.user.id,
      role: req.user.role,
      department: currentUser?.department || '',
      targetType: 'user',
      targetId: user._id,
      details: `Created user ${user.email} with role ${user.role} in ${user.department}`
    });

    // SEND EMAIL
    // SEND EMAIL
let emailStatus = 'Email sent successfully';

try {
  await Promise.race([
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'RMS Account Created',
      html: `
        <h2>Welcome to RMS</h2>
        <p>Hello ${user.name},</p>
        <p>Your account has been created.</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Password:</b> ${password}</p>
        <p><b>Role:</b> ${user.role}</p>
        <p><b>Department:</b> ${user.department}</p>
        <p><b>School:</b> ${user.school}</p>
        <p>Please login and change your password.</p>
      `
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email timeout')), 5000)
    )
  ]);
} catch (mailError) {
  console.error('EMAIL SEND ERROR:', mailError);
  emailStatus = 'User created, but email failed or timed out';
}

res.status(201).json({
  message: '✅ User created successfully',
  emailStatus,
  data: safeUser
});
  } catch (err) {
    console.error('CREATE USER ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// READ ALL users
// super_admin -> all users
// admin -> only users from their own department
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'super_admin') {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json(users);
    }

    if (req.user.role === 'admin') {
      const currentAdmin = await User.findById(req.user.id);

      if (!currentAdmin) {
        return res.status(404).json({ message: 'Admin user not found' });
      }

      const users = await User.find({ department: currentAdmin.department })
        .select('-password')
        .sort({ createdAt: -1 });

      return res.json(users);
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (err) {
    console.error('GET USERS ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// READ ONE user by ID
// super_admin -> any user
// admin -> only if same department
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const targetUser = await User.findById(req.params.id).select('-password');

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role === 'super_admin') {
      return res.json(targetUser);
    }

    if (req.user.role === 'admin') {
      const currentAdmin = await User.findById(req.user.id);

      if (!currentAdmin) {
        return res.status(404).json({ message: 'Admin user not found' });
      }

      if (currentAdmin.department !== targetUser.department) {
        return res.status(403).json({ message: 'Access denied for this department' });
      }

      return res.json(targetUser);
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (err) {
    console.error('GET USER ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user -> only super_admin
router.put('/:id', authMiddleware, allowRoles('super_admin'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // AUDIT LOG
    const currentUser = await User.findById(req.user.id);
    await AuditLog.create({
      action: 'update_user',
      performedBy: req.user.id,
      role: req.user.role,
      department: currentUser?.department || '',
      targetType: 'user',
      targetId: user._id,
      details: `Updated user ${user.email}`
    });

    res.json({
      message: '✅ User updated successfully',
      data: user
    });
  } catch (err) {
    console.error('UPDATE USER ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE user -> only super_admin
router.delete('/:id', authMiddleware, allowRoles('super_admin'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // AUDIT LOG
    const currentUser = await User.findById(req.user.id);
    await AuditLog.create({
      action: 'delete_user',
      performedBy: req.user.id,
      role: req.user.role,
      department: currentUser?.department || '',
      targetType: 'user',
      targetId: deletedUser._id,
      details: `Deleted user ${deletedUser.email}`
    });

    res.json({ message: '🗑️ User deleted successfully' });
  } catch (err) {
    console.error('DELETE USER ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;