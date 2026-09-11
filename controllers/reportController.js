const ExcelJS = require("exceljs");
const Publication = require("../models/publicationModel");
const User = require("../models/userModel");

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
// GET ACTIVE ROLE
//
// Supports the new multiple-role user system.
//
// Priority:
// 1. activeRole from JWT
// 2. first role from database
//
// ============================================================

const getActiveRole = async (req) => {
  const user = await User.findById(req.user.id).lean();

  if (!user) {
    return {
      user: null,
      activeRole: null,
    };
  }

  const activeRole =
    req.user.activeRole ||
    (Array.isArray(user.role)
      ? user.role[0]
      : user.role);

  return {
    user,
    activeRole,
  };
};

// ============================================================
// DISPLAY NAMES
// ============================================================

const DISPLAY_NAMES = {
  journal: "Journal",
  book: "Book",
  book_chapter: "Book Chapter",
  conference: "Conference",
  patent: "Patent",
  research_project: "Research Project",
  consultancy: "Consultancy",
  research_collaboration: "Research Collaboration",
  research_support: "Research Support",
};

// ============================================================
// COMMON PUBLICATION FIELDS
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
  {
    header: "Final Status",
    key: "finalStatus",
  },
];

// ============================================================
// TYPE-SPECIFIC FIELDS
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
// FORMAT EXCEL VALUE
// ============================================================

const formatExcelValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  // Arrays
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        formatExcelValue(item)
      )
      .filter(
        (item) => item !== ""
      )
      .join(", ");
  }

  // Date
  if (value instanceof Date) {
    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "";
    }

    return value
      .toISOString()
      .split("T")[0];
  }

  // Object
  if (
    typeof value === "object"
  ) {
    return JSON.stringify(value);
  }

  return value;
};

// ============================================================
// FORMAT AUTHORS
// ============================================================

const formatAuthors = (
  authors
) => {
  if (
    !Array.isArray(authors)
  ) {
    return "";
  }

  return authors
    .map((author) => {
      if (!author) {
        return "";
      }

      const name =
        author.name || "";

      const position =
        author.position || "";

      if (
        name &&
        position
      ) {
        return `${name} (${position})`;
      }

      return (
        name ||
        position
      );
    })
    .filter(Boolean)
    .join(", ");
};

// ============================================================
// FORMAT FACULTY
// ============================================================

const formatFaculty = (
  faculty
) => {
  if (!faculty) {
    return "";
  }

  if (
    typeof faculty ===
    "object"
  ) {
    return (
      faculty.name ||
      faculty.email ||
      ""
    );
  }

  return faculty;
};

// ============================================================
// FORMAT UPLOADED BY
// ============================================================

const formatUploadedBy = (
  uploadedBy
) => {
  if (!uploadedBy) {
    return "";
  }

  if (
    typeof uploadedBy ===
    "object"
  ) {
    return (
      uploadedBy.name ||
      uploadedBy.email ||
      ""
    );
  }

  return uploadedBy;
};

// ============================================================
// CREATE COMMON ROW
// ============================================================

const createCommonRow = (
  publication
) => {
  return {
    institution_organization:
      publication
        .institution_organization ||
      "",

    school:
      publication.school ||
      "",

    department:
      publication.department ||
      "",

    faculty:
      formatFaculty(
        publication.faculty
      ),

    publication_type:
      publication
        .publication_type ||
      "",

    title:
      publication.title ||
      "",

    authors:
      formatAuthors(
        publication.authors
      ),

    abstract:
      publication.abstract ||
      "",

    keywords:
      formatExcelValue(
        publication.keywords
      ),

    fileName:
      publication.fileName ||
      "",

    upload:
      publication.upload ||
      "",

    additional_notes:
      publication
        .additional_notes ||
      "",

    uploadedBy:
      formatUploadedBy(
        publication.uploadedBy
      ),

    createdAt:
      publication.createdAt
        ? new Date(
            publication.createdAt
          )
        : "",

    finalStatus:
      publication.finalStatus ===
      "approved"
        ? "Approved"
        : publication.finalStatus ===
          "rejected"
        ? "Rejected"
        : "Pending",
  };
};

// ============================================================
// CREATE TYPE-SPECIFIC ROW
// ============================================================

