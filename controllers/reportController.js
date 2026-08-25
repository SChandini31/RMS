const ExcelJS = require("exceljs");
const Publication = require("../models/publicationModel");

// ============================================================
// PUBLICATION TYPES
// ============================================================

const PUBLICATION_TYPES = [
  "journal",
  "book",
  "book_chapter",
  "conference",
  "patent",
  "research_project",
  "consultancy",
  "research_collaboration",
  "research_support",
];


// ============================================================
// SHEET NAMES
// ============================================================

const SHEET_NAMES = {
  journal: "Journals",
  book: "Books",
  book_chapter: "Book Chapters",
  conference: "Conferences",
  patent: "Patents",
  research_project: "Research Projects",
  consultancy: "Consultancies",
  research_collaboration: "Research Collaborations",
  research_support: "Research Support",
};


// ============================================================
// COMMON EXCEL COLUMNS
// These are common Publication model fields
// ============================================================

const commonColumns = [
  {
    header: "Institution / Organization",
    key: "institution_organization",
  },
  {
    header: "School / Institute",
    key: "school",
  },
  {
    header: "Department",
    key: "department",
  },
  {
    header: "Faculty",
    key: "faculty",
  },
  {
    header: "Publication Type",
    key: "publication_type",
  },
  {
    header: "Title",
    key: "title",
  },
  {
    header: "Authors",
    key: "authors",
  },
  {
    header: "Abstract",
    key: "abstract",
  },
  {
    header: "Keywords",
    key: "keywords",
  },
  {
    header: "File Name",
    key: "fileName",
  },
  {
    header: "File URL",
    key: "upload",
  },
  {
    header: "Additional Notes",
    key: "additional_notes",
  },
  {
    header: "Uploaded By",
    key: "uploadedBy",
  },
  {
    header: "Created At",
    key: "createdAt",
  },
];


// ============================================================
// TYPE-SPECIFIC EXCEL COLUMNS
// IMPORTANT:
// These MUST MATCH the schemas you provided
// ============================================================

