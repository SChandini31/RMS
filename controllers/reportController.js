const ExcelJS = require("exceljs");
const Publication = require("../models/publicationModel");

// ============================================================
// PUBLICATION TYPES
// ============================================================

const publicationTypes = [
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

const sheetNames = {
  journal: "Journal Publication",
  book: "Books Published",
  book_chapter: "Books Chapter",
  conference: "Conf. Publications",
  patent: "Patents",
  research_project: "Research Projects",
  consultancy: "Consultancy",
  research_collaboration: "Research Collaboration",
  research_support: "Research Support",
};

// ============================================================
// SHEET TITLES
// ============================================================

const sheetTitles = {
  journal: "Journal Publications",
  book: "Books Published",
  book_chapter: "Books Chapter",
  conference: "Conference Publications",
  patent: "Patents",
  research_project: "Research Projects",
  consultancy: "Consultancy",
  research_collaboration: "Research Collaboration",
  research_support: "Research Support",
};

// ============================================================
// COMMON EXCEL COLUMNS
//
// These fields are common to ALL publication types.
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
    header: "Title",
    key: "title",
  },
  {
    header: "Authors",
    key: "authors",
  },
  {
    header: "Publication Type",
    key: "publication_type",
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
    header: "Uploaded By",
    key: "uploadedBy",
  },
  {
    header: "Faculty Status",
    key: "facultyStatus",
  },
  {
    header: "Directorate Status",
    key: "directorateStatus",
  },
  {
    header: "Final Status",
    key: "finalStatus",
  },
  {
    header: "File",
    key: "file",
  },
  {
    header: "Additional Notes",
    key: "additional_notes",
  },
  {
    header: "Created At",
    key: "createdAt",
  },
];

// ============================================================
// KNOWN TYPE-SPECIFIC COLUMNS
//
// These are ordered first.
// Any additional fields found inside type_details will
// automatically be added after these columns.
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
      header: "Publication Date",
      key: "publication_date",
    },
    {
      header: "Scope",
      key: "scope",
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

  patent: [],

  // ==========================================================
  // RESEARCH PROJECT
  // ==========================================================

  research_project: [],

  // ==========================================================
  // CONSULTANCY
  // ==========================================================

  consultancy: [],

  // ==========================================================
  // RESEARCH COLLABORATION
  // ==========================================================

  research_collaboration: [],

  // ==========================================================
  // RESEARCH SUPPORT
  // ==========================================================

  research_support: [],
};

// ============================================================
// FORMAT HEADER
//
// Example:
// publication_date
//        ↓
// Publication Date
// ============================================================

const formatHeader = (key) => {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// ============================================================
// FORMAT VALUE FOR EXCEL
// ============================================================

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  // IMPORTANT:
  // Date must be checked BEFORE generic object handling.

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  // MongoDB / Mongoose date-like values

  if (
    typeof value === "object" &&
    value !== null &&
    typeof value.toISOString === "function"
  ) {
    try {
      return value.toISOString().split("T")[0];
    } catch (error) {
      // Continue with normal object formatting
    }
  }

  // ==========================================================
  // ARRAY
  // ==========================================================

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (
          typeof item === "object" &&
          item !== null
        ) {
          return Object.entries(item)
            .map(
              ([key, val]) =>
                `${formatHeader(key)}: ${formatValue(val)}`
            )
            .join(", ");
        }

        return String(item);
      })
      .join(" | ");
  }

  // ==========================================================
  // OBJECT
  // ==========================================================

  if (
    typeof value === "object" &&
    value !== null
  ) {
    // Populated Mongoose document
    if (value.name) {
      return value.name;
    }

    // MongoDB ObjectId
    if (
      value._bsontype === "ObjectId" ||
      value._bsontype === "ObjectID"
    ) {
      return value.toString();
    }

    return Object.entries(value)
      .filter(([key]) => key !== "_id")
      .map(
        ([key, val]) =>
          `${formatHeader(key)}: ${formatValue(val)}`
      )
      .join(", ");
  }

  return String(value);
};

// ============================================================
// GET COMMON VALUE
// ============================================================

