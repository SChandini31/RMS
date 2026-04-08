const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const Publication = require("../models/publicationModel");

// helper: build status stats from publication approval flow
const getStatusStats = async (match = {}) => {
  const approved = await Publication.countDocuments({
    ...match,
    finalStatus: "approved",
  });

  const rejected = await Publication.countDocuments({
    ...match,
    $or: [
      { facultyApprovalStatus: "rejected" },
      { directorateApprovalStatus: "rejected" },
      { finalStatus: "rejected" },
    ],
  });

  const pending = await Publication.countDocuments({
    ...match,
    finalStatus: { $ne: "approved" },
    $nor: [
      { facultyApprovalStatus: "rejected" },
      { directorateApprovalStatus: "rejected" },
      { finalStatus: "rejected" },
    ],
  });

  return { approved, pending, rejected };
};

// helper: build school stats
const getSchoolStats = async (match = {}) => {
  return Publication.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $ifNull: ["$school", "Unknown"] },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        school: "$_id",
        count: 1,
      },
    },
    { $sort: { school: 1 } },
  ]);
};

// helper: build department stats
const getDepartmentStats = async (match = {}) => {
  return Publication.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $ifNull: ["$department", "Unknown"] },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        count: 1,
      },
    },
    { $sort: { department: 1 } },
  ]);
};

// DASHBOARD SUMMARY (ROLE BASED)
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const selectedSchool = (req.query.school || "").trim();

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let summary = {};
    let overview = {};

    // ==============================
    // SUPER ADMIN
    // ==============================
    if (role === "super_admin") {
      const publicationMatch = selectedSchool
        ? { school: selectedSchool }
        : {};

      const totalUsers = selectedSchool
        ? await User.countDocuments({ school: selectedSchool })
        : await User.countDocuments();

      const totalPublications = await Publication.countDocuments(publicationMatch);
      const statusStats = await getStatusStats(publicationMatch);
      const pendingApprovals = statusStats.pending;

      const recentPublications = await Publication.find(publicationMatch)
        .select(
          "title school department facultyApprovalStatus directorateApprovalStatus finalStatus createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(5);

      const schoolStats = await getSchoolStats();
      const departmentStats = selectedSchool
        ? await getDepartmentStats({ school: selectedSchool })
        : [];

      const recentUsers = selectedSchool
        ? await User.find({ school: selectedSchool })
            .select("name role school department createdAt")
            .sort({ createdAt: -1 })
            .limit(5)
        : await User.find()
            .select("name role school department createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

      summary = {
        totalUsers,
        totalPublications,
        pendingApprovals,
        approvedPublications: statusStats.approved,
      };

      overview = {
        recentPublications,
        recentUsers,
        statusStats,
        schoolStats,
        departmentStats,
        selectedSchool: selectedSchool || null,
      };
    }

    // ==============================
    // ADMIN (Department-wise)
    // ==============================
    else if (role === "admin") {
      const dept = currentUser.department;
      const match = { department: dept };

      const totalUsers = await User.countDocuments({ department: dept });
      const totalPublications = await Publication.countDocuments(match);
      const statusStats = await getStatusStats(match);
      const pendingApprovals = statusStats.pending;

      const recentPublications = await Publication.find(match)
        .select(
          "title school department facultyApprovalStatus directorateApprovalStatus finalStatus createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(5);

      summary = {
        totalUsers,
        totalPublications,
        pendingApprovals,
      };

      overview = {
        recentPublications,
        statusStats,
      };
    }

    // ==============================
    // FACULTY
    // ==============================
    else if (role === "faculty") {
      const match = { uploadedBy: userId };

      const myPublications = await Publication.countDocuments(match);
      const statusStats = await getStatusStats(match);

      const recentPublications = await Publication.find(match)
        .select(
          "title school department facultyApprovalStatus directorateApprovalStatus finalStatus createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(5);

      summary = {
        myPublications,
        pending: statusStats.pending,
        approved: statusStats.approved,
        rejected: statusStats.rejected,
      };

      overview = {
        recentPublications,
        statusStats,
      };
    }

    // ==============================
    // STUDENT
    // ==============================
    else if (role === "student") {
      const match = { uploadedBy: userId };

      const myPublications = await Publication.countDocuments(match);
      const statusStats = await getStatusStats(match);

      const recentPublications = await Publication.find(match)
        .select(
          "title school department facultyApprovalStatus directorateApprovalStatus finalStatus createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(5);

      summary = {
        myPublications,
        pending: statusStats.pending,
        approved: statusStats.approved,
        rejected: statusStats.rejected,
      };

      overview = {
        recentPublications,
        statusStats,
      };
    }

    // ==============================
    // DIRECTORATE
    // ==============================
    else if (role === "directorate") {
      const match = {};

      const totalPublications = await Publication.countDocuments(match);
      const statusStats = await getStatusStats(match);
      const pendingApprovals = await Publication.countDocuments({
        facultyApprovalStatus: "approved",
        directorateApprovalStatus: "pending",
        finalStatus: "pending",
      });

      const recentPublications = await Publication.find(match)
        .select(
          "title school department facultyApprovalStatus directorateApprovalStatus finalStatus createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(5);

      summary = {
        totalPublications,
        pendingApprovals,
        approved: statusStats.approved,
        rejected: statusStats.rejected,
      };

      overview = {
        recentPublications,
        statusStats,
      };
    }

    // ==============================
    // SPECIAL USER
    // ==============================
    else if (role === "special_user") {
      const publicationMatch = selectedSchool
        ? { school: selectedSchool }
        : {};

      const totalPublications = await Publication.countDocuments(publicationMatch);
      const statusStats = await getStatusStats(publicationMatch);

      const recentPublications = await Publication.find(publicationMatch)
        .select(
          "title school department facultyApprovalStatus directorateApprovalStatus finalStatus createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(5);

      const schoolStats = await getSchoolStats();
      const departmentStats = selectedSchool
        ? await getDepartmentStats({ school: selectedSchool })
        : [];

      summary = {
        totalPublications,
        pending: statusStats.pending,
        approved: statusStats.approved,
        rejected: statusStats.rejected,
      };

      overview = {
        recentPublications,
        statusStats,
        schoolStats,
        departmentStats,
        selectedSchool: selectedSchool || null,
      };
    }

    // ==============================
    // UNKNOWN ROLE
    // ==============================
    else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    return res.json({
      role,
      summary,
      overview,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;