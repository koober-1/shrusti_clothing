const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");

// ================== Get All Staff for Dropdown ==================
router.get("/staff-list", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  try {
    const [results] = await pool.query(
      "SELECT id, full_name, aadhar_number, pan_number, mobile_number FROM staff WHERE branch_id = ? ORDER BY full_name ASC",
      [branchId]
    );
    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error("Error fetching staff list:", err);
    res.status(500).json({ 
      success: false, 
      error: "Database error while fetching staff list" 
    });
  }
});

// ================== Get Staff Details by ID ==================
router.get("/staff/:staffId", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { staffId } = req.params;
  
  if (!staffId || isNaN(staffId)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid staff ID provided" 
    });
  }

  try {
    const [results] = await pool.query(
      "SELECT full_name, aadhar_number, pan_number, mobile_number FROM staff WHERE id = ? AND branch_id = ?",
      [staffId, branchId]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Staff not found" 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  } catch (err) {
    console.error("Error fetching staff details:", err);
    res.status(500).json({ 
      success: false, 
      error: "Database error while fetching staff details" 
    });
  }
});

// ================== Add/Update Advance Payment ==================
router.post("/add", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const {
    staffId,
    staffName,
    aadharNumber,
    panNumber,
    mobileNumber,
    amount,
    paymentMethod,
    paymentDate
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    
    // Enhanced validation
    if (!staffId || !staffName?.trim() || !amount || !paymentMethod?.trim() || !paymentDate) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        error: "All required fields must be filled" 
      });
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        error: "Amount must be greater than 0" 
      });
    }

    // Verify staff exists
    const [staffCheck] = await connection.query(
      "SELECT id FROM staff WHERE id = ? AND branch_id = ?",
      [staffId, branchId]
    );

    if (staffCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        error: "Staff member not found" 
      });
    }
    
    const sql = `INSERT INTO advance_payments 
                (branch_id, staff_id, staff_name, aadhar_number, pan_number, mobile_number, amount, payment_method, payment_date, is_paid, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`;

    const [result] = await connection.query(sql, [
      branchId, 
      staffId, 
      staffName.trim(), 
      aadharNumber?.trim() || 'N/A', 
      panNumber?.trim() || 'N/A', 
      mobileNumber?.trim() || 'N/A', 
      amountNum, 
      paymentMethod.trim(), 
      paymentDate,
    ]);
    
    await connection.commit();
    
    res.json({
      success: true,
      message: "Advance payment recorded successfully!",
      id: result.insertId,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error adding advance payment:", err);
    res.status(500).json({ 
      success: false, 
      error: "Database error while adding advance payment" 
    });
  } finally {
    connection.release();
  }
});

// ================== Get All Advance Payments (with staff_id filtering) ==================
router.get("/", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { staff_id } = req.query;
  
  try {
    let sql = "SELECT * FROM advance_payments WHERE branch_id = ?";
    let params = [branchId];
    
    if (staff_id && !isNaN(staff_id)) {
      sql += " AND staff_id = ?";
      params.push(staff_id);
    }
    
    sql += " ORDER BY created_at DESC";
    
    const [results] = await pool.query(sql, params);
    
    res.json({
      success: true,
      advance_payments: results
    });
  } catch (err) {
    console.error("Error fetching advance payments:", err);
    res.status(500).json({ 
      success: false, 
      error: "Database error while fetching advance payments" 
    });
  }
});

// ================== Get Active Advance Payments by Staff ID ==================
router.get("/by-staff/:staffId", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { staffId } = req.params;
  
  if (!staffId || isNaN(staffId)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid staff ID provided" 
    });
  }

  try {
    const [results] = await pool.query(
      `SELECT id, staff_id, amount, is_paid, created_at, updated_at 
       FROM advance_payments 
       WHERE staff_id = ? AND branch_id = ? AND (is_paid = 0 OR is_paid IS NULL)
       ORDER BY created_at ASC`,
      [staffId, branchId]
    );
    
    res.json({
      success: true,
      advance_payments: results
    });
  } catch (err) {
    console.error("Error fetching staff advance payment:", err);
    res.status(500).json({ 
      success: false, 
      error: "Database error while fetching advance payments" 
    });
  }
});

// ================== Get All Pending Payments (Corrected and Aggregated) ==================
router.get("/pending", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  
  try {
    const [results] = await pool.query(
      `SELECT 
        staff_id, staff_name, aadhar_number, pan_number, mobile_number,
        SUM(amount) AS amount,
        MAX(payment_date) AS payment_date,
        COUNT(*) AS total_entries
      FROM advance_payments
      WHERE branch_id = ? AND (is_paid = 0 OR is_paid IS NULL)
      GROUP BY staff_id, staff_name, aadhar_number, pan_number, mobile_number
      HAVING amount > 0
      ORDER BY payment_date DESC`,
      [branchId]
    );
    
    res.json({
      success: true,
      advance_payments: results
    });
  } catch (err) {
    console.error("Error fetching pending payments:", err);
    res.status(500).json({ 
      success: false, 
      error: "Database error while fetching pending payments" 
    });
  }
});