const getCommonValue = (publication, key) => {
  switch (key) {
    case "faculty":
      return (
        publication.faculty?.name ||
        publication.faculty ||
        ""
      );

    case "authors":
      return publication.authors || [];

    case "keywords":
      return publication.keywords || [];

    case "uploadedBy":
      return (
        publication.uploadedBy?.name ||
        publication.uploadedBy ||
        ""
      );

    case "facultyStatus":
      return (
        publication.facultyStatus ||
        publication.faculty_status ||
        ""
      );

    case "directorateStatus":
      return (
        publication.directorateStatus ||
        publication.directorate_status ||
        ""
      );

    case "finalStatus":
      return (
        publication.finalStatus ||
        publication.final_status ||
        ""
      );

    case "file":
      return (
        publication.upload ||
        publication.file ||
        ""
      );

    default:
      return publication[key] ?? "";
  }
};

// ============================================================
// GET DYNAMIC TYPE COLUMNS
//
// Any field inside type_details that is not already listed
// in typeColumns will automatically become an Excel column.
//
// This is especially important for:
//
// patent
// research_project
// consultancy
// research_collaboration
// research_support
//
// ============================================================

const getDynamicTypeColumns = (
  publications,
  existingKeys
) => {
  const discoveredKeys = new Set();

  publications.forEach((publication) => {
    const details =
      publication.type_details || {};

    Object.keys(details).forEach((key) => {
      if (!existingKeys.has(key)) {
        discoveredKeys.add(key);
      }
    });
  });

  return Array.from(discoveredKeys).map(
    (key) => ({
      header: formatHeader(key),
      key,
    })
  );
};

// ============================================================
// GET COLUMNS FOR PUBLICATION TYPE
// ============================================================

const getPublicationColumns = (
  publicationType,
  publications
) => {
  const predefinedTypeColumns =
    typeColumns[publicationType] || [];

  const existingKeys = new Set([
    ...commonColumns.map(
      (column) => column.key
    ),

    ...predefinedTypeColumns.map(
      (column) => column.key
    ),
  ]);

  const dynamicColumns =
    getDynamicTypeColumns(
      publications,
      existingKeys
    );

  return [
    ...commonColumns,
    ...predefinedTypeColumns,
    ...dynamicColumns,
  ];
};

// ============================================================
// CREATE PUBLICATION WORKSHEET
//
// FORMAT:
//
// Row 1 → merged title
// Row 2 → column headers
// Row 3+ → data
//
// This matches the workbook style shown in your screenshot.
// ============================================================