const createTypeRow = (
  publication
) => {
  const details =
    publication.type_details ||
    {};

  const row = {};

  const publicationType =
    publication.publication_type;

  const columns =
    typeColumns[
      publicationType
    ] || [];

  columns.forEach(
    (column) => {
      const key =
        column.key;

      // Patent nested commercialization
      if (
        key ===
        "is_commercialized"
      ) {
        row[key] =
          details
            .commercialization
            ?.is_commercialized
            ? "Yes"
            : "No";

        return;
      }

      if (
        key ===
        "commercialization_details"
      ) {
        row[key] =
          details
            .commercialization
            ?.details || "";

        return;
      }

      row[key] =
        formatExcelValue(
          details[key]
        );
    }
  );

  return row;
};

// ============================================================
// EXCEL COLUMN LETTER
// ============================================================

const getExcelColumnLetter = (
  columnNumber
) => {
  let result = "";

  let number =
    columnNumber;

  while (
    number > 0
  ) {
    const remainder =
      (number - 1) %
      26;

    result =
      String.fromCharCode(
        65 + remainder
      ) + result;

    number =
      Math.floor(
        (number - 1) /
          26
      );
  }

  return result;
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
      SHEET_NAMES[
        publicationType
      ] ||
        publicationType
    );

  // ----------------------------------------------------------
  // COLUMNS
  // ----------------------------------------------------------

  const columns = [
    ...(includeCommon
      ? commonColumns
      : []),

    ...(typeColumns[
      publicationType
    ] || []),
  ];

  worksheet.columns =
    columns.map(
      (column) => ({
        header:
          column.header,

        key:
          column.key,

        width:
          Math.max(
            15,
            Math.min(
              40,
              column
                .header
                .length + 5
            )
          ),
      })
    );

  // ----------------------------------------------------------
  // ROWS
  // ----------------------------------------------------------

  publications.forEach(
    (publication) => {
      const commonRow =
        createCommonRow(
          publication
        );

      const typeRow =
        createTypeRow(
          publication
        );

      worksheet.addRow({
        ...commonRow,
        ...typeRow,
      });
    }
  );

  // ----------------------------------------------------------
  // HEADER STYLE
  // ----------------------------------------------------------

  const headerRow =
    worksheet.getRow(1);

  headerRow.font = {
    bold: true,
  };

  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  headerRow.height = 25;

  // ----------------------------------------------------------
  // HEADER BORDER
  // ----------------------------------------------------------

  headerRow.eachCell(
    (cell) => {
      cell.border = {
        top: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      };
    }
  );

  // ----------------------------------------------------------
  // WRAP TEXT FOR DATA
  // ----------------------------------------------------------

  worksheet.eachRow(
    (row, rowNumber) => {
      if (
        rowNumber === 1
      ) {
        return;
      }

      row.eachCell(
        (cell) => {
          cell.alignment = {
            vertical: "top",
            wrapText: true,
          };
        }
      );
    }
  );

  // ----------------------------------------------------------
  // AUTO FILTER
  // ----------------------------------------------------------

  if (
    columns.length > 0
  ) {
    const lastColumn =
      getExcelColumnLetter(
        columns.length
      );

    worksheet.autoFilter =
      {
        from: "A1",
        to: `${lastColumn}1`,
      };
  }

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
// BUILD DATE FILTER
// ============================================================

const buildDateFilter = (
  from,
  to
) => {
  const filter = {};

  if (from) {
    const fromDate =
      new Date(
        `${from}T00:00:00.000Z`
      );

    if (
      !Number.isNaN(
        fromDate.getTime()
      )
    ) {
      filter.createdAt = {
        $gte: fromDate,
      };
    }
  }

  if (to) {
    const toDate =
      new Date(
        `${to}T23:59:59.999Z`
      );

    if (
      !Number.isNaN(
        toDate.getTime()
      )
    ) {
      if (
        !filter.createdAt
      ) {
        filter.createdAt = {};
      }

      filter.createdAt.$lte =
        toDate;
    }
  }

  return filter;
};

// ============================================================
// VALIDATE DATE STRING
// ============================================================

const isValidDateString = (
  date
) => {
  if (!date) {
    return false;
  }

  // Expected:
  // YYYY-MM-DD

  const dateRegex =
    /^\d{4}-\d{2}-\d{2}$/;

  if (
    !dateRegex.test(date)
  ) {
    return false;
  }

  const parsedDate =
    new Date(
      `${date}T00:00:00.000Z`
    );

  return !Number.isNaN(
    parsedDate.getTime()
  );
};

// ============================================================
// GET PUBLICATION METRICS
//
// GET
// /api/reports/publications
//
// ROLE SCOPE:
//
// super_admin  -> Institution-wide
// special_user -> Institution-wide
// directorate  -> Institution-wide
// admin        -> Own department
// faculty      -> Own publications
// student      -> Own publications
//
// ============================================================

