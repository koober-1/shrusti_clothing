const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");

// ================== Add New Wages Entry ==================
router.post("/add", auth, async (req, res) => {
    const { payments } = req.body;

    if (!payments || !Array.isArray(payments) || payments.length === 0) {
        return res.status(400).json({ success: false, error: "Payments array is missing or empty." });
    }

    try {
        const payment = payments[0];
        const productRatesSql = "SELECT operations FROM products WHERE product_name = ?";
        const [productRows] = await db.query(productRatesSql, [payment.product_name]);

        if (productRows.length === 0) {
            return res.status(404).json({ success: false, error: "Product not found." });
        }

        const productOperations = JSON.parse(productRows[0].operations);
        const singerRate = productOperations.find(op => op.name.toLowerCase() === "singer")?.rate || 0;
        const flatlockRate = productOperations.find(op => op.name.toLowerCase() === "flatlock")?.rate || 0;
        const overlockRate = productOperations.find(op => op.name.toLowerCase() === "overlock")?.rate || 0;

        const totalPieces = parseInt(payment.total_pieces, 10) || 0;
        const singerGrossAmount = totalPieces * parseFloat(singerRate);
        const flatlockGrossAmount = totalPieces * parseFloat(flatlockRate);
        const overlockGrossAmount = totalPieces * parseFloat(overlockRate);

        const singerDeductAdvance = parseFloat(payment.singerDeductAdvance) || 0;
        const flatlockDeductAdvance = parseFloat(payment.flatlockDeductAdvance) || 0;
        const overlockDeductAdvance = parseFloat(payment.overlockDeductAdvance) || 0;

        const singerPayableAmount = singerGrossAmount - singerDeductAdvance;
        const flatlockPayableAmount = flatlockGrossAmount - flatlockDeductAdvance;
        const overlockPayableAmount = overlockGrossAmount - overlockDeductAdvance;

        const insertSql = `
            INSERT INTO wages (
                branch_id, product_name, operation_name, staff_name,
                overlock_operator, flatlock_operator, size_wise_entry,
                extra_pieces, total_pieces, gross_amount, deduct_advance_pay,
                payable_amount, overlock_gross_amount, overlock_deduct_advance,
                overlock_payable_amount, flatlock_gross_amount, flatlock_deduct_advance,
                flatlock_payable_amount, payment_type,
                singer_paid, flatlock_paid, overlock_paid, is_paid
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const sizeWiseEntryJson = payment.size_wise_entry ? JSON.stringify(payment.size_wise_entry) : JSON.stringify({});

        const values = [
            payment.branchId, payment.product_name || null, payment.operation_name || null, payment.staff_name || null,
            payment.overlock_operator || null, payment.flatlock_operator || null, sizeWiseEntryJson,
            parseInt(payment.extra_pieces, 10) || 0, totalPieces, singerGrossAmount, singerDeductAdvance,
            singerPayableAmount, overlockGrossAmount, overlockDeductAdvance, overlockPayableAmount,
            flatlockGrossAmount, flatlockDeductAdvance, flatlockPayableAmount, payment.payment_type || null,
            false, false, false, false
        ];

        await db.query(insertSql, values);
        res.json({ success: true, message: "Wages added successfully" });

    } catch (err) {
        console.error("Error adding wages:", err);
        res.status(500).json({ success: false, error: `Database error: ${err.message}` });
    }
});

// ================== Get Wages by Operation ==================
router.get("/by-operation", auth, async (req, res) => {
    const { branch_id, operation, date } = req.query;
    if (!branch_id || !operation) return res.status(400).json({ success: false, error: "Branch ID and operation are required." });

    try {
        let sql = `
            SELECT *,
                CASE 
                    WHEN ? = 'singer' THEN singer_paid
                    WHEN ? = 'flatlock' THEN flatlock_paid
                    WHEN ? = 'overlock' THEN overlock_paid
                    ELSE FALSE
                END as current_operation_paid
            FROM wages
            WHERE branch_id = ? AND operation_name = ?
        `;
        let params = [operation, operation, operation, branch_id, operation];

        if (date) {
            sql += " AND DATE(created_at) = ?";
            params.push(date);
        }

        sql += " ORDER BY created_at DESC";

        const [rows] = await db.query(sql, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("Error fetching wages by operation:", err);
        res.status(500).json({ success: false, error: "Failed to fetch wages." });
    }
});

// ================== Get Unpaid Jobs by Operation ==================
router.get("/unpaid-jobs", auth, async (req, res) => {
    const { branch_id, operation, operator_name } = req.query;

    if (!branch_id || !operation || !operator_name) {
        return res.status(400).json({ success: false, error: "Missing required parameters." });
    }

    try {
        let sql = "";
        let params = [branch_id, operator_name];

        switch (operation) {
            case 'singer':
                sql = `SELECT * FROM wages WHERE branch_id = ? AND staff_name = ? AND (singer_paid = FALSE OR singer_paid IS NULL) ORDER BY created_at DESC`;
                break;
            case 'flatlock':
                sql = `SELECT * FROM wages WHERE branch_id = ? AND flatlock_operator = ? AND (flatlock_paid = FALSE OR flatlock_paid IS NULL) ORDER BY created_at DESC`;
                break;
            case 'overlock':
                sql = `SELECT * FROM wages WHERE branch_id = ? AND overlock_operator = ? AND (overlock_paid = FALSE OR overlock_paid IS NULL) ORDER BY created_at DESC`;
                break;
            default:
                return res.status(400).json({ success: false, error: "Invalid operation type." });
        }

        const [rows] = await db.query(sql, params);
        res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Error fetching unpaid jobs:", err);
        res.status(500).json({ success: false, error: "Failed to fetch unpaid jobs." });
    }
});

// ================== 🔥 FIXED: Handle Advance Payment Update (Same as Cutting) ==================
// async function handleAdvancePayment(connection, staffId, staffName, amountToAdjust, branchId, operationType) {
//     if (!amountToAdjust || amountToAdjust === 0) {
//         return { success: true, message: "No advance adjustment", adjustment_type: 'none' };
//     }

//     try {
//         console.log(`🔥 ${operationType.toUpperCase()} - Advance Adjustment:`, {
//             staffId, staffName, amountToAdjust, type: amountToAdjust > 0 ? 'DEDUCTION' : 'BONUS'
//         });

//         if (amountToAdjust > 0) {
//             // ✅ POSITIVE: DEDUCT FROM EXISTING ADVANCE
//             const [pendingAdvances] = await connection.query(
//                 `SELECT id, CAST(amount AS DECIMAL(10,2)) as amount FROM advance_payments 
//                  WHERE staff_id = ? AND branch_id = ? AND (is_paid = 0 OR is_paid IS NULL) 
//                  ORDER BY created_at ASC`,
//                 [staffId, branchId]
//             );

// console.log('🟡 Pending advances found:', pendingAdvances.length, pendingAdvances);
//             let remainingDeduction = amountToAdjust;

//             for (const advance of pendingAdvances) {
//                 if (remainingDeduction <= 0) break;

//                 const advanceAmount = parseFloat(advance.amount);
//                 const deductAmount = Math.min(remainingDeduction, advanceAmount);

//                 if (deductAmount >= advanceAmount) {
//                     await connection.query(
//                         `UPDATE advance_payments SET is_paid = 1, paid_at = NOW(), updated_at = NOW() WHERE id = ?`,
//                         [advance.id]
//                     );
//                 } else {
//                     await connection.query(
//                         `UPDATE advance_payments SET amount = amount - ?, updated_at = NOW() WHERE id = ?`,
//                         [deductAmount, advance.id]
//                     );
//                 }
//                 remainingDeduction -= deductAmount;
//             }

//             return {
//                 success: true,
//                 message: `Advance deducted: ₹${amountToAdjust.toFixed(2)}`,
//                 amount_deducted: amountToAdjust,
//                 adjustment_type: 'deduction'
//             };

//         } else if (amountToAdjust < 0) {
//             // ✅ NEGATIVE: ADD BONUS / EXTRA PAYMENT
//             const bonusAmount = Math.abs(amountToAdjust);
//             await connection.query(
//                 `INSERT INTO advance_payments 
//                  (branch_id, staff_id, staff_name, aadhar_number, pan_number, mobile_number, 
//                   amount, payment_method, payment_date, is_paid, created_at) 
//                  VALUES (?, ?, ?, 'N/A', 'N/A', 'N/A', ?, 'Wage Bonus', NOW(), 0, NOW())`,
//                 [branchId, staffId, staffName, bonusAmount]
//             );

//             return {
//                 success: true,
//                 message: `Bonus added: ₹${bonusAmount.toFixed(2)}`,
//                 bonus_added: bonusAmount,
//                 adjustment_type: 'bonus'
//             };
//         }
//     } catch (error) {
//         console.error("❌ Advance adjustment error:", error);
//         throw error;
//     }
// }

// ================== 🔥 HANDLE ADVANCE PAYMENT ==================
async function handleAdvancePayment(connection, staffId, staffName, amountToAdjust, branchId, operationType, relatedEntryIds = []) {
    if (!amountToAdjust || amountToAdjust === 0) {
        return { success: true, message: "No advance adjustment", adjustment_type: 'none' };
    }

    try {
        const type = amountToAdjust > 0 ? 'DEDUCTION' : 'BONUS';
        console.log(`🔥 ${operationType.toUpperCase()} - Advance Adjustment:`, { staffId, staffName, amountToAdjust, type });

        if (amountToAdjust > 0) {
            // ✅ DEDUCT FROM EXISTING ADVANCES
            const [pendingAdvances] = await connection.query(
                `SELECT id, CAST(amount AS DECIMAL(10,2)) as amount
                 FROM advance_payments
                 WHERE staff_id = ? AND branch_id = ? AND (is_paid = 0 OR is_paid IS NULL)
                 ORDER BY created_at ASC`,
                [staffId, branchId]
            );

            console.log('🟡 Pending advances found:', pendingAdvances.length, pendingAdvances);

            if (!pendingAdvances.length) {
                return { success: false, message: "No pending advances to deduct", adjustment_type: 'none' };
            }

            let remainingDeduction = parseFloat(amountToAdjust.toFixed(2));
            let totalDeducted = 0;

            for (const advance of pendingAdvances) {
                if (remainingDeduction <= 0) break;

                const advanceAmount = parseFloat(advance.amount);
                const deductAmount = Math.min(remainingDeduction, advanceAmount);

                // 1️⃣ Update original advance
                if (deductAmount >= advanceAmount) {
                    // Fully paid
                    await connection.query(
                        `UPDATE advance_payments 
                         SET is_paid = 1, paid_at = NOW(), updated_at = NOW() 
                         WHERE id = ?`,
                        [advance.id]
                    );
                } else {
                    // Partial deduction
                    await connection.query(
                        `UPDATE advance_payments 
                         SET amount = CAST(amount AS DECIMAL(10,2)) - ?, updated_at = NOW() 
                         WHERE id = ?`,
                        [deductAmount, advance.id]
                    );
                }

                totalDeducted += deductAmount;
                remainingDeduction -= deductAmount;
            }

            // 2️⃣ Insert record into cutting_receipts
            await connection.query(
                `INSERT INTO cutting_receipts
                 (branch_id, operator_name, operator_id, operation, total_pieces, total_weight, gross_amount, deducted_advance, paid_amount, payment_type, paid_date, entry_ids, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())`,
                [
                    branchId,
                    staffName,
                    staffId,
                    operationType,          // 'cutting', 'singer', 'flatlock', etc
                    0,                     // total_pieces (you can pass as parameter if needed)
                    0,                     // total_weight (pass as parameter if needed)
                    0,                     // gross_amount (pass if needed)
                    totalDeducted,
                    0,                     // paid_amount
                    'Cash',
                    JSON.stringify(relatedEntryIds)
                ]
            );

            return {
                success: true,
                message: `Advance deducted: ₹${totalDeducted.toFixed(2)}`,
                amount_deducted: totalDeducted,
                adjustment_type: 'deduction'
            };

        } else if (amountToAdjust < 0) {
            // ✅ ADD BONUS / EXTRA PAYMENT
            const bonusAmount = Math.abs(amountToAdjust);

            await connection.query(
                `INSERT INTO advance_payments 
                 (branch_id, staff_id, staff_name, aadhar_number, pan_number, mobile_number, 
                  amount, payment_method, payment_date, is_paid, created_at, type) 
                 VALUES (?, ?, ?, 'N/A', 'N/A', 'N/A', ?, 'Wage Bonus', NOW(), 0, NOW(), 'advance')`,
                [branchId, staffId, staffName, bonusAmount]
            );

            return {
                success: true,
                message: `Bonus added: ₹${bonusAmount.toFixed(2)}`,
                bonus_added: bonusAmount,
                adjustment_type: 'bonus'
            };
        }

    } catch (error) {
        console.error("❌ Advance adjustment error:", error);
        throw error;
    }
}

// ================== 🔥 SUBMIT SINGER PAYMENT ==================
router.post("/submit-singer-payment", auth, async (req, res) => {
    const branchId = req.user.branch_id;

    const {
        staff_name, staff_id, gross_amount, deduction, payable_amount,
        payment_type, job_ids, jobs_count, total_pieces,
        advance_amount_paid
    } = req.body;

    if (!staff_name || payable_amount === undefined || !Array.isArray(job_ids) || job_ids.length === 0) {
        return res.status(400).json({ success: false, error: "Missing required payment data." });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 🔥 FETCH STAFF_ID if not provided
        let finalStaffId = staff_id;
        if (!finalStaffId) {
            const [staffRows] = await connection.query(
                `SELECT id FROM staff WHERE full_name = ? AND branch_id = ? LIMIT 1`,
                [staff_name, branchId]
            );
            if (staffRows.length > 0) finalStaffId = staffRows[0].id;
            else console.warn(`⚠️ Staff not found: ${staff_name}`);
        }

        const safeGrossAmount = parseFloat(gross_amount) || 0;
        const safeDeduction = parseFloat(deduction) || 0;
        const safePayableAmount = parseFloat(payable_amount) || 0;
        const safeAdvanceAmountPaid = parseFloat(advance_amount_paid) || 0;

        console.log("🔥 SINGER PAYMENT:", { staff_name, safeGrossAmount, safePayableAmount, advance_adjustment: safeAdvanceAmountPaid });

        // Insert payment record
        const insertPaymentSql = `
            INSERT INTO payments (
                staff_name, staff_id, operation, gross_amount,
                deduction, payable_amount, payment_type, branch_id,
                jobs_count, total_pieces, advance_deducted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [paymentResult] = await connection.query(insertPaymentSql, [
            staff_name, finalStaffId || null, 'singer', safeGrossAmount, safeDeduction,
            safePayableAmount, payment_type || 'cash', branchId, parseInt(jobs_count) || job_ids.length,
            parseInt(total_pieces) || 0, safeAdvanceAmountPaid
        ]);
        console.log('paymentResult: ', paymentResult);
        const paymentId = paymentResult.insertId;

        // Update wages table
        if (job_ids.length > 0) {
            const jobUpdateSql = `
                UPDATE wages
                SET singer_paid = TRUE,
                    singer_payment_id = ?,
                    singer_paid_at = NOW()
                WHERE id IN (${job_ids.map(() => '?').join(',')}) AND staff_name = ?
            `;
            await connection.query(jobUpdateSql, [paymentId, ...job_ids, staff_name]);
        }

        // 🔥 Handle Advance Payment
        let advanceResult = { success: true, adjustment_type: 'none' };
        if (safeAdvanceAmountPaid !== 0 && finalStaffId) {
            advanceResult = await handleAdvancePayment(
                connection,
                finalStaffId,
                staff_name,
                safeAdvanceAmountPaid,
                branchId,
                'singer'
            );
        }

        await connection.commit();

        console.log('branchId: ', branchId);
        console.log('advanceResult: ', advanceResult);

        res.status(200).json({
            success: true,
            message: "Singer payment submitted successfully",
            paymentId,
            advanceDeducted: advanceResult.adjustment_type === 'deduction' ? safeAdvanceAmountPaid : 0,
            bonusAdded: advanceResult.adjustment_type === 'bonus' ? Math.abs(safeAdvanceAmountPaid) : 0
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("❌ SINGER PAYMENT ERROR:", err);
        res.status(500).json({
            success: false,
            error: err.message || "Failed to submit singer payment"
        });
    } finally {
        if (connection) connection.release();
    }
});


// ================== 🔥 SECURED: Submit Flatlock Payment ==================
router.post("/submit-flatlock-payment", auth, async (req, res) => {
    // ⚠️ SECURED: Get branch_id from the authenticated user (req.user)
    const branchId = req.user.branch_id;

    // 📦 FULL REQUEST BODY (for debugging)
    console.log("📦 FULL REQUEST BODY:", JSON.stringify(req.body, null, 2));

    // Note: branch_id is removed from the destructured body
    const {
        staff_name, staff_id, gross_amount, deduction, payable_amount,
        payment_type, job_ids, jobs_count, total_pieces,
        advance_amount_paid
    } = req.body;

    // 🔑 EXTRACTED VALUES (for debugging)
    console.log("🔑 EXTRACTED VALUES:", {
        staff_name,
        staff_id,
        branchId: branchId, // Use the secured branchId
        branchIdType: typeof branchId,
        advance_amount_paid
    });

    if (!staff_name || payable_amount === undefined || !Array.isArray(job_ids) || job_ids.length === 0) {
        return res.status(400).json({ success: false, error: "Missing required payment data." });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 🔥 FETCH STAFF_ID if not provided
        let finalStaffId = staff_id;
        if (!finalStaffId) {
            const [staffRows] = await connection.query(
                // Use secured branchId here
                `SELECT id FROM staff WHERE full_name = ? AND branch_id = ? LIMIT 1`,
                [staff_name, branchId]
            );
            if (staffRows.length > 0) {
                finalStaffId = staffRows[0].id;
                console.log(`✅ Staff ID fetched: ${finalStaffId} for ${staff_name}`);
            }
        }

        const safeGrossAmount = parseFloat(gross_amount) || 0;
        const safeDeduction = parseFloat(deduction) || 0;
        const safePayableAmount = parseFloat(payable_amount) || 0;
        const safeAdvanceAmountPaid = parseFloat(advance_amount_paid) || 0;

        const [paymentResult] = await connection.query(`
            INSERT INTO payments (
                staff_name, staff_id, operation, gross_amount,
                deduction, payable_amount, payment_type, branch_id,
                jobs_count, total_pieces, advance_deducted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            staff_name, finalStaffId || null, 'flatlock', safeGrossAmount, safeDeduction,
            // Use secured branchId here
            safePayableAmount, payment_type || 'cash', branchId, parseInt(jobs_count) || job_ids.length,
            parseInt(total_pieces) || 0, safeAdvanceAmountPaid
        ]);
        const paymentId = paymentResult.insertId;

        console.log("✅ FLATLOCK PAYMENT INSERTED:", paymentId, "Staff ID:", finalStaffId);

        if (job_ids && job_ids.length > 0) {
            await connection.query(`
                UPDATE wages
                SET flatlock_paid = TRUE,
                    flatlock_payment_id = ?,
                    flatlock_paid_at = NOW()
                WHERE id IN (${job_ids.map(() => '?').join(',')}) AND flatlock_operator = ?
            `, [paymentId, ...job_ids, staff_name]);
        }

        // 🔥 Handle Advance Payment
        let advanceResult = { success: true, adjustment_type: 'none' };
        if (safeAdvanceAmountPaid !== 0 && finalStaffId) {
            advanceResult = await handleAdvancePayment(
                connection,
                finalStaffId,
                staff_name,
                safeAdvanceAmountPaid,
                branchId,           // or secured branchId for flatlock route
                'flatlock'        // 'singer', 'flatlock', or 'overlock'
            );
        }

        await connection.commit();
        res.status(200).json({
            success: true,
            message: "Flatlock payment submitted successfully",
            paymentId,
            advanceDeducted: advanceResult.adjustment_type === 'deduction' ? safeAdvanceAmountPaid : 0,
            bonusAdded: advanceResult.adjustment_type === 'bonus' ? Math.abs(safeAdvanceAmountPaid) : 0
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("❌ FLATLOCK PAYMENT ERROR:", err);
        res.status(500).json({ success: false, error: err.message || "Failed to submit flatlock payment" });
    } finally {
        if (connection) connection.release();
    }
});


// ================== 🔥 FIXED: Submit Overlock Payment ==================
router.post("/submit-overlock-payment", auth, async (req, res) => {
    const {
        staff_name, staff_id, gross_amount, deduction, payable_amount,
        payment_type, branch_id, job_ids, jobs_count, total_pieces,
        advance_amount_paid
    } = req.body;

    if (!staff_name || payable_amount === undefined || !Array.isArray(job_ids) || job_ids.length === 0) {
        return res.status(400).json({ success: false, error: "Missing required payment data." });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 🔥 FETCH STAFF_ID if not provided
        let finalStaffId = staff_id;
        if (!finalStaffId) {
            const [staffRows] = await connection.query(
                `SELECT id FROM staff WHERE full_name = ? AND branch_id = ? LIMIT 1`,
                [staff_name, branch_id]
            );
            if (staffRows.length > 0) {
                finalStaffId = staffRows[0].id;
                console.log(`✅ Staff ID fetched: ${finalStaffId} for ${staff_name}`);
            }
        }

        const safeGrossAmount = parseFloat(gross_amount) || 0;
        const safeDeduction = parseFloat(deduction) || 0;
        const safePayableAmount = parseFloat(payable_amount) || 0;
        const safeAdvanceAmountPaid = parseFloat(advance_amount_paid) || 0;

        const [paymentResult] = await connection.query(`
            INSERT INTO payments (
                staff_name, staff_id, operation, gross_amount,
                deduction, payable_amount, payment_type, branch_id,
                jobs_count, total_pieces, advance_deducted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            staff_name, finalStaffId || null, 'overlock', safeGrossAmount, safeDeduction,
            safePayableAmount, payment_type || 'cash', branch_id, parseInt(jobs_count) || job_ids.length,
            parseInt(total_pieces) || 0, safeAdvanceAmountPaid
        ]);
        const paymentId = paymentResult.insertId;

        console.log("✅ OVERLOCK PAYMENT INSERTED:", paymentId, "Staff ID:", finalStaffId);

        if (job_ids && job_ids.length > 0) {
            await connection.query(`
                UPDATE wages
                SET overlock_paid = TRUE,
                    overlock_payment_id = ?,
                    overlock_paid_at = NOW()
                WHERE id IN (${job_ids.map(() => '?').join(',')}) AND overlock_operator = ?
            `, [paymentId, ...job_ids, staff_name]);
        }

        // 🔥 Handle Advance Payment
        let advanceResult = { success: true, adjustment_type: 'none' };
        if (safeAdvanceAmountPaid !== 0 && finalStaffId) {
            advanceResult = await handleAdvancePayment(
                connection,
                finalStaffId,
                staff_name,
                safeAdvanceAmountPaid,
                branch_id,           // or secured branchId for flatlock route
                'overlock'        // 'singer', 'flatlock', or 'overlock'
            );
        }


        await connection.commit();
        res.status(200).json({
            success: true,
            message: "Overlock payment submitted successfully",
            paymentId,
            advanceDeducted: advanceResult.adjustment_type === 'deduction' ? safeAdvanceAmountPaid : 0,
            bonusAdded: advanceResult.adjustment_type === 'bonus' ? Math.abs(safeAdvanceAmountPaid) : 0
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("❌ OVERLOCK PAYMENT ERROR:", err);
        res.status(500).json({ success: false, error: err.message || "Failed to submit overlock payment" });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router; 