const typeColumns = {

  // ==========================================================
  // JOURNAL
  // ==========================================================

  journal: [
    {
      header: "Journal Name",
      key: "journal_name",
    },
    {
      header: "Publication Date",
      key: "publication_date",
    },
    {
      header: "Scope",
      key: "scope",
    },
    {
      header: "ISSN",
      key: "issn",
    },
    {
      header: "Impact Factor",
      key: "impact_factor",
    },
    {
      header: "Volume",
      key: "volume",
    },
    {
      header: "Issue",
      key: "issue",
    },
    {
      header: "Starting Page",
      key: "starting_page",
    },
    {
      header: "Ending Page",
      key: "ending_page",
    },
    {
      header: "Indexed In",
      key: "indexed_in",
    },
    {
      header: "Quartile",
      key: "quartile",
    },
    {
      header: "Citation Count",
      key: "citation_count",
    },
    {
      header: "DOI / Link",
      key: "doi_or_link",
    },
  ],


  // ==========================================================
  // BOOK
  // ==========================================================

  book: [
    {
      header: "Edition",
      key: "edition",
    },
    {
      header: "Publisher",
      key: "publisher",
    },
    {
      header: "Publication Date",
      key: "publication_date",
    },
    {
      header: "Scope",
      key: "scope",
    },
    {
      header: "DOI / Link",
      key: "doi_or_link",
    },
    {
      header: "Indexed In",
      key: "indexed_in",
    },
    {
      header: "ISBN",
      key: "isbn",
    },
  ],


  // ==========================================================
  // BOOK CHAPTER
  // ==========================================================

  book_chapter: [
    {
      header: "Chapter Title",
      key: "chapter_title",
    },
    {
      header: "Book Title",
      key: "book_title",
    },
    {
      header: "Editor",
      key: "editor",
    },
    {
      header: "Publisher",
      key: "publisher",
    },
    {
      header: "Publication Date",
      key: "publication_date",
    },
    {
      header: "Scope",
      key: "scope",
    },
    {
      header: "ISSN",
      key: "issn",
    },
    {
      header: "Volume",
      key: "volume",
    },
    {
      header: "Issue",
      key: "issue",
    },
    {
      header: "Starting Page",
      key: "starting_page",
    },
    {
      header: "Ending Page",
      key: "ending_page",
    },
    {
      header: "Indexed In",
      key: "indexed_in",
    },
    {
      header: "DOI / Link",
      key: "doi_or_link",
    },
  ],


  // ==========================================================
  // CONFERENCE
  // ==========================================================

  conference: [
    {
      header: "Conference Name",
      key: "conference_name",
    },
    {
      header: "Publication Date",
      key: "publication_date",
    },
    {
      header: "Scope",
      key: "scope",
    },
    {
      header: "Organizer / Society",
      key: "organizer_society",
    },
    {
      header: "Conference City",
      key: "conference_city",
    },
    {
      header: "Conference Country",
      key: "conference_country",
    },
    {
      header: "Conference Date",
      key: "conference_date",
    },
    {
      header: "Volume",
      key: "volume",
    },
    {
      header: "Issue",
      key: "issue",
    },
    {
      header: "Starting Page",
      key: "starting_page",
    },
    {
      header: "Ending Page",
      key: "ending_page",
    },
    {
      header: "Indexed In",
      key: "indexed_in",
    },
    {
      header: "DOI / Link",
      key: "doi_or_link",
    },
  ],


  // ==========================================================
  // PATENT
  // ==========================================================

  patent: [
    {
      header: "Application Date",
      key: "application_date",
    },
    {
      header: "Application Number",
      key: "application_number",
    },
    {
      header: "Patent Type",
      key: "patent_type",
    },
    {
      header: "Patent Status",
      key: "patent_status",
    },
    {
      header: "Publication Date",
      key: "publication_date",
    },
    {
      header: "Granted Date",
      key: "granted_date",
    },
    {
      header: "Commercialized",
      key: "is_commercialized",
    },
    {
      header: "Commercialization Details",
      key: "commercialization_details",
    },
    {
      header: "Patent URL",
      key: "patent_url",
    },
    {
      header: "Technology Transfer Status",
      key: "technology_transfer_status",
    },
    {
      header: "Licensing Status",
      key: "licensing_status",
    },
    {
      header: "Revenue Generated",
      key: "revenue_generated",
    },
    {
      header: "Industrial Adoption",
      key: "industrial_adoption",
    },
  ],


  // ==========================================================
  // RESEARCH PROJECT
  // ==========================================================

  research_project: [
    {
      header: "Application Date",
      key: "application_date",
    },
    {
      header: "Project Value",
      key: "project_value",
    },
    {
      header: "Funding Agency",
      key: "funding_agency",
    },
    {
      header: "Scheme Name",
      key: "scheme_name",
    },
    {
      header: "Sanctioned Amount",
      key: "sanctioned_amount",
    },
    {
      header: "Sanction Date",
      key: "sanction_date",
    },
    {
      header: "Duration",
      key: "duration",
    },
    {
      header: "Status",
      key: "status",
    },
    {
      header: "Outcome",
      key: "outcome",
    },
    {
      header: "Student Involvement",
      key: "student_involvement",
    },
    {
      header: "Societal / Industrial Impact",
      key: "societal_industrial_impact",
    },
  ],


  // ==========================================================
  // CONSULTANCY
  // ==========================================================

  consultancy: [
    {
      header: "Application Date",
      key: "application_date",
    },
    {
      header: "Project Value",
      key: "project_value",
    },
    {
      header: "Client Name",
      key: "client_name",
    },
    {
      header: "Consultant Assignment Type",
      key: "consultant_assignment_type",
    },
    {
      header: "Sanctioned Amount",
      key: "sanctioned_amount",
    },
    {
      header: "Sanction Date",
      key: "sanction_date",
    },
    {
      header: "Duration",
      key: "duration",
    },
    {
      header: "Status",
      key: "status",
    },
  ],


  // ==========================================================
  // RESEARCH COLLABORATION
  // ==========================================================

  research_collaboration: [
    {
      header: "Collaborator Name",
      key: "collaborator_name",
    },
    {
      header: "Collaborator Organization",
      key: "collaborator_organization",
    },
    {
      header: "Collaborator Country",
      key: "collaborator_country",
    },
    {
      header: "PI Name",
      key: "pi_name",
    },
    {
      header: "PI Designation",
      key: "pi_designation",
    },
    {
      header: "Nature of Collaboration",
      key: "nature_of_collaboration",
    },
    {
      header: "Collaboration Type",
      key: "collaboration_type",
    },
    {
      header: "Research Area / Project Title",
      key: "research_area_project_title",
    },
    {
      header: "Collaboration Status",
      key: "collaboration_status",
    },
    {
      header: "Collaboration Proposed Date",
      key: "collaboration_proposed_date",
    },
    {
      header: "Funding",
      key: "funding",
    },
    {
      header: "Collaboration Start Date",
      key: "collaboration_start_date",
    },
    {
      header: "Collaboration End Date",
      key: "collaboration_end_date",
    },
    {
      header: "Supporting Document Available",
      key: "supporting_document_available",
    },
    {
      header: "Status",
      key: "status",
    },
    {
      header: "Collaboration Outcomes",
      key: "collaboration_outcomes",
    },
    {
      header: "Other Outcome Details",
      key: "other_outcome_details",
    },
  ],


  // ==========================================================
  // RESEARCH SUPPORT
  // ==========================================================

  research_support: [
    {
      header: "Support Type",
      key: "support_type",
    },
    {
      header: "Support Provided By",
      key: "support_provided_by",
    },
    {
      header: "Year",
      key: "year",
    },
    {
      header: "Outcome / Impact",
      key: "outcome_impact",
    },
  ],
};


