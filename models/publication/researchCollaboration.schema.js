const mongoose = require('mongoose');

const researchCollaborationSchema = new mongoose.Schema(
  {
    collaborator_name: {
      type: String,
      required: true,
      trim: true
    },

    collaborator_organization: {
      type: String,
      required: true,
      trim: true
    },

    collaborator_country: {
      type: String,
      required: true,
      trim: true
    },

    pi_name: {
      type: String,
      required: true,
      trim: true
    },

    pi_designation: {
      type: String,
      required: true,
      trim: true
    },

    nature_of_collaboration: {
      type: String,
      enum: ['Project', 'Publication', 'Patent'],
      required: true
    },

    collaboration_type: {
      type: String,
      enum: [
        'National',
        'International',
        'Industry',
        'Academic'
      ],
      required: true
    },

    research_area_project_title: {
      type: String,
      required: true,
      trim: true
    },

    collaboration_status: {
      type: String,
      enum: [
        'Proposed',
        'Ongoing',
        'Published',
        'Completed'
      ],
      required: true
    },

    collaboration_proposed_date: {
      type: Date,
      default: null
    },

    funding: {
      type: String,
      trim: true,
      default: ''
    },

    collaboration_start_date: {
      type: Date,
      default: null
    },

    collaboration_end_date: {
      type: Date,
      default: null
    },

    supporting_document_available: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: [
        'Applied',
        'Ongoing',
        'Completed'
      ],
      default: null
    },

    collaboration_outcomes: {
      type: [String],
      enum: [
        'Joint Publications',
        'Joint Projects',
        'Student Internships',
        'Faculty Exchange',
        'Student Exchange',
        'Funded Projects',
        'Research Visits',
        'Other Outcomes'
      ],
      default: []
    },

    other_outcome_details: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

module.exports = researchCollaborationSchema;