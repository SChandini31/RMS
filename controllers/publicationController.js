const mongoose = require('mongoose');

const Publication = require('../models/publicationModel');
const publicationTypes = require('../config/publicationTypes');


// ============================================================
// CREATE PUBLICATION
// POST /api/publications
// ============================================================

const createPublication = async (req, res) => {
  try {

    const {
      institution_organization,
      school,
      department,
      faculty,
      publication_type,
      title,
      authors,
      abstract,
      keywords,
      type_details,
      upload,
      public_id,
      fileName,
      mimeType,
      additional_notes
    } = req.body;


    // --------------------------------------------------------
    // TITLE
    // --------------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }


    // --------------------------------------------------------
    // UPLOADED BY
    // --------------------------------------------------------

    const uploadedBy = req.user
      ? req.user._id
      : null;


    // --------------------------------------------------------
    // FILE INFORMATION
    // --------------------------------------------------------

    const fileData = req.file
      ? {
          upload: req.file.path || '',
          public_id: req.file.public_id || '',
          fileName: req.file.originalname || '',
          mimeType: req.file.mimetype || ''
        }
      : {
          upload: upload || '',
          public_id: public_id || '',
          fileName: fileName || '',
          mimeType: mimeType || ''
        };


    // --------------------------------------------------------
    // CREATE PUBLICATION
    // --------------------------------------------------------

    const publication = new Publication({

      institution_organization,

      school,

      department,

      faculty: faculty || null,

      publication_type,

      title,

      authors: authors || [],

      type_details: type_details || {},

      abstract: abstract || '',

      keywords: keywords || [],

      upload: fileData.upload,

      public_id: fileData.public_id,

      fileName: fileData.fileName,

      mimeType: fileData.mimeType,

      additional_notes: additional_notes || '',

      uploadedBy

    });


    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    const savedPublication =
      await publication.save();


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: 'Publication created successfully',
      publication: savedPublication
    });


  } catch (error) {

    console.error(
      'Create Publication Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to create publication',
      error: error.message
    });
  }
};


// ============================================================
// GET ALL PUBLICATIONS
// GET /api/publications
// ============================================================

const getAllPublications = async (req, res) => {
  try {

    const publications = await Publication.find()
      .populate('faculty', 'name email role')
      .populate('uploadedBy', 'name email role')
      .populate('facultyApprovedBy', 'name email')
      .populate('directorateApprovedBy', 'name email')
      .populate('authors')
      .sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      count: publications.length,
      publications
    });


  } catch (error) {

    console.error(
      'Get Publications Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch publications',
      error: error.message
    });
  }
};


// ============================================================
// GET SINGLE PUBLICATION
// GET /api/publications/:id
// ============================================================

const getPublicationById = async (req, res) => {
  try {

    const { id } = req.params;


    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {

      return res.status(400).json({
        success: false,
        message: 'Invalid publication ID'
      });

    }


    // --------------------------------------------------------
    // FIND PUBLICATION
    // --------------------------------------------------------

    const publication =
      await Publication.findById(id)
        .populate('faculty', 'name email role')
        .populate('uploadedBy', 'name email role')
        .populate('facultyApprovedBy', 'name email')
        .populate('directorateApprovedBy', 'name email')
        .populate('authors');


    // --------------------------------------------------------
    // NOT FOUND
    // --------------------------------------------------------

    if (!publication) {

      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });

    }


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      publication
    });


  } catch (error) {

    console.error(
      'Get Publication Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch publication',
      error: error.message
    });
  }
};


// ============================================================
// UPDATE PUBLICATION
// PUT /api/publications/:id
// ============================================================

const updatePublication = async (req, res) => {
  try {

    const { id } = req.params;


    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {

      return res.status(400).json({
        success: false,
        message: 'Invalid publication ID'
      });

    }


    // --------------------------------------------------------
    // FIND EXISTING PUBLICATION
    // --------------------------------------------------------

    const existingPublication =
      await Publication.findById(id);


    if (!existingPublication) {

      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });

    }


    // --------------------------------------------------------
    // REQUEST DATA
    // --------------------------------------------------------

    const {
      institution_organization,
      school,
      department,
      faculty,
      publication_type,
      title,
      authors,
      abstract,
      keywords,
      type_details,
      upload,
      public_id,
      fileName,
      mimeType,
      additional_notes
    } = req.body;


    // --------------------------------------------------------
    // UPDATE COMMON FIELDS
    // --------------------------------------------------------

    if (
      institution_organization !== undefined
    ) {

      existingPublication.institution_organization =
        institution_organization;

    }


    if (school !== undefined) {

      existingPublication.school =
        school;

    }


    if (department !== undefined) {

      existingPublication.department =
        department;

    }


    if (faculty !== undefined) {

      existingPublication.faculty =
        faculty;

    }


    if (publication_type !== undefined) {

      existingPublication.publication_type =
        publication_type;

    }


    if (title !== undefined) {

      existingPublication.title =
        title;

    }


    if (authors !== undefined) {

      existingPublication.authors =
        authors;

    }


    if (abstract !== undefined) {

      existingPublication.abstract =
        abstract;

    }


    if (keywords !== undefined) {

      existingPublication.keywords =
        keywords;

    }


    // --------------------------------------------------------
    // TYPE-SPECIFIC DATA
    // --------------------------------------------------------

    if (type_details !== undefined) {

      existingPublication.type_details =
        type_details;

    }


    // --------------------------------------------------------
    // FILE INFORMATION
    // --------------------------------------------------------

    if (upload !== undefined) {

      existingPublication.upload =
        upload;

    }


    if (public_id !== undefined) {

      existingPublication.public_id =
        public_id;

    }


    if (fileName !== undefined) {

      existingPublication.fileName =
        fileName;

    }


    if (mimeType !== undefined) {

      existingPublication.mimeType =
        mimeType;

    }


    // --------------------------------------------------------
    // ADDITIONAL NOTES
    // --------------------------------------------------------

    if (additional_notes !== undefined) {

      existingPublication.additional_notes =
        additional_notes;

    }


    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    const updatedPublication =
      await existingPublication.save();


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: 'Publication updated successfully',
      publication: updatedPublication
    });


  } catch (error) {

    console.error(
      'Update Publication Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to update publication',
      error: error.message
    });
  }
};