// ============================================================
// FORMAT VALUE FOR EXCEL
// ============================================================

const formatExcelValue = (value) => {

  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  return value;
};


// ============================================================
// FORMAT AUTHORS
// ============================================================

const formatAuthors = (authors) => {

  if (!Array.isArray(authors)) {
    return "";
  }

  return authors
    .map((author) => {

      if (!author) {
        return "";
      }

      const name = author.name || "";
      const position = author.position || "";

      if (name && position) {
        return `${name} (${position})`;
      }

      return name || position;

    })
    .filter(Boolean)
    .join(", ");
};


// ============================================================
// CREATE COMMON ROW
// ============================================================

const createCommonRow = (publication) => {

  return {
    institution_organization:
      publication.institution_organization || "",

    school:
      publication.school || "",

    department:
      publication.department || "",

    faculty:
      publication.faculty?.name ||
      publication.faculty ||
      "",

    publication_type:
      publication.publication_type || "",

    title:
      publication.title || "",

    authors:
      formatAuthors(publication.authors),

    abstract:
      publication.abstract || "",

    keywords:
      formatExcelValue(publication.keywords),

    fileName:
      publication.fileName || "",

    upload:
      publication.upload || "",

    additional_notes:
      publication.additional_notes || "",

    uploadedBy:
      publication.uploadedBy?.name ||
      publication.uploadedBy?.email ||
      publication.uploadedBy ||
      "",

    createdAt:
      publication.createdAt
        ? new Date(publication.createdAt)
        : "",
  };
};


// ============================================================
// CREATE TYPE-SPECIFIC ROW
// ============================================================

const createTypeRow = (publication) => {

  const details =
    publication.type_details || {};

  const row = {};


  // ----------------------------------------------------------
  // NORMAL FIELDS
  // ----------------------------------------------------------

  Object.keys(details).forEach((key) => {

    if (
      key !== "commercialization"
    ) {

      row[key] =
        formatExcelValue(details[key]);

    }

  });


  // ----------------------------------------------------------
  // PATENT COMMERCIALIZATION
  // ----------------------------------------------------------

  if (
    publication.publication_type === "patent"
  ) {

    row.is_commercialized =
      details.commercialization?.is_commercialized
        ? "Yes"
        : "No";

    row.commercialization_details =
      details.commercialization?.details || "";

  }


  return row;
};


