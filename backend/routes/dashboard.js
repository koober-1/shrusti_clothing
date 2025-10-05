const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");

// ===============================
// 📊 Dashboard Summary Route
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    const branchId = req.user?.branch_id;
    if (!branchId)
      return res.status(400).json({ success: false, error: "Branch ID missing" });

    const [advancePayments] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM advance_payments 
       WHERE branch_id = ? AND (is_paid = 0 OR is_paid IS NULL)`,
      [branchId]
    );

    const [staff] = await pool.query(
      "SELECT COUNT(*) AS total FROM staff WHERE branch_id = ?",
      [branchId]
    );

    const [products] = await pool.query(
      "SELECT COUNT(*) AS total FROM products WHERE branch_id = ?",
      [branchId]
    );

    const [cuttingEntries] = await pool.query(
      "SELECT COUNT(*) AS total FROM cutting_entries WHERE branch_id = ?",
      [branchId]
    );

    const [wagesEntries] = await pool.query(
      "SELECT COUNT(*) AS total FROM wages WHERE branch_id = ?",
      [branchId]
    );

    const [jobSlips] = await pool.query(
      "SELECT COUNT(*) AS total FROM cutting_receipts WHERE branch_id = ?",
      [branchId]
    );

    res.json({
      success: true,
      data: {
        totalAdvancePayment: parseFloat(advancePayments[0]?.total || 0),
        totalStaffWages: parseInt(wagesEntries[0]?.total || 0),
        totalCuttingWages: parseInt(cuttingEntries[0]?.total || 0),
        totalStaff: parseInt(staff[0]?.total || 0),
        totalProduct: parseInt(products[0]?.total || 0),
        totalJobWorkerSlip: parseInt(jobSlips[0]?.total || 0),
      },
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ===============================
// 📈 Graph Route (Last 10 Days)
// ===============================
router.get("/graph", auth, async (req, res) => {
  try {
    const branchId = req.user?.branch_id;
    if (!branchId)
      return res.status(400).json({ success: false, error: "Branch ID missing" });

    const { startDate, endDate } = req.query;
    let query = "";
    let params = [branchId];

    if (startDate && endDate) {
      query = "AND DATE(created_at) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else {
      query = "AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 10 DAY)";
    }

    const [cutting] = await pool.query(
      `SELECT DATE(created_at) AS date, COALESCE(SUM(total_pcs), 0) AS total_pieces
       FROM cutting_entries
       WHERE branch_id = ? ${query}
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      params
    );

    const [wages] = await pool.query(
      `SELECT DATE(created_at) AS date, COALESCE(SUM(total_pieces), 0) AS total_pieces
       FROM wages
       WHERE branch_id = ? ${query}
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      params
    );

    res.json({ success: true, cutting, wages });
  } catch (error) {
    console.error("Graph API Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch graph data" });
  }
});

// ===============================
// 🧵 Fabric Stock Pie Chart Route
// ===============================
router.get("/fabric-stock", auth, async (req, res) => {
  try {
    const branchId = req.user?.branch_id;
    if (!branchId)
      return res.status(400).json({ success: false, error: "Branch ID missing" });

    const [totalStock] = await pool.query(
      `SELECT COALESCE(SUM(weight_of_material), 0) AS total 
       FROM receipts WHERE branch_id = ?`,
      [branchId]
    );

    const [usedStock] = await pool.query(
      `SELECT COALESCE(SUM(weight_of_fabric), 0) AS total 
       FROM cutting_entries WHERE branch_id = ?`,
      [branchId]
    );

    const totalFabric = parseFloat(totalStock[0]?.total || 0);
    const usedFabric = parseFloat(usedStock[0]?.total || 0);
    const remainingFabric = totalFabric - usedFabric;

    const usedPercent =
      totalFabric > 0 ? ((usedFabric / totalFabric) * 100).toFixed(1) : 0;
    const remainingPercent =
      totalFabric > 0 ? ((remainingFabric / totalFabric) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalFabric: totalFabric.toFixed(2),
        usedFabric: usedFabric.toFixed(2),
        remainingFabric: remainingFabric.toFixed(2),
        usedPercent,
        remainingPercent,
      },
    });
  } catch (error) {
    console.error("Fabric Stock Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch fabric stock" });
  }
});

module.exports = router;
