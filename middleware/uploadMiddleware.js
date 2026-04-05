const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const path = require("path");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname); // keeps .pdf
    const baseName = path.basename(file.originalname, ext);

    return {
      folder: "rms_publications",
      resource_type: "raw",
      public_id: `${Date.now()}-${baseName}${ext}`
    };
  },
});

const upload = multer({ storage });

module.exports = upload;