const express = require("express");
const router = express.Router();
const db = require("../db"); // MySQL pool
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");

// ================== File Upload Config ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ================== Add job_worker ==================
router.post(
  "/add-worker",
  auth,
  upload.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCardImage", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  async (req, res) => {
    const branchId = req.user.branch_id;
    const {
      fullName,
      aadharNumber,
      panNumber,
      mobileNumber,
    } = req.body;

    const aadharFront = req.files["aadharFront"]?.[0]?.filename || null;
    const aadharBack = req.files["aadharBack"]?.[0]?.filename || null;
    const panCardImage = req.files["panCardImage"]?.[0]?.filename || null;
    const photo = req.files["photo"]?.[0]?.filename || null;

    try {
      // Check for duplicates
      const [existingStaff] = await db.query(
        "SELECT aadhar_number, pan_number, mobile_number FROM job_worker WHERE aadhar_number = ? OR pan_number = ? OR mobile_number = ?",
        [aadharNumber, panNumber, mobileNumber]
      );

      if (existingStaff.length > 0) {
        if (existingStaff[0].aadhar_number === aadharNumber) {
          return res.status(409).json({ success: false, error: "Job Woker with this Aadhar number already exists." });
        }
        if (existingStaff[0].pan_number === panNumber) {
          return res.status(409).json({ success: false, error: "Job Woker with this PAN number already exists." });
        }
        if (existingStaff[0].mobile_number === mobileNumber) {
          return res.status(409).json({ success: false, error: "Job Woker with this Mobile number already exists." });
        }
      }

      // Insert staff
      const sql = `
        INSERT INTO job_worker 
        (branch_id, full_name, aadhar_number, pan_number, mobile_number, aadhar_front, aadhar_back, pan_card_image, photo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        branchId,
        fullName,
        aadharNumber,
        panNumber,
        mobileNumber,
        aadharFront,
        aadharBack,
        panCardImage,
        photo,
      ]);

      res.json({
        success: true,
        message: "Job worker added successfully",
        id: result.insertId,
      });
    } catch (err) {
      console.error("Error inserting staff:", err);
      res.status(500).json({ success: false, error: "Database error" });
    }
  }
);

// ================== Get All job_worker ==================
router.get("/all", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  try {
    const [results] = await db.query(
      "SELECT * FROM job_worker WHERE branch_id = ? ORDER BY id DESC",
      [branchId]
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching Job Worker:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// ================== Get job_worker by ID ==================
router.get("/:id", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { id } = req.params;

  try {
    const [workerResults] = await db.query(
      "SELECT * FROM job_worker WHERE id = ? AND branch_id = ?",
      [id, branchId]
    );

    if (workerResults.length > 0) {
      res.json(workerResults[0]);
    } else {
      res.status(404).json({ success: false, error: "Job worker not found" });
    }
  } catch (err) {
    console.error("Error fetching job worker by ID:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// ================== Delete Job Worker ==================
router.delete("/:id", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { id } = req.params;

  try {
    const [worker] = await db.query(
      "SELECT * FROM job_worker WHERE id = ? AND branch_id = ?",
      [id, branchId]
    );

    if (worker.length === 0) {
      return res.status(404).json({ success: false, error: "Job worker not found" });
    }

    await db.query("DELETE FROM job_worker WHERE id = ? AND branch_id = ?", [
      id,
      branchId,
    ]);

    res.json({ success: true, message: "Job worker deleted successfully" });
  } catch (err) {
    console.error("Error deleting job worker:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// ================== Add Job Worker Product Entry ==================
router.post("/add-product-entry", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { productName, productPrice } = req.body;

  try {
    if (!productName) {
      return res.status(400).json({ success: false, error: "Product name is required" });
    }

    const [result] = await db.query(
      "INSERT INTO job_worker_product_entry (branch_id, product_name, product_price) VALUES (?, ?, ?)",
      [branchId, productName, productPrice || 0.0]
    );

    res.json({
      success: true,
      message: "Product entry added successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Error adding product entry:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// ================== Get All Product Entries ==================
router.get("/product-entries", auth, async (req, res) => {
  const branchId = req.user.branch_id;

  try {
    const [results] = await db.query(
      "SELECT * FROM job_worker_product_entry WHERE branch_id = ? ORDER BY id DESC",
      [branchId]
    );

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Error fetching product entries:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// ================== Get Product Entry by ID ==================
router.get("/product-entry/:id", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { id } = req.params;

  try {
    const [results] = await db.query(
      "SELECT * FROM job_worker_product_entry WHERE id = ? AND branch_id = ?",
      [id, branchId]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "Product entry not found" });
    }

    res.json({ success: true, data: results[0] });
  } catch (err) {
    console.error("Error fetching product entry:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// ================== Update Product Entry ==================
router.put("/product-entry/:id", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { id } = req.params;
  const { productName, productPrice } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT * FROM job_worker_product_entry WHERE id = ? AND branch_id = ?",
      [id, branchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: "Product entry not found" });
    }

    await db.query(
      "UPDATE job_worker_product_entry SET product_name = ?, product_price = ? WHERE id = ? AND branch_id = ?",
      [productName, productPrice, id, branchId]
    );

    res.json({ success: true, message: "Product entry updated successfully" });
  } catch (err) {
    console.error("Error updating product entry:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// ================== Delete Product Entry ==================
router.delete("/product-entry/:id", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { id } = req.params;

  try {
    const [existing] = await db.query(
      "SELECT * FROM job_worker_product_entry WHERE id = ? AND branch_id = ?",
      [id, branchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: "Product entry not found" });
    }

    await db.query(
      "DELETE FROM job_worker_product_entry WHERE id = ? AND branch_id = ?",
      [id, branchId]
    );

    res.json({ success: true, message: "Product entry deleted successfully" });
  } catch (err) {
    console.error("Error deleting product entry:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});


// ================== Add Job Worker Entry ==================
router.post("/add-jobworker-entry", auth, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { worker_name, aadhar_number, pan_number, mobile_number, size_wise_entry, total_pcs, branchId, product_name, 
        gross_amount, payment_type,} = req.body;

    // ======== Validation ========
    if ( !worker_name || !total_pcs || !branchId || !product_name || gross_amount == null) 
    {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "All required fields are missing or invalid." });
    }

    // Validate numeric fields
    const totalPcsNum = parseInt(total_pcs);
    const grossAmountNum = parseFloat(gross_amount);

    if (isNaN(totalPcsNum) || totalPcsNum <= 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "Total pieces must be a positive number." });
    }

    if (isNaN(grossAmountNum) || grossAmountNum < 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "Gross amount must be a non-negative number." });
    }

    // ======== Insert job worker entry ========
    await connection.query(
      `INSERT INTO job_worker_entries 
      (worker_name, aadhar_number, pan_number, mobile_number, size_wise_entry, total_pcs, branch_id, product_name, gross_amount, payment_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        worker_name,
        aadhar_number || null,
        pan_number || null,
        mobile_number || null,
        JSON.stringify(size_wise_entry || {}),
        totalPcsNum,
        branchId,
        product_name,
        grossAmountNum,
        payment_type || "Pending",
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Job worker entry added successfully!",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error inserting job worker entry:", error);
    res.status(500).json({
      success: false,
      error: "Server error while adding job worker entry",
      details: error.message,
    });
  } finally {
    connection.release();
  }
});


module.exports = router;