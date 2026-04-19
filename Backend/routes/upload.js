const express = require("express");
const router = express.Router();
const multer = require("multer");
const supabase = require("../supabase");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Store file in memory (not disk) before uploading to Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
  },
});

// POST /admin/upload — upload image to Supabase Storage
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "-")}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      res.json({ url: data.publicUrl });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Image upload failed" });
    }
  },
);

module.exports = router;
