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
      fullUnitAddress
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
        (branch_id, full_name, aadhar_number, pan_number, mobile_number, aadhar_front, aadhar_back, pan_card_image, full_unit_address, photo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        fullUnitAddress,
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

// ================== Update Job Worker by ID ==================
router.put("/update/:id", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { id } = req.params;
  const {
    full_name,
    full_unit_address,
    mobile_number,
    aadhar_number,
    pan_number
  } = req.body;

  try {
    // Check if worker exists
    const [worker] = await db.query(
      "SELECT * FROM job_worker WHERE id = ? AND branch_id = ?",
      [id, branchId]
    );

    if (worker.length === 0) {
      return res.status(404).json({ success: false, error: "Job worker not found" });
    }

    // Check for duplicates (excluding current worker)
    const [existingStaff] = await db.query(
      `SELECT aadhar_number, pan_number, mobile_number 
       FROM job_worker 
       WHERE (aadhar_number = ? OR pan_number = ? OR mobile_number = ?) AND id != ?`,
      [aadhar_number, pan_number, mobile_number, id]
    );

    if (existingStaff.length > 0) {
      if (existingStaff[0].aadhar_number === aadhar_number) {
        return res.status(409).json({ success: false, error: "Aadhar number already exists." });
      }
      if (existingStaff[0].pan_number === pan_number) {
        return res.status(409).json({ success: false, error: "PAN number already exists." });
      }
      if (existingStaff[0].mobile_number === mobile_number) {
        return res.status(409).json({ success: false, error: "Mobile number already exists." });
      }
    }

    // Update worker
    await db.query(
      `UPDATE job_worker 
       SET full_name = ?, full_unit_address = ?, mobile_number = ?, aadhar_number = ?, pan_number = ?
       WHERE id = ? AND branch_id = ?`,
      [full_name, full_unit_address, mobile_number, aadhar_number, pan_number, id, branchId]
    );

    res.json({ success: true, message: "Job worker updated successfully" });
  } catch (err) {
    console.error("Error updating job worker:", err);
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
  const { productName, productPrice, fabricType } = req.body;

  try {
    if (!productName) {
      return res.status(400).json({ success: false, error: "Product name is required" });
    }

    // ---------------- Check for duplicate (product + fabric) ----------------
    const [existing] = await db.query(
      "SELECT id FROM job_worker_product_entry WHERE branch_id = ? AND product_name = ? AND fabric_type = ?",
      [branchId, productName, fabricType]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: "Duplicate entry for same product and fabric type is not allowed" });
    }

    // ---------------- Insert new entry ----------------
    const [result] = await db.query(
      `INSERT INTO job_worker_product_entry 
       (branch_id, product_name, product_price, fabric_type) 
       VALUES (?, ?, ?, ?)`,
      [branchId, productName, productPrice || 0.0, fabricType || null]
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
router.get("/product-entries/:branch_id", auth, async (req, res) => {
  const branchId = req.params.branch_id;

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



// ================== Get All Product Entries (by branch) ==================
router.get("/product-entry/:id", auth, async (req, res) => {
  try {
    const branchId = req.user.branch_id;

    const [results] = await db.query(
      "SELECT * FROM job_worker_product_entry WHERE branch_id = ? ORDER BY id DESC",
      [branchId]
    );

    if (results.length === 0) {
      return res.json({ success: true, data: [] }); // return empty array instead of error
    }

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Error fetching product entries:", err);
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
  const branchId = req.user.branch_id;
  const {
    worker_name,
    aadhar_number,
    pan_number,
    mobile_number,
    size_wise_entry,
    total_pcs,
    product_name,
    gross_amount,
    payment_type
  } = req.body;

  try {
    // ======== Validation ========
    if (!worker_name || !total_pcs || !product_name || gross_amount == null) {
      return res.status(400).json({
        success: false,
        error: "All required fields are missing or invalid."
      });
    }

    const totalPcsNum = parseInt(total_pcs);
    const grossAmountNum = parseFloat(gross_amount);

    if (isNaN(totalPcsNum) || totalPcsNum <= 0) {
      return res.status(400).json({
        success: false,
        error: "Total pieces must be a positive number."
      });
    }

    if (isNaN(grossAmountNum) || grossAmountNum < 0) {
      return res.status(400).json({
        success: false,
        error: "Gross amount must be a non-negative number."
      });
    }

    // ======== Generate Random job_worker_id ========
    const generateRandomId = () => {
      const randomNum = Math.floor(Math.random() * 10000); // 0-9999
      return `SC-${randomNum.toString().padStart(4, "0")}`;
    };
    const job_worker_id = generateRandomId();

    // ======== Insert into DB ========
    const sql = `
      INSERT INTO job_worker_entries
      (job_worker_id, worker_name, aadhar_number, pan_number, mobile_number, size_wise_entry, total_pcs, branch_id, product_name, gross_amount, payment_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await db.query(sql, [
      job_worker_id,
      worker_name,
      aadhar_number || null,
      pan_number || null,
      mobile_number || null,
      JSON.stringify(size_wise_entry || {}),
      totalPcsNum,
      branchId,
      product_name,
      grossAmountNum,
      payment_type || "Pending"
    ]);

    res.status(201).json({
      success: true,
      message: "Job worker entry added successfully!",
      job_worker_id
    });
  } catch (err) {
    console.error("Error inserting job worker entry:", err);
    res.status(500).json({
      success: false,
      error: "Database error while adding job worker entry",
      details: err.message
    });
  }
});

// ================== Get All Job Worker Entries ==================
router.get("/all/:branch_id?", auth, async (req, res) => {
  // Use branch_id from params if provided, otherwise fallback to token
  const branchId = req.params.branch_id || req.user.branch_id;

  try {
    const [results] = await db.query(
      "SELECT * FROM job_worker_entries WHERE branch_id = ? ORDER BY created_at DESC",
      [branchId]
    );

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Error fetching job worker entries:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// ================== Get Job Worker Entry by ID ==================
router.get("/by/:job_worker_id", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { job_worker_id } = req.params;

  try {
    const [results] = await db.query(
      "SELECT * FROM job_worker_entries WHERE branch_id = ? AND job_worker_id = ?",
      [branchId, job_worker_id]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "Job worker entry not found" });
    }

    res.json({ success: true, data: results[0] });
  } catch (err) {
    console.error("Error fetching job worker entry:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// ================== Update Job Worker Entry by ID ==================
router.put("/update/:job_worker_id/:branch_id", auth, async (req, res) => {
  const { job_worker_id, branch_id: paramBranchId } = req.params;
  const branchId = paramBranchId || req.user.branch_id;
  const { received_pcs } = req.body; // only received pcs

  if (!received_pcs || isNaN(received_pcs) || received_pcs <= 0) {
    return res.status(400).json({ success: false, error: "Invalid received pcs value" });
  }

  try {
    const [entries] = await db.query(
      "SELECT total_pcs, total_recv_pcs, receive_pcs_history FROM job_worker_entries WHERE branch_id = ? AND job_worker_id = ?",
      [branchId, job_worker_id]
    );

    if (entries.length === 0) {
      return res.status(404).json({ success: false, error: "Job worker entry not found" });
    }

    const entry = entries[0];
    const totalRecv = parseInt(entry.total_recv_pcs || 0);
    const totalPcs = parseInt(entry.total_pcs);

    if (totalRecv >= totalPcs) {
      return res.status(400).json({ success: false, error: "All pieces already received. Cannot update further." });
    }

    const newTotalRecv = totalRecv + parseInt(received_pcs);
    if (newTotalRecv > totalPcs) {
      return res.status(400).json({ success: false, error: "Received pcs exceed total pcs." });
    }

    // Update receive_pcs_history
    let history = entry.receive_pcs_history ? JSON.parse(entry.receive_pcs_history) : [];
    history.push({ received_pcs: parseInt(received_pcs), received_at: new Date().toISOString() });

    // Update entry
    await db.query(
      "UPDATE job_worker_entries SET total_recv_pcs = ?, receive_pcs_history = ? WHERE branch_id = ? AND job_worker_id = ?",
      [newTotalRecv, JSON.stringify(history), branchId, job_worker_id]
    );

    res.json({
      success: true,
      message: "Job worker entry updated successfully",
      total_recv_pcs: newTotalRecv
    });

  } catch (err) {
    console.error("Error updating job worker entry:", err);
    res.status(500).json({ success: false, error: "Database error", details: err.message });
  }
});

// ================== Pay Job Worker API ==================
router.post("/payment/:job_worker_id", auth, async (req, res) => {
  const { job_worker_id } = req.params;
  const { tds, totalAmount, paymentMode, branchId } = req.body;

  if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
    return res.status(400).json({ success: false, error: "Invalid payment amount" });
  }

  try {
    // 1️⃣ Fetch the job worker entry
    const [entries] = await db.query(
      "SELECT * FROM job_worker_entries WHERE branch_id = ? AND job_worker_id = ?",
      [branchId, job_worker_id]
    );

    if (entries.length === 0) {
      return res.status(404).json({ success: false, error: "Job worker entry not found" });
    }

    const entry = entries[0];

    // 2️⃣ Update entry's payment_type to Paid
    await db.query(
      "UPDATE job_worker_entries SET payment_type = 'Paid' WHERE job_worker_id = ?",
      [ job_worker_id]
    );

    // 3️⃣ Insert the paid entry into job_worker_payment table
    await db.query(
      `INSERT INTO job_worker_payment 
      (worker_name, job_worker_id, aadhar_number, pan_number, mobile_number, total_pcs, branch_id, product_name, gross_amount, payment_type, total_recv_pcs, tds_value, after_tds_apply) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.worker_name,
        entry.job_worker_id,
        entry.aadhar_number,
        entry.pan_number,
        entry.mobile_number,
        entry.total_pcs,
        branchId,
        entry.product_name,
        entry.gross_amount,
        paymentMode,
        entry.total_recv_pcs,
        tds || 0,
        totalAmount
      ]
    );

    // 4️⃣ Return the paid entry
    res.json({ success: true, message: "Payment recorded successfully", paidEntry: { ...entry, payment_type: "Paid", tds_value: tds || 0, after_tds_apply: totalAmount } });
  } catch (err) {
    console.error("Error recording payment:", err);
    res.status(500).json({ success: false, error: "Database error", details: err.message });
  }
});

// ================== Get All Job Worker Payments ==================
router.get("/payments/all/:branch_id", auth, async (req, res) => {
  const branchId = req.params.branch_id || req.user.branch_id;

  try {
    const [payments] = await db.query(
      "SELECT * FROM job_worker_payment WHERE branch_id = ? ORDER BY created_at DESC",
      [branchId]
    );

    res.json({ success: true, data: payments });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ success: false, error: "Database error", details: err.message });
  }
});


// ================== Get Job Worker Payment By ID ==================
router.get("/payments/:job_worker_id/:branch_id", auth, async (req, res) => {
  const { job_worker_id } = req.params;
  const branchId = req.params.branch_id || req.user.branch_id;

  try {
    const [payments] = await db.query(
      "SELECT * FROM job_worker_payment WHERE branch_id = ? AND job_worker_id = ?",
      [branchId, job_worker_id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ success: false, error: "Payment record not found" });
    }

    res.json({ success: true, data: payments[0] });
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ success: false, error: "Database error", details: err.message });
  }
});

// ================== Delete Job Worker Entry by ID ==================
router.delete("/delete/:job_worker_id", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { job_worker_id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM job_worker_entries WHERE branch_id = ? AND job_worker_id = ?",
      [branchId, job_worker_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Job worker entry not found" });
    }

    res.json({ success: true, message: "Job worker entry deleted successfully" });
  } catch (err) {
    console.error("Error deleting job worker entry:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

module.exports = router;