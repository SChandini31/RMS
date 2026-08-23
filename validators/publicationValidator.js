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
// PARSE JSON FIELD FROM MULTIPART/FORM-DATA
// ============================================================

const parseJsonField = (value, fieldName) => {

  // Field was not provided
  if (value === undefined || value === null || value === '') {
    return {
      value: value,
      error: null
    };
  }

  // Already an object/array
  if (typeof value !== 'string') {
    return {
      value: value,
      error: null
    };
  }

  try {

    return {
      value: JSON.parse(value),
      error: null
    };

  } catch (error) {

    return {
      value: null,
      error: `${fieldName} must contain valid JSON`
    };

  }
};


// ============================================================
// VALIDATE TYPE-SPECIFIC DETAILS
// ============================================================

const validateTypeDetails = (
  publicationType,
  typeDetails
) => {

  const schema = typeSchemaMap[publicationType];

  if (!schema) {

    return {
      type_details:
        `Unsupported publication type: ${publicationType}`
    };

  }


  // ----------------------------------------------------------
  // CREATE TEMPORARY VALIDATION MODEL
  // ----------------------------------------------------------

  if (!temporaryModelMap[publicationType]) {

    temporaryModelMap[publicationType] =
      mongoose.model(
        `PublicationValidation_${publicationType}`,
        schema
      );

  }


  const TemporaryModel =
    temporaryModelMap[publicationType];


  // ----------------------------------------------------------
  // CREATE TEMPORARY DOCUMENT
  // ----------------------------------------------------------

  const document =
    new TemporaryModel(typeDetails || {});


  // ----------------------------------------------------------
  // RUN MONGOOSE VALIDATION
  // ----------------------------------------------------------

  const error =
    document.validateSync();


  // No validation errors
  if (!error) {
    return null;
  }


  // ----------------------------------------------------------
  // COLLECT VALIDATION ERRORS
  // ----------------------------------------------------------

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

const validateCreatePublication = (
  req,
  res,
  next
) => {

  // ==========================================================
  // PARSE AUTHORS
  // ==========================================================

  const authorsResult =
    parseJsonField(
      req.body.authors,
      'authors'
    );


  // ==========================================================
  // PARSE TYPE DETAILS
  // ==========================================================

  const typeDetailsResult =
    parseJsonField(
      req.body.type_details,
      'type_details'
    );


  // ==========================================================
  // PARSE KEYWORDS
  // ==========================================================

  const keywordsResult =
    parseJsonField(
      req.body.keywords,
      'keywords'
    );


  // ==========================================================
  // PUT PARSED VALUES BACK INTO req.body
  // ==========================================================

  if (!authorsResult.error) {

    req.body.authors =
      authorsResult.value;

  }


  if (!typeDetailsResult.error) {

    req.body.type_details =
      typeDetailsResult.value;

  }


  if (!keywordsResult.error) {

    req.body.keywords =
      keywordsResult.value;

  }


  // ==========================================================
  // GET REQUEST DATA
  // ==========================================================

  const {
    faculty,
    publication_type,
    title,
    authors,
    type_details,
    keywords
  } = req.body;


  const errors = {};


  // ==========================================================
  // JSON PARSING ERRORS
  // ==========================================================

  if (authorsResult.error) {

    errors.authors =
      authorsResult.error;

  }


  if (typeDetailsResult.error) {

    errors.type_details =
      typeDetailsResult.error;

  }


  if (keywordsResult.error) {

    errors.keywords =
      keywordsResult.error;

  }


  // ==========================================================
  // PUBLICATION TYPE
  // ==========================================================

  if (!publication_type) {

    errors.publication_type =
      'Publication type is required';

  } else if (
    !validPublicationTypes.includes(
      publication_type
    )
  ) {

    errors.publication_type =
      'Invalid publication type';

  }


  // ==========================================================
  // TITLE
  // ==========================================================

  if (
    !title ||
    typeof title !== 'string' ||
    !title.trim()
  ) {

    errors.title =
      'Title is required';

  }


  // ==========================================================
  // FACULTY
  // ==========================================================

  if (
    faculty !== undefined &&
    faculty !== null &&
    faculty !== ''
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        faculty
      )
    ) {

      errors.faculty =
        'Invalid faculty ID';

    }

  }


  // ==========================================================
  // AUTHORS
  // ==========================================================

  if (
    authors !== undefined &&
    authors !== null &&
    !Array.isArray(authors)
  ) {

    errors.authors =
      'Authors must be provided as an array';

  }


  // ==========================================================
  // KEYWORDS
  // ==========================================================

  if (
    keywords !== undefined &&
    keywords !== null &&
    !Array.isArray(keywords)
  ) {

    errors.keywords =
      'Keywords must be provided as an array';

  }


  // ==========================================================
  // TYPE DETAILS
  // ==========================================================

  if (
    !type_details ||
    typeof type_details !== 'object' ||
    Array.isArray(type_details)
  ) {

    if (!errors.type_details) {

      errors.type_details =
        'Type-specific details are required';

    }

  } else if (
    publication_type &&
    validPublicationTypes.includes(
      publication_type
    )
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


  // ==========================================================
  // RETURN VALIDATION ERRORS
  // ==========================================================

  if (
    Object.keys(errors).length > 0
  ) {

    return res.status(400).json({

      success: false,

      message: 'Validation failed',

      errors

    });

  }


  // ==========================================================
  // CONTINUE TO CONTROLLER
  // ==========================================================

  next();

};


// ============================================================
// GET PUBLICATION TYPES
// ============================================================

const getPublicationTypes = (
  req,
  res
) => {

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