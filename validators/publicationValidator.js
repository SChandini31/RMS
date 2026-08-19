const mongoose = require('mongoose');

const publicationTypes = require('../config/publicationTypes');

const journalSchema = require('../models/publication/journal.schema');
const bookSchema = require('../models/publication/book.schema');
const bookChapterSchema = require('../models/publication/bookChapter.schema');
const conferenceSchema = require('../models/publication/conference.schema');
const patentSchema = require('../models/publication/patent.schema');
const researchProjectSchema = require('../models/publication/researchProject.schema');
const consultancySchema = require('../models/publication/consultancy.schema');
const researchCollaborationSchema = require('../models/publication/researchCollaboration.schema');
const researchSupportSchema = require('../models/publication/researchSupport.schema');


// ============================================================
// PUBLICATION TYPE → SCHEMA
// ============================================================

const typeSchemaMap = {
  journal: journalSchema,
  book: bookSchema,
  book_chapter: bookChapterSchema,
  conference: conferenceSchema,
  patent: patentSchema,
  research_project: researchProjectSchema,
  consultancy: consultancySchema,
  research_collaboration: researchCollaborationSchema,
  research_support: researchSupportSchema
};


// ============================================================
// VALID PUBLICATION TYPES
// ============================================================

const validPublicationTypes = publicationTypes.map(
  type => type.value
);


// ============================================================
// TEMPORARY MODEL CACHE
// ============================================================

const temporaryModelMap = {};


// ============================================================
// VALIDATE TYPE-SPECIFIC DETAILS
// ============================================================

const validateTypeDetails = (publicationType, typeDetails) => {

  const schema = typeSchemaMap[publicationType];

  if (!schema) {
    return {
      type_details: `Unsupported publication type: ${publicationType}`
    };
  }

  // Create temporary validation model only once
  if (!temporaryModelMap[publicationType]) {

    temporaryModelMap[publicationType] =
      mongoose.model(
        `PublicationValidation_${publicationType}`,
        schema
      );
  }

  const TemporaryModel =
    temporaryModelMap[publicationType];

  const document =
    new TemporaryModel(typeDetails || {});

  const error =
    document.validateSync();

  if (!error) {
    return null;
  }

  const errors = {};

  Object.keys(error.errors).forEach(field => {

    errors[field] =
      error.errors[field].message;

  });

  return errors;
};


// ============================================================
// CREATE PUBLICATION VALIDATOR
// ============================================================

const validateCreatePublication = (req, res, next) => {

  const {
    faculty,
    publication_type,
    title,
    authors,
    type_details
  } = req.body;

  const errors = {};


  // ----------------------------------------------------------
  // PUBLICATION TYPE
  // ----------------------------------------------------------

  if (!publication_type) {

    errors.publication_type =
      'Publication type is required';

  } else if (
    !validPublicationTypes.includes(publication_type)
  ) {

    errors.publication_type =
      'Invalid publication type';

  }


  // ----------------------------------------------------------
  // TITLE
  // ----------------------------------------------------------

  if (!title || !title.trim()) {

    errors.title =
      'Title is required';

  }


  // ----------------------------------------------------------
  // FACULTY
  // ----------------------------------------------------------

  if (faculty !== undefined && faculty !== null) {

    if (
      !mongoose.Types.ObjectId.isValid(faculty)
    ) {

      errors.faculty =
        'Invalid faculty ID';

    }

  }


  // ----------------------------------------------------------
  // AUTHORS
  // ----------------------------------------------------------

  if (
    authors !== undefined &&
    !Array.isArray(authors)
  ) {

    errors.authors =
      'Authors must be provided as an array';

  }


  // ----------------------------------------------------------
  // TYPE DETAILS
  // ----------------------------------------------------------

  if (
    !type_details ||
    typeof type_details !== 'object' ||
    Array.isArray(type_details)
  ) {

    errors.type_details =
      'Type-specific details are required';

  } else if (
    publication_type &&
    validPublicationTypes.includes(publication_type)
  ) {

    const typeErrors =
      validateTypeDetails(
        publication_type,
        type_details
      );

    if (typeErrors) {

      errors.type_details =
        typeErrors;

    }

  }


  // ----------------------------------------------------------
  // RETURN VALIDATION ERRORS
  // ----------------------------------------------------------

  if (Object.keys(errors).length > 0) {

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });

  }


  next();
};


// ============================================================
// UPDATE PUBLICATION VALIDATOR
// ============================================================

const validateUpdatePublication = (req, res, next) => {

  const {
    faculty,
    publication_type,
    title,
    authors,
    type_details
  } = req.body;

  const errors = {};


  // ----------------------------------------------------------
  // PUBLICATION TYPE
  // ----------------------------------------------------------

  if (
    publication_type &&
    !validPublicationTypes.includes(publication_type)
  ) {

    errors.publication_type =
      'Invalid publication type';

  }


  // ----------------------------------------------------------
  // TITLE
  // ----------------------------------------------------------

  if (
    title !== undefined &&
    (!title || !title.trim())
  ) {

    errors.title =
      'Title cannot be empty';

  }


  // ----------------------------------------------------------
  // FACULTY
  // ----------------------------------------------------------

  if (
    faculty !== undefined &&
    faculty !== null &&
    !mongoose.Types.ObjectId.isValid(faculty)
  ) {

    errors.faculty =
      'Invalid faculty ID';

  }


  // ----------------------------------------------------------
  // AUTHORS
  // ----------------------------------------------------------

  if (
    authors !== undefined &&
    !Array.isArray(authors)
  ) {

    errors.authors =
      'Authors must be provided as an array';

  }


  // ----------------------------------------------------------
  // TYPE DETAILS
  // ----------------------------------------------------------

  if (type_details !== undefined) {

    if (
      !publication_type ||
      !validPublicationTypes.includes(publication_type)
    ) {

      errors.type_details =
        'Valid publication_type is required when updating type_details';

    } else {

      const typeErrors =
        validateTypeDetails(
          publication_type,
          type_details
        );

      if (typeErrors) {

        errors.type_details =
          typeErrors;

      }

    }

  }


  // ----------------------------------------------------------
  // RETURN ERRORS
  // ----------------------------------------------------------

  if (Object.keys(errors).length > 0) {

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });

  }


  next();
};


// ============================================================
// GET PUBLICATION TYPES
// ============================================================

const getPublicationTypes = (req, res) => {

  return res.status(200).json({
    success: true,
    publicationTypes
  });

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  validateCreatePublication,
  validateUpdatePublication,
  validateTypeDetails,
  getPublicationTypes,
  typeSchemaMap
};