// ============================================================
// BUILD WORKSHEET
// ============================================================

const buildWorksheet = (
  workbook,
  publications,
  publicationType,
  includeCommon = true
) => {

  const worksheet =
    workbook.addWorksheet(
      SHEET_NAMES[publicationType] ||
      publicationType
    );


  const columns = [
    ...(includeCommon ? commonColumns : []),
    ...(typeColumns[publicationType] || []),
  ];


  worksheet.columns = columns.map(
    (column) => ({
      header: column.header,
      key: column.key,
      width: Math.max(
        15,
        Math.min(
          35,
          column.header.length + 5
        )
      ),
    })
  );


  publications.forEach(
    (publication) => {

      const commonRow =
        createCommonRow(publication);

      const typeRow =
        createTypeRow(publication);

      worksheet.addRow({
        ...commonRow,
        ...typeRow,
      });

    }
  );


  // ----------------------------------------------------------
  // HEADER STYLE
  // ----------------------------------------------------------

  worksheet.getRow(1).font = {
    bold: true,
  };

  worksheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
  };


  // ----------------------------------------------------------
  // FILTER
  // ----------------------------------------------------------

  worksheet.autoFilter = {
    from: "A1",
    to: `${String.fromCharCode(
      64 + Math.min(columns.length, 26)
    )}1`,
  };


  // ----------------------------------------------------------
  // FREEZE HEADER
  // ----------------------------------------------------------

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  return worksheet;
};


// ============================================================
// DATE FILTER
// ============================================================

const buildDateFilter = (from, to) => {

  const filter = {};

  if (from) {

    const fromDate =
      new Date(`${from}T00:00:00.000Z`);

    if (!Number.isNaN(fromDate.getTime())) {
      filter.createdAt = {
        $gte: fromDate,
      };
    }

  }


  if (to) {

    const toDate =
      new Date(`${to}T23:59:59.999Z`);

    if (!Number.isNaN(toDate.getTime())) {

      if (!filter.createdAt) {
        filter.createdAt = {};
      }

      filter.createdAt.$lte = toDate;

    }

  }

  return filter;
};


// ============================================================
// GET PUBLICATION METRICS
//
// GET /api/reports/publications?from=YYYY-MM-DD&to=YYYY-MM-DD
//
// Returns:
// {
//   success: true,
//   data: [
//      { label: "Journal", value: 5 },
//      { label: "Book", value: 3 },
//      ...
//   ]
// }
//
// ============================================================

const getPublicationMetrics = async (req, res) => {

  try {

    const {
      from,
      to,
    } = req.query;


    // --------------------------------------------------------
    // VALIDATE DATES
    // --------------------------------------------------------

    if (!from || !to) {

      return res.status(400).json({
        success: false,
        message: "From date and To date are required",
      });

    }


    if (from > to) {

      return res.status(400).json({
        success: false,
        message: "From date cannot be greater than To date",
      });

    }


    // --------------------------------------------------------
    // DATE FILTER
    // --------------------------------------------------------

    const dateFilter =
      buildDateFilter(from, to);


    // --------------------------------------------------------
    // AGGREGATE PUBLICATIONS
    // --------------------------------------------------------

    const metrics =
      await Publication.aggregate([
        {
          $match: dateFilter,
        },

        {
          $group: {
            _id: "$publication_type",
            value: {
              $sum: 1,
            },
          },
        },
      ]);


    // --------------------------------------------------------
    // KEEP ALL PUBLICATION TYPES
    // Even if count = 0
    // --------------------------------------------------------

    const metricMap = {};

    metrics.forEach((item) => {

      metricMap[item._id] =
        item.value;

    });


    const data =
      PUBLICATION_TYPES.map(
        (type) => ({

          label:
            type
              .split("_")
              .map(
                word =>
                  word.charAt(0).toUpperCase() +
                  word.slice(1)
              )
              .join(" "),

          value:
            metricMap[type] || 0,

          publication_type:
            type,

        })
      );


    return res.status(200).json({
      success: true,
      from,
      to,
      total:
        data.reduce(
          (sum, item) =>
            sum + item.value,
          0
        ),
      data,
    });


  } catch (error) {

    console.error(
      "GET PUBLICATION METRICS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch publication metrics",
      error: error.message,
    });

  }

};