const getPublicationMetrics = async (
  req,
  res
) => {
  try {
    const {
      from,
      to,
    } = req.query;

    // --------------------------------------------------------
    // REQUIRED DATES
    // --------------------------------------------------------

    if (
      !from ||
      !to
    ) {
      return res.status(400).json({
        success: false,
        message:
          "From date and To date are required",
      });
    }

    // --------------------------------------------------------
    // DATE FORMAT VALIDATION
    // --------------------------------------------------------

    if (
      !isValidDateString(
        from
      ) ||
      !isValidDateString(
        to
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Dates must be in YYYY-MM-DD format",
      });
    }

    // --------------------------------------------------------
    // DATE RANGE VALIDATION
    // --------------------------------------------------------

    if (from > to) {
      return res.status(400).json({
        success: false,
        message:
          "From date cannot be greater than To date",
      });
    }

    // --------------------------------------------------------
    // GET USER + ACTIVE ROLE
    // --------------------------------------------------------

    const {
      user,
      activeRole,
    } =
      await getActiveRole(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    console.log(
      "METRICS USER:",
      {
        userId:
          user._id,

        activeRole,

        roles:
          user.role,

        department:
          user.department,
      }
    );

    // --------------------------------------------------------
    // BUILD DATE FILTER
    // --------------------------------------------------------

    const matchFilter = {
      ...buildDateFilter(
        from,
        to
      ),
    };

    // --------------------------------------------------------
    // ROLE-BASED SCOPE
    // --------------------------------------------------------

    switch (activeRole) {

      // ------------------------------------------------------
      // INSTITUTION-WIDE
      // ------------------------------------------------------

      case "super_admin":
      case "special_user":
      case "directorate":

        // No additional filter.

        break;


      // ------------------------------------------------------
      // ADMIN
      //
      // Only publications from admin's department.
      // ------------------------------------------------------

      case "admin":

        matchFilter.department =
          user.department;

        break;


      // ------------------------------------------------------
      // FACULTY
      //
      // Only publications where faculty reference
      // matches the logged-in faculty.
      // ------------------------------------------------------

      case "faculty":

        matchFilter.faculty =
          user._id;

        break;


      // ------------------------------------------------------
      // STUDENT
      //
      // Only publications uploaded by logged-in student.
      // ------------------------------------------------------

      case "student":

        matchFilter.uploadedBy =
          user._id;

        break;


      // ------------------------------------------------------
      // INVALID ROLE
      // ------------------------------------------------------

      default:

        return res.status(403).json({
          success: false,
          message:
            "Invalid or unauthorized role",
        });
    }

    // --------------------------------------------------------
    // AGGREGATE
    // --------------------------------------------------------

    const metrics =
      await Publication.aggregate([
        {
          $match:
            matchFilter,
        },

        {
          $group: {
            _id:
              "$publication_type",

            value: {
              $sum: 1,
            },
          },
        },
      ]);

    // --------------------------------------------------------
    // CREATE MAP
    // --------------------------------------------------------

    const metricMap = {};

    metrics.forEach(
      (item) => {
        metricMap[
          item._id
        ] =
          item.value;
      }
    );

    // --------------------------------------------------------
    // ALWAYS RETURN ALL PUBLICATION TYPES
    // --------------------------------------------------------

    const data =
      PUBLICATION_TYPES.map(
        (type) => ({
          label:
            DISPLAY_NAMES[
              type
            ] || type,

          value:
            metricMap[
              type
            ] || 0,

          publication_type:
            type,
        })
      );

    // --------------------------------------------------------
    // TOTAL
    // --------------------------------------------------------

    const total =
      data.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.value,
        0
      );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      from,

      to,

      total,

      data,
    });

  } catch (error) {

    console.error(
      "GET PUBLICATION METRICS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch publication metrics",

      error:
        error.message,
    });
  }
};

// ============================================================
// EXPORT PUBLICATIONS TO EXCEL
//
// GET
//
// /api/reports/publications/excel
//
// EXCEL PERMISSION:
//
// super_admin  -> ALLOWED
// directorate  -> ALLOWED
//
// special_user -> NOT ALLOWED
// admin        -> NOT ALLOWED
// faculty      -> NOT ALLOWED
// student      -> NOT ALLOWED
//
// ============================================================

