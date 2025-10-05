const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper function to get supplier_id from supplier_name and branch_id
const getSupplierId = async (supplierName, branchId) => {
    const [rows] = await pool.query(
        'SELECT id FROM suppliers WHERE supplier_name = ? AND branch_id = ?',
        [supplierName, branchId]
    );
    return rows[0] ? rows[0].id : null;
};

// Helper function to get fabric_type_id from fabric_type_name and branch_id
const getFabricTypeId = async (fabricTypeName, branchId) => {
    const [rows] = await pool.query(
        'SELECT id FROM fabric_types WHERE fabric_type_name = ? AND branch_id = ?',
        [fabricTypeName, branchId]
    );
    return rows[0] ? rows[0].id : null;
};

// ✅ MODIFIED: GET endpoint for all receipts - EXCLUDE USED RECEIPTS + Include Color
router.get('/', async (req, res) => {
    const { branchId } = req.query;
    if (!branchId) {
        return res.status(400).json({ error: 'Branch ID is required.' });
    }
    try {
        // 🔥 MAIN CHANGE: Only show receipts that are NOT used for cutting + include color
        const [rows] = await pool.query(
            `SELECT r.*, s.supplier_short_name 
             FROM receipts r 
             JOIN suppliers s ON r.supplier_id = s.id 
             WHERE r.branch_id = ? 
             AND (r.status IS NULL OR r.status != 'cutting_completed')
             ORDER BY r.created_at DESC`, 
            [branchId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching receipts:', error);
        res.status(500).json({ error: 'Failed to fetch receipts.' });
    }
});

// ✅ MODIFIED: POST endpoint to save a new receipt - Include Color
router.post('/', async (req, res) => {
    const { uniqueNumber, supplierName, invoiceNo, date, weightOfMaterial, fabricType, color, branchId } = req.body;

    if (!uniqueNumber || !supplierName || !invoiceNo || !date || !weightOfMaterial || !fabricType || !branchId) {
        return res.status(400).json({ error: 'All required fields and branch ID must be provided.' });
    }

    try {
        const supplierId = await getSupplierId(supplierName, branchId);
        if (!supplierId) {
            return res.status(404).json({ error: 'Supplier not found for this branch.' });
        }

        // Updated query to include color field
        const insertQuery = "INSERT INTO receipts (unique_number, supplier_id, invoice_no, date, weight_of_material, fabric_type, color, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [uniqueNumber, supplierId, invoiceNo, date, weightOfMaterial, fabricType, color || null, branchId];
        const [insertResult] = await pool.query(insertQuery.trim(), values);

        res.status(201).json({ 
            message: 'Receipt saved successfully!', 
            id: insertResult.insertId
        });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save receipt. It might already exist.' });
    }
});

// 🔥 NEW: PUT endpoint to update receipt (for edit functionality)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { weight_of_material, color, invoice_no, branchId } = req.body;

    if (!id || !branchId) {
        return res.status(400).json({ error: 'Receipt ID and Branch ID are required.' });
    }

    if (!weight_of_material || !invoice_no) {
        return res.status(400).json({ error: 'Weight and Invoice Number are required fields.' });
    }

    try {
        const updateQuery = `
            UPDATE receipts 
            SET weight_of_material = ?, color = ?, invoice_no = ?, updated_at = NOW() 
            WHERE id = ? AND branch_id = ?
        `;
        const values = [weight_of_material, color || null, invoice_no, id, branchId];
        const [result] = await pool.query(updateQuery, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Receipt not found or no changes made.' });
        }

        res.json({ success: true, message: 'Receipt updated successfully.' });
    } catch (error) {
        console.error('Error updating receipt:', error);
        res.status(500).json({ error: 'Failed to update receipt.' });
    }
});

