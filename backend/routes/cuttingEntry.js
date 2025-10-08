const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");

// -------------------------------------------------------------------------------------

// Check if inward number already used for cutting
router.get("/check-inward/:inwardNumber", auth, async (req, res) => {
    try {
        const { inwardNumber } = req.params;
        const { branchId } = req.query;

        if (!inwardNumber || !branchId) {
            return res.status(400).json({ error: 'Inward number and branch ID are required.' });
        }

        const [rows] = await pool.query(
            'SELECT id FROM cutting_entries WHERE inward_number = ? AND branch_id = ?',
            [inwardNumber, branchId]
        );

        res.json({ alreadyUsed: rows.length > 0 });
    } catch (error) {
        console.error("Error checking inward number:", error);
        res.status(500).json({ error: "Server error while checking inward number" });
    }
});

// -------------------------------------------------------------------------------------

// Add new Cutting Entry
router.post("/add", auth, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            inward_number,
            cutting_master,
            product_name,
            fabric_type,
            weight_of_fabric,
            color,
            size_wise_entry,
            total_pcs,
            gross_amount,
            branchId,
        } = req.body;

        // Validation
        if (
            !inward_number ||
            !cutting_master ||
            !product_name ||
            !fabric_type ||
            !weight_of_fabric ||
            !total_pcs ||
            !branchId ||
            gross_amount == null
        ) {
            await connection.rollback();
            return res.status(400).json({ error: "All required fields are missing or invalid." });
        }

        // Validate numeric fields
        const weightNum = parseFloat(weight_of_fabric);
        const totalPcsNum = parseInt(total_pcs);
        const grossAmountNum = parseFloat(gross_amount);

        if (isNaN(weightNum) || weightNum <= 0) {
            await connection.rollback();
            return res.status(400).json({ error: "Weight of fabric must be a positive number." });
        }

        if (isNaN(totalPcsNum) || totalPcsNum <= 0) {
            await connection.rollback();
            return res.status(400).json({ error: "Total pieces must be a positive number." });
        }

        if (isNaN(grossAmountNum) || grossAmountNum < 0) {
            await connection.rollback();
            return res.status(400).json({ error: "Gross amount must be a non-negative number." });
        }

        // Check if already used
        const [existingCutting] = await connection.query(
            'SELECT id FROM cutting_entries WHERE inward_number = ? AND branch_id = ?',
            [inward_number, branchId]
        );
        if (existingCutting.length > 0) {
            await connection.rollback();
            return res.status(409).json({ error: "This inward number has already been used for cutting operation!" });
        }

        // Insert cutting entry
        await connection.query(
            `INSERT INTO cutting_entries 
            (inward_number, cutting_master, product_name, fabric_type, weight_of_fabric, color,
            size_wise_entry, total_pcs, gross_amount, branch_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [
                inward_number,
                cutting_master,
                product_name,
                fabric_type,
                weightNum,
                color || 'N/A',
                JSON.stringify(size_wise_entry || {}),
                totalPcsNum,
                grossAmountNum,
                branchId,
            ]
        );

        // Update receipt status
        const [updateResult] = await connection.query(
            `UPDATE receipts 
            SET status = 'cutting_completed', updated_at = NOW() 
            WHERE unique_number = ? AND branch_id = ?`,
            [inward_number, branchId]
        );
        
        if (updateResult.affectedRows === 0) {
            console.warn(`Receipt not found for inward number: ${inward_number}`);
        }

        await connection.commit();
        
        res.status(201).json({
            message: "Cutting entry added successfully!",
            success: true
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error inserting cutting entry:", error);
        res.status(500).json({ 
            error: "Server error while adding cutting entry",
            details: error.message 
        });
    } finally {
        connection.release();
    }
});

// -------------------------------------------------------------------------------------

// Get unpaid wages by operation 
router.get("/unpaid-wages/:operation", auth, async (req, res) => {
    try {
        const { operation } = req.params;
        const { branchId } = req.query;

        if (!branchId) {
            return res.status(400).json({ error: 'Branch ID is required.' });
        }

        let query = '';
        let params = [branchId, branchId];

        if (operation.toLowerCase() === 'cutting') {
            query = `
                SELECT 
                    ce.cutting_master as operator_name,
                    SUM(ce.total_pcs) as total_pieces,
                    SUM(ce.weight_of_fabric) as total_weight,
                    SUM(ce.gross_amount) as gross_amount,
                    COALESCE(ap.pending_advance, 0) as pending_advance
                FROM cutting_entries ce
                LEFT JOIN (
                    SELECT s.full_name, SUM(adv.amount) as pending_advance
                    FROM advance_payments adv
                    JOIN staff s ON adv.staff_id = s.id
                    WHERE adv.branch_id = ? AND (adv.is_paid = 0 OR adv.is_paid IS NULL)
                    GROUP BY s.full_name
                ) ap ON ap.full_name = ce.cutting_master
                WHERE ce.branch_id = ? AND (ce.is_paid = 0 OR ce.is_paid IS NULL)
                GROUP BY ce.cutting_master
                ORDER BY ce.cutting_master
            `;
        } else {
            return res.status(400).json({ error: 'Invalid operation type.' });
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching unpaid wages:", error);
        res.status(500).json({ error: "Server error while fetching unpaid wages" });
    }
});

// -------------------------------------------------------------------------------------

// Get paid receipts
router.get("/paid-receipts/:operation", auth, async (req, res) => {
    try {
        const { operation } = req.params;
        const { branchId } = req.query;

        if (!branchId) {
            return res.status(400).json({ error: 'Branch ID is required.' });
        }
        
        let query = '';
        let params = [branchId];

        if (operation.toLowerCase() === 'cutting') {
            query = `
                SELECT 
                    receipt_id,
                    operator_name,
                    total_pieces,
                    gross_amount,
                    paid_amount,
                    deducted_advance,
                    payment_type,
                    paid_date,
                    created_at
                FROM cutting_receipts
                WHERE branch_id = ?
                ORDER BY paid_date DESC
            `;
        } else {
            return res.status(400).json({ error: 'Invalid operation type.' });
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching paid receipts:", error);
        res.status(500).json({ error: "Server error while fetching paid receipts" });
    }
});

// -------------------------------------------------------------------------------------

// Get wage entries for a specific operator 
router.get("/wage-entries/:operatorName", auth, async (req, res) => {
    try {
        const { operatorName } = req.params;
        const { branchId, operation } = req.query;

        if (!branchId || !operation) {
            return res.status(400).json({ error: 'Branch ID and operation are required.' });
        }

        let query = '';
        let params = [operatorName, branchId];

        if (operation.toLowerCase() === 'cutting') {
            query = `
                SELECT 
                    id,
                    inward_number,
                    product_name,
                    total_pcs as pieces,
                    weight_of_fabric,  
                    gross_amount,
                    created_at as date
                FROM cutting_entries 
                WHERE cutting_master = ? AND branch_id = ? AND (is_paid = 0 OR is_paid IS NULL)
                ORDER BY created_at DESC
            `;
        } else {
            return res.status(400).json({ error: 'Invalid operation type.' });
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching wage entries:", error);
        res.status(500).json({ error: "Server error while fetching wage entries" });
    }
});

// -------------------------------------------------------------------------------------

// Fetch a single paid receipt and its associated entries (✅ FIX APPLIED HERE)
// Fetch a single paid receipt and its associated entries (IMPROVED VERSION)
router.get("/receipt/:receiptId", auth, async (req, res) => {
    try {
        const { receiptId } = req.params;
        const { branchId } = req.query;

        if (!branchId) {
            return res.status(400).json({ error: 'Branch ID is required.' });
        }

        const [receiptRows] = await pool.query(
            'SELECT * FROM cutting_receipts WHERE receipt_id = ? AND branch_id = ?',
            [receiptId, branchId]
        );

        if (receiptRows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found.' });
        }

        const receiptDetails = receiptRows[0];
        let entryRows = [];

        // ✅ IMPROVED: Better error handling and validation
        if (receiptDetails.entry_ids) {
            try {
                let entryIds = [];
                
                // Parse JSON safely
                if (typeof receiptDetails.entry_ids === 'string') {
                    entryIds = JSON.parse(receiptDetails.entry_ids);
                } else {
                    entryIds = receiptDetails.entry_ids;
                }
                
                // Ensure it's an array and has valid IDs
                if (Array.isArray(entryIds) && entryIds.length > 0) {
                    // Convert to numbers and filter out invalid ones
                    const validIds = entryIds
                        .map(id => parseInt(id))
                        .filter(id => !isNaN(id) && id > 0);
                    
                    if (validIds.length > 0) {
                        const placeholders = validIds.map(() => '?').join(',');
                        
                        const [entries] = await pool.query(
                            `SELECT 
                                id,
                                inward_number,
                                product_name,
                                total_pcs AS pieces,         
                                weight_of_fabric AS weight,
                                gross_amount,
                                created_at AS date           
                            FROM cutting_entries 
                            WHERE id IN (${placeholders}) AND branch_id = ?
                            ORDER BY created_at DESC`,
                            [...validIds, branchId]
                        );
                        
                        entryRows = entries;
                        console.log(`Found ${entryRows.length} entries for receipt ${receiptId}`);
                    } else {
                        console.warn(`No valid entry IDs found in receipt ${receiptId}`);
                    }
                }
            } catch (parseError) {
                console.error('Error parsing entry_ids or fetching details:', parseError);
                // Don't fail the whole request, just return empty entries
            }
        }
        
        res.json({ 
            receiptDetails, 
            entries: entryRows,
            totalEntries: entryRows.length 
        });

    } catch (error) {
        console.error('Error fetching receipt details:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
});
// -------------------------------------------------------------------------------------

// Get pending advance balance for staff
router.get("/pending-balance", auth, async (req, res) => {
    try {
        const { staff_name, branchId } = req.query;

        if (!staff_name || !branchId) {
            return res.status(400).json({ 
                success: false,
                error: 'Staff name and branch ID are required.' 
            });
        }

        const [staffRows] = await pool.query(
            `SELECT id FROM staff WHERE full_name = ? AND branch_id = ?`,
            [staff_name, branchId]
        );

        if (staffRows.length === 0) {
            // Staff not found, pending balance is 0
            return res.json({ 
                success: true, 
                pendingBalance: 0,
                message: 'Staff not found' 
            });
        }

        const staffId = staffRows[0].id;

        // Sum of all unpaid advances
        const [pendingAdvance] = await pool.query(
            "SELECT SUM(amount) as total_pending FROM advance_payments WHERE staff_id = ? AND branch_id = ? AND (is_paid = 0 OR is_paid IS NULL)",
            [staffId, branchId]
        );

        const pendingBalance = pendingAdvance[0]?.total_pending || 0;

        res.json({ 
            success: true, 
            pendingBalance: parseFloat(pendingBalance) || 0 
        });

    } catch (error) {
        console.error("Error fetching pending balance:", error);
        res.status(500).json({ 
            success: false,
            error: "Server error while fetching pending balance" 
        });
    }
});

// -------------------------------------------------------------------------------------

// Process payment with advance deduction
router.post("/process-payment", auth, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            operatorName,
            operation,
            entryIds,
            grossAmount,
            deductAdvance,
            payableAmount,
            paymentType,
            branchId
        } = req.body;

        // Validation 
        if (!operatorName || !operation || !entryIds || !Array.isArray(entryIds) || entryIds.length === 0 || !branchId) {
            await connection.rollback();
            return res.status(400).json({ 
                error: "Missing required fields for payment processing."
            });
        }

        const grossAmountNum = parseFloat(grossAmount);
        const deductAdvanceNum = parseFloat(deductAdvance) || 0;
        const payableAmountNum = parseFloat(payableAmount);

        if (isNaN(grossAmountNum) || grossAmountNum < 0) {
            await connection.rollback();
            return res.status(400).json({ error: "Invalid gross amount" });
        }

        // Get staff details
        const [staffRows] = await connection.query(
            `SELECT id FROM staff WHERE full_name = ? AND branch_id = ?`,
            [operatorName, branchId]
        );

        if (staffRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Staff not found." });
        }

        const staffId = staffRows[0].id;

        // FIXED LOGIC: Handle advance deduction/repayment/bonus deposit
        if (deductAdvanceNum !== 0) {
            
            if (deductAdvanceNum > 0) {
                // POSITIVE DEDUCTION: Reduce existing advance payments (deduct from advance)
                const [pendingAdvances] = await connection.query(
                    "SELECT id, amount FROM advance_payments WHERE staff_id = ? AND branch_id = ? AND (is_paid = 0 OR is_paid IS NULL) ORDER BY created_at ASC",
                    [staffId, branchId]
                );

                let advanceToDeduct = deductAdvanceNum;
                for (const advance of pendingAdvances) {
                    if (advanceToDeduct <= 0) break;

                    const advanceId = advance.id;
                    const originalAmount = parseFloat(advance.amount);

                    if (advanceToDeduct >= originalAmount) {
                        // Mark advance as fully paid (cleared)
                        await connection.query(
                            "UPDATE advance_payments SET is_paid = 1, paid_at = NOW(), updated_at = NOW() WHERE id = ?",
                            [advanceId]
                        );
                        advanceToDeduct -= originalAmount;
                    } else {
                        // Partially deduct
                        await connection.query(
                            "UPDATE advance_payments SET amount = amount - ?, updated_at = NOW() WHERE id = ?",
                            [advanceToDeduct, advanceId]
                        );
                        advanceToDeduct = 0;
                    }
                }
            } else if (deductAdvanceNum < 0) {
                // NEGATIVE DEDUCTION (BONUS/EXTRA PAYMENT): Add as NEW ADVANCE DEPOSIT
                const bonusAmount = Math.abs(deductAdvanceNum);
                
                // Insert as new advance payment (deposit)
                await connection.query(
                    `INSERT INTO advance_payments 
                     (branch_id, staff_id, staff_name, aadhar_number, pan_number, mobile_number, amount, payment_method, payment_date, is_paid, created_at) 
                     VALUES (?, ?, ?, 'N/A', 'N/A', 'N/A', ?, 'Wage Bonus', NOW(), 0, NOW())`,
                    [branchId, staffId, operatorName, bonusAmount]
                );

                console.log(`Added bonus deposit of ₹${bonusAmount} for ${operatorName}`);
            }
        }

        // Mark cutting entries as paid
        if (operation.toLowerCase() === 'cutting') {
            const placeholders = entryIds.map(() => '?').join(',');
            await connection.query(
                `UPDATE cutting_entries SET is_paid = 1, paid_at = NOW() WHERE id IN (${placeholders}) AND branch_id = ?`,
                [...entryIds, branchId]
            );
        }

        // Get total pieces and total weight for receipt
        const [totalsResult] = await connection.query(
            `SELECT SUM(total_pcs) as total_pieces, SUM(weight_of_fabric) as total_weight FROM cutting_entries WHERE id IN (${entryIds.map(() => '?').join(',')})`,
            entryIds
        );

        const totalPieces = totalsResult[0]?.total_pieces || 0;
        const totalWeight = totalsResult[0]?.total_weight || 0;

        // Insert new receipt record
        await connection.query(
            `INSERT INTO cutting_receipts (branch_id, operator_id, operator_name, operation, total_pieces, total_weight, gross_amount, deducted_advance, paid_amount, payment_type, entry_ids, paid_date, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, 
            [
                branchId,
                staffId,
                operatorName,
                operation,
                totalPieces,
                totalWeight, 
                grossAmountNum,
                deductAdvanceNum, 
                payableAmountNum,
                paymentType,
                JSON.stringify(entryIds), 
            ]
        );

        await connection.commit();
        
        res.status(200).json({
            message: "Payment processed successfully!",
            success: true,
            paidAmount: payableAmountNum,
            advanceDeducted: deductAdvanceNum,
            bonusAdded: deductAdvanceNum < 0 ? Math.abs(deductAdvanceNum) : 0
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error processing payment:", error);
        res.status(500).json({ 
            error: "Server error while processing payment",
            details: error.message
        }); 
    } finally {
        connection.release();
    }
});      



module.exports = router;