const exportPublicationsToExcel =
  async (
    req,
    res
  ) => {
    try {

      const {
        type = "all",
        status = "all",
        from,
        to,
      } = req.query;

      // ------------------------------------------------------
      // GET USER + ACTIVE ROLE
      // ------------------------------------------------------

      const {
        user,
        activeRole,
      } =
        await getActiveRole(
          req
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      console.log(
        "EXCEL EXPORT USER:",
        {
          userId:
            user._id,

          activeRole,

          roles:
            user.role,
        }
      );

      // ------------------------------------------------------
      // EXCEL PERMISSION
      //
      // ONLY super_admin and directorate
      // ------------------------------------------------------

      const canDownloadExcel =
        [
          "super_admin",
          "directorate",
        ].includes(
          activeRole
        );

      if (
        !canDownloadExcel
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to download Excel reports",
        });
      }

      // ------------------------------------------------------
      // VALIDATE TYPE
      // ------------------------------------------------------

      if (
        type !== "all" &&
        !PUBLICATION_TYPES.includes(
          type
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid publication type",
        });
      }

      // ------------------------------------------------------
      // VALIDATE STATUS
      // ------------------------------------------------------

      if (
        status !== "all" &&
        status !== "approved" &&
        status !== "not_approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid publication status",
        });
      }

      // ------------------------------------------------------
      // VALIDATE FROM DATE
      // ------------------------------------------------------

      if (
        from &&
        !isValidDateString(
          from
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "From date must be in YYYY-MM-DD format",
        });
      }

      // ------------------------------------------------------
      // VALIDATE TO DATE
      // ------------------------------------------------------

      if (
        to &&
        !isValidDateString(
          to
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "To date must be in YYYY-MM-DD format",
        });
      }

      // ------------------------------------------------------
      // VALIDATE DATE RANGE
      // ------------------------------------------------------

      if (
        from &&
        to &&
        from > to
      ) {
        return res.status(400).json({
          success: false,
          message:
            "From date cannot be greater than To date",
        });
      }

      // ------------------------------------------------------
      // BUILD MONGO QUERY
      // ------------------------------------------------------

      const query = {
        ...buildDateFilter(
          from,
          to
        ),
      };

      // ------------------------------------------------------
      // TYPE FILTER
      // ------------------------------------------------------

      if (
        type !== "all"
      ) {
        query.publication_type =
          type;
      }

      // ------------------------------------------------------
      // FINAL STATUS FILTER
      // ------------------------------------------------------

      if (
        status ===
        "approved"
      ) {
        query.finalStatus =
          "approved";
      }

      if (
        status ===
        "not_approved"
      ) {
        query.finalStatus = {
          $in: [
            "pending",
            "rejected",
          ],
        };
      }

      // ------------------------------------------------------
      // FETCH PUBLICATIONS
      // ------------------------------------------------------

      const publications =
        await Publication.find(
          query
        )
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

      // ------------------------------------------------------
      // NO DATA
      // ------------------------------------------------------

      if (
        publications.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "No publications found for the selected date range",
        });
      }

      // ------------------------------------------------------
      // CREATE WORKBOOK
      // ------------------------------------------------------

      const workbook =
        new ExcelJS.Workbook();

      workbook.creator =
        "Research Management System";

      workbook.lastModifiedBy =
        "Research Management System";

      workbook.created =
        new Date();

      workbook.modified =
        new Date();

      // ------------------------------------------------------
      // ALL PUBLICATION TYPES
      // ------------------------------------------------------

      if (
        type === "all"
      ) {

        PUBLICATION_TYPES.forEach(
          (
            publicationType
          ) => {

            const filtered =
              publications.filter(
                (
                  publication
                ) =>
                  publication
                    .publication_type ===
                  publicationType
              );

            buildWorksheet(
              workbook,
              filtered,
              publicationType,
              true
            );
          }
        );

      }

      // ------------------------------------------------------
      // SINGLE PUBLICATION TYPE
      // ------------------------------------------------------

      else {

        buildWorksheet(
          workbook,
          publications,
          type,
          true
        );

      }

      // ------------------------------------------------------
      // FILE NAME
      // ------------------------------------------------------

      let fileName;

      if (
        type === "all"
      ) {

        fileName =
          `publications-${from || "all"}-to-${to || "all"}.xlsx`;

      } else {

        fileName =
          `${type}-publications-${from || "all"}-to-${to || "all"}.xlsx`;

      }

      // ------------------------------------------------------
      // RESPONSE HEADERS
      // ------------------------------------------------------

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      // ------------------------------------------------------
      // WRITE DIRECTLY TO RESPONSE
      // ------------------------------------------------------

      await workbook.xlsx.write(
        res
      );

      res.end();

    } catch (error) {

      console.error(
        "EXPORT PUBLICATIONS EXCEL ERROR:",
        error
      );

      if (
        !res.headersSent
      ) {
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