// ================== Get All Paid Payments ==================
router.get("/paid", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  
  try {
    const [results] = await pool.query(
      "SELECT * FROM paid_payments WHERE branch_id = ? ORDER BY created_at DESC",
      [branchId]
    );
    
    res.json({
      success: true,
      paid_payments: results
    });
  } catch (err) {
    console.error("Error fetching paid payments:", err);
    res.status(500).json({ 
      success: false, 
      error: "Database error while fetching paid payments" 
    });
  }
});

// ================== Get Staff Pending Balance ==================
router.get("/pending-balance", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { staff_id } = req.query;
  
  if (!staff_id || isNaN(staff_id)) {
    return res.status(400).json({ 
      success: false, 
      error: "Valid staff_id is required" 
    });
  }
  
  try {
    const [results] = await pool.query(
      "SELECT SUM(amount) AS total_pending_amount FROM advance_payments WHERE staff_id = ? AND branch_id = ? AND (is_paid = 0 OR is_paid IS NULL)",
      [staff_id, branchId]
    );
    
    const pendingBalance = results[0].total_pending_amount || 0;
    
    res.json({ 
      success: true, 
      pendingBalance,
      staff_id: parseInt(staff_id)
    });
  } catch (err) {
    console.error("Error fetching pending balance:", err);
    res.status(500).json({ 
      success: false, 
      error: "Database error while fetching pending balance" 
    });
  }
});

// ================== Get Advance Balance for Wages Integration ==================
router.get("/advance-balance/:staffId", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { staffId } = req.params;
  
  if (!staffId || isNaN(staffId)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid staff ID provided" 
    });
  }

  try {
    const [advancePayments] = await pool.query(
      `SELECT id, staff_id, amount, COALESCE(paid_amount, 0) as paid_amount, 
              (amount - COALESCE(paid_amount, 0)) as remaining_balance, 
              is_paid, created_at, updated_at
       FROM advance_payments 
       WHERE staff_id = ? AND branch_id = ?
       ORDER BY created_at DESC`,
      [staffId, branchId]
    );
    
    const totalRemainingBalance = advancePayments
      .filter(ap => !ap.is_paid)
      .reduce((sum, ap) => sum + parseFloat(ap.remaining_balance || ap.amount), 0);
    
    res.json({
      success: true,
      staff_id: parseInt(staffId),
      advance_payments: advancePayments,
      total_remaining_balance: totalRemainingBalance
    });
  } catch (err) {
    console.error("Error fetching advance balance:", err);
    res.status(500).json({ 
      success: false, 
      error: "Database error while fetching advance balance" 
    });
  }
});

// ================== Get Advance Payment by ID ==================
router.get("/:paymentId", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { paymentId } = req.params;
  
  if (!paymentId || isNaN(paymentId)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid payment ID provided" 
    });
  }

  try {
    const [results] = await pool.query(
      "SELECT * FROM advance_payments WHERE id = ? AND branch_id = ?",
      [paymentId, branchId]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Payment record not found" 
      });
    }
    
    res.json({
      success: true,
      advance_payment: results[0]
    });
  } catch (err) {
    console.error("Error fetching payment details:", err);
    res.status(500).json({ 
      success: false, 
      error: "Database error while fetching payment details" 
    });
  }
});