// 🔥 NEW API: Check if inward number already used for cutting
router.get('/check-cutting-usage/:uniqueNumber', async (req, res) => {
    const { uniqueNumber } = req.params;
    const { branchId } = req.query;

    if (!uniqueNumber || !branchId) {
        return res.status(400).json({ error: 'Unique Number and Branch ID are required.' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id FROM cutting_entries WHERE inward_number = ? AND branch_id = ?',
            [uniqueNumber, branchId]
        );

        res.json({ alreadyUsed: rows.length > 0 });
    } catch (error) {
        console.error('Error checking cutting usage:', error);
        res.status(500).json({ error: 'Failed to check cutting usage.' });
    }
});

// 🔥 NEW API: Update receipt status
router.put('/update-status/:uniqueNumber', async (req, res) => {
    const { uniqueNumber } = req.params;
    const { status, branchId } = req.body;

    if (!uniqueNumber || !status || !branchId) {
        return res.status(400).json({ error: 'Unique Number, status, and Branch ID are required.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE receipts SET status = ?, updated_at = NOW() WHERE unique_number = ? AND branch_id = ?',
            [status, uniqueNumber, branchId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Receipt not found.' });
        }

        res.json({ success: true, message: 'Receipt status updated successfully.' });
    } catch (error) {
        console.error('Error updating receipt status:', error);
        res.status(500).json({ error: 'Failed to update receipt status.' });
    }
});

// GET endpoint to get all suppliers for a specific branch
router.get('/suppliers', async (req, res) => {
    const { branchId } = req.query;
    if (!branchId) {
        return res.status(400).json({ error: 'Branch ID is required.' });
    }
    try {
        const [rows] = await pool.query(
            'SELECT id, supplier_name, supplier_short_name FROM suppliers WHERE branch_id = ? ORDER BY supplier_name ASC',
            [branchId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ error: 'Failed to fetch suppliers.' });
    }
});

// POST endpoint to add a new supplier with branch ID
router.post('/suppliers', async (req, res) => {
    const { supplier_name, supplier_short_name, branchId } = req.body;

    if (!supplier_name || !supplier_short_name || !branchId) {
        return res.status(400).json({ error: 'All required fields and branch ID must be provided.' });
    }

    try {
        const [checkResults] = await pool.query(
            'SELECT COUNT(*) AS count FROM suppliers WHERE (supplier_name = ? OR supplier_short_name = ?) AND branch_id = ?',
            [supplier_name, supplier_short_name, branchId]
        );

        if (checkResults[0].count > 0) {
            return res.status(409).json({ error: 'Supplier with this name or short name already exists for this branch.' });
        }

        const [result] = await pool.query('INSERT INTO suppliers (supplier_name, supplier_short_name, branch_id) VALUES (?, ?, ?)', [supplier_name, supplier_short_name, branchId]);
        res.status(201).json({ message: 'Supplier added successfully!', id: result.insertId });
    } catch (error) {
        console.error('Error adding supplier:', error);
        res.status(500).json({ error: 'Failed to add supplier.' });
    }
});

// POST endpoint to add a new fabric type with branch ID
router.post('/fabric-types', async (req, res) => {
    const { fabric_type_name, branchId } = req.body;

    if (!fabric_type_name || !branchId) {
        return res.status(400).json({ error: 'Fabric type name and branch ID are required.' });
    }

    try {
        const [checkResults] = await pool.query('SELECT COUNT(*) AS count FROM fabric_types WHERE fabric_type_name = ? AND branch_id = ?', [fabric_type_name, branchId]);
        if (checkResults[0].count > 0) {
            return res.status(409).json({ error: 'Fabric type already exists for this branch.' });
        }
        
        const [result] = await pool.query('INSERT INTO fabric_types (fabric_type_name, branch_id) VALUES (?, ?)', [fabric_type_name, branchId]);
        res.status(201).json({ message: 'Fabric type added successfully!', id: result.insertId });
    } catch (error) {
        console.error('Error adding fabric type:', error);
        res.status(500).json({ error: 'Failed to add fabric type.' });
    }
});

// GET endpoint to get all fabric types for a specific branch
router.get('/fabric-types', async (req, res) => {
    const { branchId } = req.query;
    if (!branchId) {
        return res.status(400).json({ error: 'Branch ID is required.' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM fabric_types WHERE branch_id = ? ORDER BY fabric_type_name ASC', [branchId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching fabric types:', error);
        res.status(500).json({ error: 'Failed to fetch fabric types.' });
    }
});

// ✅ MODIFIED: Check if receipt is available for cutting before returning details
router.get('/:uniqueNumber', async (req, res) => {
    const { uniqueNumber } = req.params;
    const { branchId } = req.query;

    if (!uniqueNumber || !branchId) {
        return res.status(400).json({ error: 'Unique Number and Branch ID are required.' });
    }

    try {
        // Check if this inward number is already used for cutting
        const [cuttingCheck] = await pool.query(
            'SELECT id FROM cutting_entries WHERE inward_number = ? AND branch_id = ?',
            [uniqueNumber, branchId]
        );

        if (cuttingCheck.length > 0) {
            return res.status(409).json({ error: 'This inward number has already been used for cutting operation!' });
        }

        // If not used, return receipt details
        const [rows] = await pool.query(
            'SELECT * FROM receipts WHERE unique_number = ? AND branch_id = ? AND (status IS NULL OR status != "cutting_completed")',
            [uniqueNumber, branchId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found or already used for cutting.' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching receipt:', error);
        res.status(500).json({ error: 'Failed to fetch receipt.' });
    }
});

// ✅ MODIFIED: GET endpoint - fetch all receipts by supplierId and branchId with Fabric Type Name (EXCLUDE COMPLETED)
router.get('/by-supplier/:supplierId', async (req, res) => {
    const { supplierId } = req.params;
    const { branchId } = req.query;

    if (!supplierId || !branchId) {
        return res.status(400).json({ error: 'Supplier ID and Branch ID are required.' });
    }

    try {
        const query = `
            SELECT DISTINCT r.id, r.unique_number, r.invoice_no, r.date, r.weight_of_material,
                    f.fabric_type_name AS fabric_type, r.color, r.status
            FROM receipts r
            LEFT JOIN fabric_types f ON r.fabric_type = f.id
            WHERE r.supplier_id = ? AND r.branch_id = ?
            AND (r.status IS NULL OR r.status != 'cutting_completed')
            ORDER BY r.date DESC
        `;
        
        const [rows] = await pool.query(query.trim(), [supplierId, branchId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching receipts by supplier:', error);
        res.status(500).json({ error: 'Failed to fetch receipts by supplier.', details: error.message });
    }
});

module.exports = router;