// ============================================================
// UPDATE PUBLICATION STATUS
// PUT /api/publications/:id/status
// ============================================================

const updatePublicationStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      status,
      rejectionReason
    } = req.body;


    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {

      return res.status(400).json({
        success: false,
        message: 'Invalid publication ID'
      });

    }


    // --------------------------------------------------------
    // VALIDATE STATUS
    // --------------------------------------------------------

    if (
      !['approved', 'rejected'].includes(status)
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Status must be approved or rejected'
      });

    }


    // --------------------------------------------------------
    // FIND PUBLICATION
    // --------------------------------------------------------

    const publication =
      await Publication.findById(id);


    if (!publication) {

      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });

    }


    const userRole =
      req.user?.role;

    const userId =
      req.user?._id;


    // ========================================================
    // FACULTY APPROVAL
    // ========================================================

    if (userRole === 'faculty') {

      publication.facultyApprovalStatus =
        status;

      publication.facultyApprovedBy =
        userId;

      publication.facultyApprovedAt =
        new Date();


      if (status === 'rejected') {

        publication.facultyRejectionReason =
          rejectionReason || '';

        publication.finalStatus =
          'rejected';

      } else {

        publication.facultyRejectionReason =
          '';

        publication.directorateApprovalStatus =
          'pending';

        publication.finalStatus =
          'pending';

      }

    }


    // ========================================================
    // DIRECTORATE APPROVAL
    // ========================================================

    else if (
      userRole === 'directorate'
    ) {

      // Faculty must approve first

      if (
        publication.facultyApprovalStatus !==
        'approved'
      ) {

        return res.status(400).json({
          success: false,
          message:
            'Publication must be approved by faculty before directorate approval'
        });

      }


      publication.directorateApprovalStatus =
        status;

      publication.directorateApprovedBy =
        userId;

      publication.directorateApprovedAt =
        new Date();


      if (status === 'rejected') {

        publication.directorateRejectionReason =
          rejectionReason || '';

        publication.finalStatus =
          'rejected';

      } else {

        publication.directorateRejectionReason =
          '';

        publication.finalStatus =
          'approved';

      }

    }


    // ========================================================
    // INVALID ROLE
    // ========================================================

    else {

      return res.status(403).json({
        success: false,
        message:
          'You are not authorized to approve or reject publications'
      });

    }


    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    const updatedPublication =
      await publication.save();


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        `Publication ${status} successfully`,
      publication: updatedPublication
    });


  } catch (error) {

    console.error(
      'Update Publication Status Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to update publication status',
      error: error.message
    });

  }
};


// ============================================================
// DELETE PUBLICATION
// DELETE /api/publications/:id
// ============================================================

const deletePublication = async (req, res) => {
  try {

    const { id } = req.params;


    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {

      return res.status(400).json({
        success: false,
        message: 'Invalid publication ID'
      });

    }


    // --------------------------------------------------------
    // FIND PUBLICATION
    // --------------------------------------------------------

    const publication =
      await Publication.findById(id);


    if (!publication) {

      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });

    }


    // --------------------------------------------------------
    // DELETE
    // --------------------------------------------------------

    await Publication.findByIdAndDelete(id);


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: 'Publication deleted successfully'
    });


  } catch (error) {

    console.error(
      'Delete Publication Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to delete publication',
      error: error.message
    });

  }
};


// ============================================================
// GET PUBLICATION TYPES
// GET /api/publications/types
// ============================================================

const getPublicationTypes = async (req, res) => {
  try {

    return res.status(200).json({
      success: true,
      publicationTypes
    });

  } catch (error) {

    console.error(
      'Get Publication Types Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch publication types',
      error: error.message
    });

  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createPublication,
  getAllPublications,
  getPublicationById,
  updatePublication,
  updatePublicationStatus,
  deletePublication,
  getPublicationTypes
};