// ================== Handle Payment Submission ==================
router.post("/pay-amount", auth, async (req, res) => {
  const branchId = req.user.branch_id;
  const { paymentId, amountPaid } = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    if (!paymentId || !amountPaid) {
      await connection.rollback();
      return res.status(400).json({
        success: false, 
        error: "Payment ID and amount are required"
      });
    }
    
    const amountNum = parseFloat(amountPaid);
    if (isNaN(amountNum) || amountNum <= 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false, 
        error: "Amount must be greater than 0"
      });
    }
    
    const [pendingPayment] = await connection.query(
      "SELECT * FROM advance_payments WHERE id = ? AND branch_id = ?",
      [paymentId, branchId]
    );
    
    if (pendingPayment.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        error: "Pending payment not found." 
      });
    }
    
    const originalAmount = parseFloat(pendingPayment[0].amount);
    if (amountNum > originalAmount) {
      await connection.rollback();
      return res.status(400).json({
        success: false, 
        error: "Amount paid cannot exceed pending amount"
      });
    }
    
    const remainingAmount = originalAmount - amountNum;
    
    const paidSql = `INSERT INTO paid_payments 
      (branch_id, staff_id, staff_name, aadhar_number, pan_number, mobile_number, amount_paid, payment_method, payment_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
      
    await connection.query(paidSql, [
      branchId,
      pendingPayment[0].staff_id,
      pendingPayment[0].staff_name,
      pendingPayment[0].aadhar_number,
      pendingPayment[0].pan_number,
      pendingPayment[0].mobile_number,
      amountNum,
      pendingPayment[0].payment_method,
    ]);
    
    // Update or delete pending record
    if (remainingAmount <= 0) {
      await connection.query("UPDATE advance_payments SET is_paid = 1, updated_at = NOW() WHERE id = ?", [paymentId]);
    } else {
      await connection.query("UPDATE advance_payments SET amount = ?, updated_at = NOW() WHERE id = ?", [
        remainingAmount, paymentId
      ]);
    }
    
    await connection.commit();
    res.json({ 
      success: true, 
      message: "Payment successfully recorded." 
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error processing payment:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to process payment." 
    });
  } finally {
    connection.release();
  }
});

// ================== FIXED Comprehensive Ledger/Passbook Route ==================
router.get("/ledger/:staffId", auth, async (req, res) => {
  try {
    const { staffId } = req.params;
    const branchId = req.user.branch_id;
    
    if (!staffId || !branchId || isNaN(staffId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid Staff ID and Branch ID are required.' 
      });
    }

    // ONLY BASIC LEDGER DATA - NO WAGE BONUS ENTRIES
    const [advancePayments] = await pool.query(
      `SELECT 
          id, amount, payment_date as transaction_date, payment_method,
          is_paid, paid_at, created_at, updated_at
       FROM advance_payments 
       WHERE staff_id = ? AND branch_id = ?
       ORDER BY created_at DESC`,  // LATEST FIRST (DESC)
      [staffId, branchId]
    );

    // Manual Repayments
    const [manualRepayments] = await pool.query(
      `SELECT 
          id, amount_paid as amount, payment_date as transaction_date,
          payment_method, created_at
       FROM paid_payments 
       WHERE staff_id = ? AND branch_id = ?
       ORDER BY created_at DESC`,  // LATEST FIRST (DESC) 
      [staffId, branchId]
    );

    // ONLY Advance Deductions from Wages (NO BONUS ENTRIES)
    const [wageDeductions] = await pool.query(
      `SELECT 
          receipt_id as id, deducted_advance as amount, paid_date as transaction_date,
          'Wage Processing' as payment_method, created_at
       FROM cutting_receipts 
       WHERE operator_id = ? AND branch_id = ? AND deducted_advance > 0
       ORDER BY created_at DESC`,  // LATEST FIRST (DESC)
      [staffId, branchId]
    );

    // Construct Ledger Entries
    const ledgerEntries = [];

    // Advance Payments (DEPOSITS/CREDITS)
    advancePayments.forEach((advance) => {
      ledgerEntries.push({
        id: `advance_${advance.id}`,
        date: advance.transaction_date || advance.created_at,
        type: 'Advance Payment',
        description: `Advance Payment #${advance.id} via ${advance.payment_method}${advance.is_paid ? ' (Settled)' : ' (Active)'}`,
        credit_amount: parseFloat(advance.amount || 0),
        debit_amount: 0,
        balance_effect: parseFloat(advance.amount || 0),
        transaction_type: 'CREDIT',
        entry_category: 'DEPOSIT',
        status: advance.is_paid ? 'Settled' : 'Active',
        payment_method: advance.payment_method,
        sort_date: new Date(advance.created_at)
      });
    });

    // Manual Repayments (WITHDRAWALS/DEBITS)
    manualRepayments.forEach((repayment) => {
      ledgerEntries.push({
        id: `manual_repay_${repayment.id}`,
        date: repayment.transaction_date || repayment.created_at,
        type: 'Direct Payment',
        description: `Manual Repayment #${repayment.id} via ${repayment.payment_method}`,
        credit_amount: 0,
        debit_amount: parseFloat(repayment.amount || 0),
        balance_effect: -parseFloat(repayment.amount || 0),
        transaction_type: 'DEBIT',
        entry_category: 'WITHDRAWAL',
        status: 'Completed',
        payment_method: repayment.payment_method,
        sort_date: new Date(repayment.created_at)
      });
    });

    // ONLY Wage Deductions (NO BONUS)
    wageDeductions.forEach((transaction) => {
      const deductedAmount = parseFloat(transaction.amount || 0);
      
      ledgerEntries.push({
        id: `wage_deduction_${transaction.id}`,
        date: transaction.transaction_date || transaction.created_at,
        type: 'Wage Adjustment',
        description: `Advance Deducted from Wages - Receipt #${transaction.id}`,
        credit_amount: 0,
        debit_amount: deductedAmount,
        balance_effect: -deductedAmount,
        transaction_type: 'DEBIT',
        entry_category: 'WAGE_DEDUCTION',
        status: 'Completed',
        payment_method: 'Wage Processing',
        sort_date: new Date(transaction.created_at)
      });
    });

    // Sort by date - LATEST FIRST (DESC)
    ledgerEntries.sort((a, b) => b.sort_date - a.sort_date);

    // Running balance calculation
    let runningBalance = 0;
    
    // Calculate final balance first
    ledgerEntries.forEach(entry => {
      runningBalance += entry.balance_effect;
    });
    
    // Now assign running balances in reverse (since we're showing latest first)
    let currentBalance = runningBalance;
    ledgerEntries.forEach((entry, index) => {
      entry.running_balance = parseFloat(currentBalance.toFixed(2));
      entry.serial_number = index + 1;
      currentBalance -= entry.balance_effect; // Subtract for previous entries
    });

    res.json({
      success: true,
      ledger: ledgerEntries,
      currentBalance: runningBalance
    });
    
  } catch (error) {
    console.error("Error fetching comprehensive ledger:", error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching ledger.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;