const createPublicationSheet = (
  workbook,
  publicationType,
  publications
) => {
  const worksheet =
    workbook.addWorksheet(
      sheetNames[publicationType] ||
      publicationType
    );

  const columns =
    getPublicationColumns(
      publicationType,
      publications
    );

  // ==========================================================
  // TITLE ROW
  // ==========================================================

  const lastColumnNumber =
    Math.max(columns.length, 1);

  worksheet.mergeCells(
    1,
    1,
    1,
    lastColumnNumber
  );

  const titleCell =
    worksheet.getCell(1, 1);

  titleCell.value =
    sheetTitles[publicationType] ||
    formatHeader(publicationType);

  titleCell.font = {
    bold: true,
    size: 16,
  };

  titleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "FFFFFF00",
    },
  };

  titleCell.border = {
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

  worksheet.getRow(1).height = 32;

  // ==========================================================
  // COLUMN DEFINITIONS
  // ==========================================================

  worksheet.columns = columns.map(
    (column) => ({
      header: column.header,
      key: column.key,
      width: Math.min(
        Math.max(
          column.header.length + 5,
          20
        ),
        35
      ),
    })
  );

  // ==========================================================
  // HEADER ROW
  //
  // Since row 1 is already used for the title,
  // put headers in row 2.
  // ==========================================================

  const headerRow =
    worksheet.getRow(2);

  columns.forEach(
    (column, index) => {
      const cell =
        headerRow.getCell(index + 1);

      cell.value = column.header;

      cell.font = {
        bold: true,
        size: 12,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "D9E2F3",
        },
      };

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

  headerRow.height = 65;

  // ==========================================================
  // ADD DATA
  // ==========================================================

  publications.forEach(
    (publication) => {
      const row = {};

      // ------------------------------------------------------
      // COMMON FIELDS
      // ------------------------------------------------------

      commonColumns.forEach(
        (column) => {
          row[column.key] =
            formatValue(
              getCommonValue(
                publication,
                column.key
              )
            );
        }
      );

      // ------------------------------------------------------
      // TYPE DETAILS
      // ------------------------------------------------------

      const details =
        publication.type_details || {};

      const typeSpecificColumns =
        columns.filter(
          (column) =>
            !commonColumns.some(
              (commonColumn) =>
                commonColumn.key ===
                column.key
            )
        );

      typeSpecificColumns.forEach(
        (column) => {
          row[column.key] =
            formatValue(
              details[column.key]
            );
        }
      );

      worksheet.addRow(row);
    }
  );

  // ==========================================================
  // DATA ROW STYLE
  // ==========================================================

  worksheet.eachRow(
    (row, rowNumber) => {
      if (rowNumber <= 2) {
        return;
      }

      row.eachCell(
        (cell) => {
          cell.alignment = {
            vertical: "top",
            horizontal: "left",
            wrapText: true,
          };

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
    }
  );

  // ==========================================================
  // FREEZE TITLE + HEADER
  // ==========================================================

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 2,
    },
  ];

  // ==========================================================
  // AUTO FILTER
  // ==========================================================

  if (columns.length > 0) {
    worksheet.autoFilter = {
      from: {
        row: 2,
        column: 1,
      },

      to: {
        row: Math.max(
          publications.length + 2,
          2
        ),
        column: columns.length,
      },
    };
  }

  // ==========================================================
  // PAGE SETUP
  // ==========================================================

  worksheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  worksheet.pageSetup.margins = {
    left: 0.25,
    right: 0.25,
    top: 0.5,
    bottom: 0.5,
    header: 0.2,
    footer: 0.2,
  };

  return worksheet;
};

// ============================================================
// FETCH PUBLICATIONS
// ============================================================

const fetchPublications = async (
  filter = {}
) => {
  return await Publication.find(filter)
    .populate(
      "faculty",
      "name email role"
    )
    .populate(
      "uploadedBy",
      "name email role"
    )
    .populate(
      "facultyApprovedBy",
      "name email"
    )
    .populate(
      "directorateApprovedBy",
      "name email"
    )
    .sort({
      createdAt: -1,
    })
    .lean();
};

// ============================================================
// EXPORT PUBLICATIONS TO EXCEL
//
// GET:
//
// /api/reports/publications/excel?type=journal
//
// /api/reports/publications/excel?type=all
//
// ============================================================

const exportPublicationsToExcel = async (
  req,
  res
) => {
  try {
    const type =
      req.query.type || "all";

    console.log(
      "EXCEL EXPORT TYPE:",
      type
    );

    // ========================================================
    // VALID TYPES
    // ========================================================

    const validTypes = [
      "all",
      ...publicationTypes,
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid publication type",
        validTypes,
      });
    }

    // ========================================================
    // CREATE WORKBOOK
    // ========================================================

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

    workbook.properties = {
      title:
        "Research Publications",
      subject:
        "Research Management System Publication Report",
      company:
        "Research Management System",
    };

    // ========================================================
    // ALL TYPES
    //
    // IMPORTANT:
    //
    // One workbook
    // +
    // exactly 9 worksheets
    //
    // Even if a particular type has zero records,
    // its worksheet is still created.
    // ========================================================

    if (type === "all") {
      const publications =
        await fetchPublications();

      // ------------------------------------------------------
      // GROUP PUBLICATIONS BY TYPE
      // ------------------------------------------------------

      const grouped = {};

      publicationTypes.forEach(
        (publicationType) => {
          grouped[publicationType] = [];
        }
      );

      publications.forEach(
        (publication) => {
          const publicationType =
            publication.publication_type;

          if (
            grouped[
              publicationType
            ]
          ) {
            grouped[
              publicationType
            ].push(publication);
          }
        }
      );

      // ------------------------------------------------------
      // CREATE ALL 9 SHEETS
      // ------------------------------------------------------

      publicationTypes.forEach(
        (publicationType) => {
          createPublicationSheet(
            workbook,
            publicationType,
            grouped[
              publicationType
            ]
          );
        }
      );
    }

    // ========================================================
    // SINGLE TYPE
    //
    // Example:
    //
    // ?type=journal
    //
    // Creates ONE workbook with ONE worksheet.
    // ========================================================

    else {
      const publications =
        await fetchPublications({
          publication_type: type,
        });

      createPublicationSheet(
        workbook,
        type,
        publications
      );
    }

    // ========================================================
    // RESPONSE HEADERS
    // ========================================================

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Research-Publications-${type}.xlsx"`
    );

    // ========================================================
    // SEND WORKBOOK
    // ========================================================

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error(
      "EXCEL EXPORT ERROR:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to export publications",
        error: error.message,
      });
    }

    res.end();
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  exportPublicationsToExcel,
};