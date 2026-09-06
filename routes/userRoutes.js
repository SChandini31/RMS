console.log("this is loaded");

const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const router = express.Router();

const User = require("../models/userModel");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const AuditLog = require("../models/auditLogModel");

// ============================================================
// NODEMAILER TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================================
// HELPER
// Check whether logged-in user has a specific active role
// Supports both:
// role: "super_admin"
// role: ["super_admin", "admin"]
// ============================================================

const hasRole = (userRole, requiredRole) => {
  if (Array.isArray(userRole)) {
    return userRole.includes(requiredRole);
  }

  return userRole === requiredRole;
};

// ============================================================
// CREATE USER
// Only super_admin
// ============================================================

router.post(
  "/",
  authMiddleware,
  allowRoles("super_admin"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role,
        organization_institution,
        department,
        school,
        contact_number,
      } = req.body;

      // ========================================================
      // REQUIRED FIELDS
      // ========================================================

      if (
        !name ||
        !email ||
        !password ||
        !role ||
        !organization_institution ||
        !department ||
        !school ||
        !contact_number
      ) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      // ========================================================
      // ROLE MUST BE AN ARRAY
      // ========================================================

      if (!Array.isArray(role) || role.length === 0) {
        return res.status(400).json({
          message: "At least one role is required",
        });
      }

      // ========================================================
      // CLEAN ROLES
      // ========================================================

      const cleanedRoles = role
        .map((item) => String(item).trim())
        .filter(Boolean);

      if (cleanedRoles.length === 0) {
        return res.status(400).json({
          message: "At least one valid role is required",
        });
      }

      // ========================================================
      // CHECK EXISTING USER
      // ========================================================

      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
      });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      // ========================================================
      // HASH PASSWORD
      // ========================================================

      const hashedPassword = await bcrypt.hash(password, 10);

      // ========================================================
      // CREATE USER
      // ========================================================

      const user = await User.create({
        name: name.trim(),

        email: email.toLowerCase().trim(),

        password: hashedPassword,

        // MULTIPLE ROLES
        role: cleanedRoles,

        // ORGANIZATION / INSTITUTION
        organization_institution:
          organization_institution.trim(),

        // DEPARTMENT
        department: department.trim().toUpperCase(),

        // SCHOOL
        school: school.trim(),

        // CONTACT
        contact_number: contact_number,
      });

      // ========================================================
      // REMOVE PASSWORD FROM RESPONSE
      // ========================================================

      const safeUser = await User.findById(user._id)
        .select("-password");

      // ========================================================
      // AUDIT LOG
      // ========================================================

      const currentUser = await User.findById(req.user.id);

      await AuditLog.create({
        action: "create_user",

        performedBy: req.user.id,

        role: Array.isArray(req.user.role)
          ? req.user.role.join(", ")
          : req.user.role,

        department:
          currentUser?.department || "",

        school:
          currentUser?.school || "",

        organization_institution:
          currentUser?.organization_institution || "",

        targetType: "user",

        targetId: user._id,

        details: `Created user ${user.email} with roles ${user.role.join(
          ", "
        )} in ${user.department}`,
      });

      // ========================================================
      // SEND EMAIL
      // ========================================================

      let emailStatus = "Email sent successfully";

      try {
        await Promise.race([
          transporter.sendMail({
            from: process.env.EMAIL_USER,

            to: user.email,

            subject: "RMS Account Created",

            html: `
              <h2>Welcome to RMS</h2>

              <p>Hello ${user.name},</p>

              <p>Your RMS account has been created.</p>

              <p>
                <b>Email:</b> ${user.email}
              </p>

              <p>
                <b>Password:</b> ${password}
              </p>

              <p>
                <b>Roles:</b> ${user.role.join(", ")}
              </p>

              <p>
                <b>Organization / Institution:</b>
                ${user.organization_institution}
              </p>

              <p>
                <b>Department:</b>
                ${user.department}
              </p>

              <p>
                <b>School:</b>
                ${user.school}
              </p>

              <p>
                <b>Contact Number:</b>
                ${user.contact_number}
              </p>

              <p>
                Please login and change your password.
              </p>
            `,
          }),

          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Email timeout")),
              5000
            )
          ),
        ]);
      } catch (mailError) {
        console.error(
          "EMAIL SEND ERROR:",
          mailError
        );

        emailStatus =
          "User created, but email failed or timed out";
      }

      // ========================================================
      // RESPONSE
      // ========================================================

      return res.status(201).json({
        message: "✅ User created successfully",

        emailStatus,

        data: safeUser,
      });
    } catch (err) {
      console.error(
        "CREATE USER ERROR:",
        err
      );

      return res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ============================================================
// READ ALL USERS
//
// super_admin -> all users
// admin       -> users from their department
//
// Pagination:
// GET /api/users?page=1&limit=10
// ============================================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      // ========================================================
      // PAGINATION
      // ========================================================

      let page =
        parseInt(req.query.page, 10) || 1;

      let limit =
        parseInt(req.query.limit, 10) || 10;

      if (page < 1) {
        page = 1;
      }

      if (limit < 1) {
        limit = 10;
      }

      if (limit > 100) {
        limit = 100;
      }

      const skip = (page - 1) * limit;

      // ========================================================
      // SUPER ADMIN
      // ========================================================

      if (hasRole(req.user.role, "super_admin")) {
        const totalUsers =
          await User.countDocuments({});

        const users =
          await User.find({})
            .select("-password")
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(limit);

        const totalPages =
          Math.ceil(totalUsers / limit);

        return res.json({
          success: true,

          count: users.length,

          users,

          pagination: {
            currentPage: page,
            pageSize: limit,
            totalItems: totalUsers,
            totalPages,

            hasNextPage:
              page < totalPages,

            hasPreviousPage:
              page > 1,
          },
        });
      }

      // ========================================================
      // ADMIN
      // ========================================================

      if (hasRole(req.user.role, "admin")) {
        const currentAdmin =
          await User.findById(req.user.id);

        if (!currentAdmin) {
          return res.status(404).json({
            message: "Admin user not found",
          });
        }

        const query = {
          department:
            currentAdmin.department,
        };

        const totalUsers =
          await User.countDocuments(query);

        const users =
          await User.find(query)
            .select("-password")
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(limit);

        const totalPages =
          Math.ceil(totalUsers / limit);

        return res.json({
          success: true,

          count: users.length,

          users,

          pagination: {
            currentPage: page,
            pageSize: limit,
            totalItems: totalUsers,
            totalPages,

            hasNextPage:
              page < totalPages,

            hasPreviousPage:
              page > 1,
          },
        });
      }

      // ========================================================
      // OTHER ROLES
      // ========================================================

      return res.status(403).json({
        message: "Access denied",
      });
    } catch (err) {
      console.error(
        "GET USERS ERROR:",
        err
      );

      return res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ============================================================
// READ ONE USER
//
// super_admin -> any user
// admin       -> users from same department
// ============================================================

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      // ========================================================
      // VALIDATE ID
      // ========================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      // ========================================================
      // FIND USER
      // ========================================================

      const targetUser =
        await User.findById(
          req.params.id
        ).select("-password");

      if (!targetUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // ========================================================
      // SUPER ADMIN
      // ========================================================

      if (
        hasRole(
          req.user.role,
          "super_admin"
        )
      ) {
        return res.json(targetUser);
      }

      // ========================================================
      // ADMIN
      // ========================================================

      if (
        hasRole(
          req.user.role,
          "admin"
        )
      ) {
        const currentAdmin =
          await User.findById(req.user.id);

        if (!currentAdmin) {
          return res.status(404).json({
            message: "Admin user not found",
          });
        }

        if (
          currentAdmin.department !==
          targetUser.department
        ) {
          return res.status(403).json({
            message:
              "Access denied for this department",
          });
        }

        return res.json(targetUser);
      }

      // ========================================================
      // OTHER ROLES
      // ========================================================

      return res.status(403).json({
        message: "Access denied",
      });
    } catch (err) {
      console.error(
        "GET USER ERROR:",
        err
      );

      return res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ============================================================
// UPDATE USER
// Only super_admin
// ============================================================

router.put(
  "/:id",
  authMiddleware,
  allowRoles("super_admin"),
  async (req, res) => {
    try {
      // ========================================================
      // VALIDATE ID
      // ========================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      // ========================================================
      // FIND EXISTING USER
      // ========================================================

      const existingUser =
        await User.findById(
          req.params.id
        );

      if (!existingUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // ========================================================
      // COPY REQUEST BODY
      // ========================================================

      const updateData = {
        ...req.body,
      };

      // ========================================================
      // NAME
      // ========================================================

      if (updateData.name) {
        updateData.name =
          updateData.name.trim();
      }

      // ========================================================
      // EMAIL
      // ========================================================

      if (updateData.email) {
        updateData.email =
          updateData.email
            .toLowerCase()
            .trim();
      }

      // ========================================================
      // PASSWORD
      // ========================================================

      if (updateData.password) {
        updateData.password =
          await bcrypt.hash(
            updateData.password,
            10
          );
      }

      // ========================================================
      // ROLE
      // MUST BE ARRAY
      // ========================================================

      if (updateData.role) {
        if (
          !Array.isArray(
            updateData.role
          ) ||
          updateData.role.length === 0
        ) {
          return res.status(400).json({
            message:
              "At least one role is required",
          });
        }

        updateData.role =
          updateData.role
            .map((role) =>
              String(role).trim()
            )
            .filter(Boolean);
      }

      // ========================================================
      // ORGANIZATION / INSTITUTION
      // ========================================================

      if (
        updateData.organization_institution
      ) {
        updateData.organization_institution =
          updateData.organization_institution.trim();
      }

      // ========================================================
      // SCHOOL
      // ========================================================

      if (updateData.school) {
        updateData.school =
          updateData.school.trim();
      }

      // ========================================================
      // DEPARTMENT
      // ========================================================

      if (updateData.department) {
        updateData.department =
          updateData.department
            .trim()
            .toUpperCase();
      }

      // ========================================================
      // CONTACT NUMBER
      // ========================================================

      if (
        updateData.contact_number !==
        undefined
      ) {
        updateData.contact_number =
          updateData.contact_number;
      }

      // ========================================================
      // UPDATE
      // ========================================================

      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        ).select("-password");

      // ========================================================
      // AUDIT LOG
      // ========================================================

      const currentUser =
        await User.findById(
          req.user.id
        );

      await AuditLog.create({
        action: "update_user",

        performedBy: req.user.id,

        role: Array.isArray(
          req.user.role
        )
          ? req.user.role.join(", ")
          : req.user.role,

        department:
          currentUser?.department || "",

        school:
          currentUser?.school || "",

        organization_institution:
          currentUser?.organization_institution ||
          "",

        targetType: "user",

        targetId: user._id,

        details:
          `Updated user ${user.email}`,
      });

      // ========================================================
      // RESPONSE
      // ========================================================

      return res.json({
        message:
          "✅ User updated successfully",

        data: user,
      });
    } catch (err) {
      console.error(
        "UPDATE USER ERROR:",
        err
      );

      return res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ============================================================
// DELETE USER
// Only super_admin
// ============================================================

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("super_admin"),
  async (req, res) => {
    try {
      // ========================================================
      // VALIDATE ID
      // ========================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      // ========================================================
      // DELETE USER
      // ========================================================

      const deletedUser =
        await User.findByIdAndDelete(
          req.params.id
        );

      if (!deletedUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // ========================================================
      // AUDIT LOG
      // ========================================================

      const currentUser =
        await User.findById(
          req.user.id
        );

      await AuditLog.create({
        action: "delete_user",

        performedBy: req.user.id,

        role: Array.isArray(
          req.user.role
        )
          ? req.user.role.join(", ")
          : req.user.role,

        department:
          currentUser?.department || "",

        school:
          currentUser?.school || "",

        organization_institution:
          currentUser?.organization_institution ||
          "",

        targetType: "user",

        targetId: deletedUser._id,

        details:
          `Deleted user ${deletedUser.email}`,
      });

      // ========================================================
      // RESPONSE
      // ========================================================

      return res.json({
        message:
          "🗑️ User deleted successfully",
      });
    } catch (err) {
      console.error(
        "DELETE USER ERROR:",
        err
      );

      return res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;