// ============================================================
// EXPORT PUBLICATIONS TO EXCEL
//
// GET
// /api/reports/publications/excel?type=all&from=2026-08-01&to=2026-08-25
//
// ============================================================

const exportPublicationsToExcel = async (
  req,
  res
) => {

  try {

    const {
      type = "all",
      from,
      to,
    } = req.query;


    // --------------------------------------------------------
    // VALIDATE TYPE
    // --------------------------------------------------------

    if (
      type !== "all" &&
      !PUBLICATION_TYPES.includes(type)
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid publication type",
      });

    }


    // --------------------------------------------------------
    // VALIDATE DATE RANGE
    // --------------------------------------------------------

    if (from && to && from > to) {

      return res.status(400).json({
        success: false,
        message:
          "From date cannot be greater than To date",
      });

    }


    // --------------------------------------------------------
    // BUILD FILTER
    // --------------------------------------------------------

    const query = {
      ...buildDateFilter(from, to),
    };


    // --------------------------------------------------------
    // TYPE FILTER
    // --------------------------------------------------------

    if (type !== "all") {

      query.publication_type =
        type;

    }


    // --------------------------------------------------------
    // FETCH PUBLICATIONS
    // --------------------------------------------------------

    const publications =
      await Publication.find(query)
        .populate(
          "faculty",
          "name email role"
        )
        .populate(
          "uploadedBy",
          "name email role"
        )
        .sort({
          createdAt: -1,
        })
        .lean();


    // --------------------------------------------------------
    // NO DATA
    // --------------------------------------------------------

    if (publications.length === 0) {

      return res.status(404).json({
        success: false,
        message:
          "No publications found for the selected date range",
      });

    }


    // --------------------------------------------------------
    // CREATE WORKBOOK
    // --------------------------------------------------------

    const workbook =
      new ExcelJS.Workbook();


    workbook.creator =
      "Research Management System";

    workbook.created =
      new Date();


    // --------------------------------------------------------
    // ALL TYPES
    // --------------------------------------------------------

    if (type === "all") {

      PUBLICATION_TYPES.forEach(
        (publicationType) => {

          const filtered =
            publications.filter(
              (publication) =>
                publication.publication_type ===
                publicationType
            );


          // Create sheet even when empty
          buildWorksheet(
            workbook,
            filtered,
            publicationType,
            true
          );

        }
      );

    }

    // --------------------------------------------------------
    // SINGLE TYPE
    // --------------------------------------------------------

    else {

      buildWorksheet(
        workbook,
        publications,
        type,
        true
      );

    }


    // --------------------------------------------------------
    // RESPONSE HEADERS
    // --------------------------------------------------------

    const fileName =
      type === "all"
        ? `publications-${from || "all"}-to-${to || "all"}.xlsx`
        : `${type}-publications-${from || "all"}-to-${to || "all"}.xlsx`;


    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );


    // --------------------------------------------------------
    // WRITE TO RESPONSE
    // IMPORTANT:
    // We are NOT saving the Excel file to disk.
    //
    // Therefore you won't get:
    // EBUSY resource locked
    //
    // --------------------------------------------------------

    await workbook.xlsx.write(res);

    res.end();


  } catch (error) {

    console.error(
      "EXPORT PUBLICATIONS EXCEL ERROR:",
      error
    );

    if (!res.headersSent) {

      return res.status(500).json({
        success: false,
        message:
          "Failed to export publications to Excel",
        error:
          error.message,
      });

    }

  }

};


// ============================================================
// EXPORT CONTROLLER
// ============================================================

module.exports = {
  getPublicationMetrics,
  exportPublicationsToExcel,
};