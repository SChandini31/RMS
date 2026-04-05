const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const Publication = require('../models/publicationModel');

// DASHBOARD SUMMARY (ROLE BASED)
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let summary = {};
    let overview = {};

    // ==============================
    // SUPER ADMIN
    // ==============================
    if (role === 'super_admin') {

      const totalUsers = await User.countDocuments();
      const totalPublications = await Publication.countDocuments();
      const pendingApprovals = await Publication.countDocuments({ status: 'pending' });
      const approvedPublications = await Publication.countDocuments({ status: 'approved' });

      const recentPublications = await Publication.find()
        .select('title department status createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      const departmentStats = await Publication.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            department: '$_id',
            count: 1
          }
        }
      ]);

      const statusStats = {
        pending: await Publication.countDocuments({ status: 'pending' }),
        approved: await Publication.countDocuments({ status: 'approved' }),
        rejected: await Publication.countDocuments({ status: 'rejected' })
      };

      const recentUsers = await User.find()
        .select('name role department createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      summary = {
        totalUsers,
        totalPublications,
        pendingApprovals,
        approvedPublications
      };

      overview = {
        recentPublications,
        departmentStats,
        statusStats,
        recentUsers
      };
    }

    // ==============================
    // ADMIN (Department-wise)
    // ==============================
    else if (role === 'admin') {

      const dept = currentUser.department;

      const totalUsers = await User.countDocuments({ department: dept });
      const totalPublications = await Publication.countDocuments({ department: dept });
      const pendingApprovals = await Publication.countDocuments({ department: dept, status: 'pending' });

      const recentPublications = await Publication.find({ department: dept })
        .select('title status createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      summary = {
        totalUsers,
        totalPublications,
        pendingApprovals
      };

      overview = {
        recentPublications
      };
    }

    // ==============================
    // FACULTY
    // ==============================
    else if (role === 'faculty') {

      const myPublications = await Publication.countDocuments({ uploadedBy: userId });
      const pending = await Publication.countDocuments({ uploadedBy: userId, status: 'pending' });
      const approved = await Publication.countDocuments({ uploadedBy: userId, status: 'approved' });

      const recentPublications = await Publication.find({ uploadedBy: userId })
        .select('title status createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      summary = {
        myPublications,
        pending,
        approved
      };

      overview = {
        recentPublications
      };
    }

    // ==============================
    // STUDENT
    // ==============================
    else if (role === 'student') {

      const myPublications = await Publication.countDocuments({ uploadedBy: userId });
      const pending = await Publication.countDocuments({ uploadedBy: userId, status: 'pending' });
      const approved = await Publication.countDocuments({ uploadedBy: userId, status: 'approved' });

      const recentPublications = await Publication.find({ uploadedBy: userId })
        .select('title status createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      summary = {
        myPublications,
        pending,
        approved
      };

      overview = {
        recentPublications
      };
    }

    // ==============================
    // DIRECTORATE
    // ==============================
    else if (role === 'directorate') {

      const totalPublications = await Publication.countDocuments();
      const pendingApprovals = await Publication.countDocuments({ status: 'pending' });

      const statusStats = {
        approved: await Publication.countDocuments({ status: 'approved' }),
        rejected: await Publication.countDocuments({ status: 'rejected' })
      };

      summary = {
        totalPublications,
        pendingApprovals
      };

      overview = {
        statusStats
      };
    }

    // ==============================
    // SPECIAL USER (View Only)
    // ==============================
    else if (role === 'special_user') {

      const totalPublications = await Publication.countDocuments();

      const statusStats = {
        pending: await Publication.countDocuments({ status: 'pending' }),
        approved: await Publication.countDocuments({ status: 'approved' }),
        rejected: await Publication.countDocuments({ status: 'rejected' })
      };

      summary = {
        totalPublications
      };

      overview = {
        statusStats
      };
    }

    // ==============================
    // FINAL RESPONSE
    // ==============================
    res.json({
      role,
      summary,
      overview
    });

  } catch (error) {
    console.error('DASHBOARD ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;