import React, { forwardRef } from "react";

const WageSlip = forwardRef(({ entry }, ref) => {
    if (!entry) return null;

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatCurrency = (value) =>
        `₹${parseFloat(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const styles = {
        container: {
            width: "210mm",
            minHeight: "297mm",
            padding: "25mm 30mm",
            backgroundColor: "#ffffff",
            color: "#000",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "1.3",
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "30px",
            paddingBottom: "15px",
            borderBottom: "2px solid #000",
        },
        logoSection: {
            display: "flex",
            alignItems: "center",
        },
        logoBox: {
            width: "60px",
            height: "60px",
            marginRight: "15px",
        },
        logoImage: {
            width: "100%",
            height: "100%",
            objectFit: "contain",
        },
        companyText: {
            fontSize: "24px",
            fontWeight: "bold",
            textTransform: "uppercase",
            lineHeight: "1.2",
            letterSpacing: "1px",
        },
        wagesTitle: {
            fontSize: "48px",
            fontWeight: "bold",
            color: "#2563eb",
            letterSpacing: "3px",
            marginTop: "10px",
        },
        staffInfo: {
            marginBottom: "25px",
            fontSize: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        staffLeft: {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
        },
        staffRight: {
            fontSize: "16px",
            fontWeight: "normal",
            textAlign: "right",
        },
        advanceInfoSection: {
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px dotted #ccc",
            display: "flex",
            gap: "20px",
            justifyContent: "flex-end",
            fontSize: "14px",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "30px",
            border: "2px solid #000",
        },
        tableHeader: {
            backgroundColor: "#f8f9fa",
            fontWeight: "bold",
        },
        tableCell: {
            padding: "10px 8px",
            border: "1px solid #000",
            fontSize: "12px",
            textAlign: "center",
        },
        summarySection: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: "40px",
            paddingTop: "20px",
            borderTop: "2px solid #000",
        },
        thankYouText: {
            fontSize: "16px",
            fontWeight: "bold",
            lineHeight: "1.4",
            flex: 1,
        },
        amountSection: {
            minWidth: "300px",
            fontSize: "16px",
        },
        amountRow: {
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
            paddingBottom: "3px",
        },
        totalRow: {
            display: "flex",
            justifyContent: "space-between",
            fontSize: "18px",
            fontWeight: "bold",
            paddingTop: "8px",
            paddingBottom: "8px",
            borderTop: "2px solid #000",
            borderBottom: "2px solid #000",
            marginTop: "8px",
            marginBottom: "15px",
            color: "#2563eb",
        },
        paymentMethod: {
            textAlign: "right",
            fontSize: "14px",
            marginTop: "10px",
        },
        signatureSection: {
            display: "flex",
            justifyContent: "space-between",
            marginTop: "60px",
            fontSize: "14px",
        },
        signatureBox: {
            textAlign: "center",
            width: "200px",
        },
        dotLine: {
            borderBottom: "2px dotted #000",
            width: "100%",
            height: "1px",
            marginTop: "40px",
            marginBottom: "10px",
        },
    };

    return (
        <div ref={ref} style={styles.container}>
            {/* ===== Header ===== */}
            <div style={styles.header}>
                <div style={styles.logoSection}>
                    <div style={styles.logoBox}>
                        <img
                            src="/Shrusti_logo.png"
                            alt="Shrusti Clothing Logo"
                            style={styles.logoImage}
                        />
                    </div>
                    <div>
                        <div style={styles.companyText}>Shrusti Clothing</div>
                        <div style={{ fontSize: "13px", color: "#555" }}>
                            123 Textile Park, Tiruppur, Tamil Nadu <br />
                            GSTIN: 33ABCDE1234F1Z5
                        </div>
                    </div>
                </div>
                <div>
                    <div style={styles.wagesTitle}>WAGE SLIP</div>
                </div>
            </div>

            {/* ===== Staff Info ===== */}
            <div style={styles.staffInfo}>
                <div style={styles.staffLeft}>
                    <div><strong>Worker Name:</strong> {entry.worker_name}</div>
                    <div><strong>Job Worker ID:</strong> {entry.job_worker_id}</div>
                    <div><strong>Mobile:</strong> {entry.mobile_number}</div>
                    <div><strong>Product:</strong> {entry.product_name}</div>
                </div>
                <div style={styles.staffRight}>
                    <div><strong>Date:</strong> {formatDate(entry.created_at)}</div>
                    <div><strong>Aadhar:</strong> {entry.aadhar_number}</div>
                    <div><strong>PAN:</strong> {entry.pan_number}</div>
                </div>
            </div>

            {/* ===== Payment Table ===== */}
            <table style={styles.table}>
                <thead style={styles.tableHeader}>
                    <tr>
                        <th style={styles.tableCell}>Total PCS</th>
                        <th style={styles.tableCell}>Gross Amount</th>
                        <th style={styles.tableCell}>TDS Deduction</th>
                        <th style={styles.tableCell}>Net Payable</th>
                        <th style={styles.tableCell}>Payment Type</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={styles.tableCell}>{entry.total_pcs}</td>
                        <td style={styles.tableCell}>{formatCurrency(entry.gross_amount)}</td>
                        <td style={styles.tableCell}>{formatCurrency(entry.tds_value || 0)}</td>
                        <td style={styles.tableCell}>
                            {formatCurrency(entry.after_tds_apply || entry.gross_amount)}
                        </td>
                        <td style={styles.tableCell}>{entry.payment_type}</td>
                    </tr>
                </tbody>
            </table>

            {/* ===== Advance Info (optional) ===== */}
            {entry.advance_balance !== undefined && (
                <div style={styles.advanceInfoSection}>
                    <div style={styles.advanceRow}>
                        <strong>Previous Advance Balance:</strong>{" "}
                        {formatCurrency(entry.advance_balance)}
                    </div>
                </div>
            )}

            {/* ===== Summary Section ===== */}
            <div style={styles.summarySection}>
                <div style={styles.thankYouText}>
                    Thank you for your valuable contribution! <br />
                    Keep up the great work.
                </div>
                <div style={styles.amountSection}>
                    <div style={styles.amountRow}>
                        <span>Gross Amount:</span>
                        <span>{formatCurrency(entry.gross_amount)}</span>
                    </div>
                    {entry.tds_value > 0 && (
                        <div style={styles.amountRow}>
                            <span>TDS Deduction:</span>
                            <span>{formatCurrency(entry.tds_value)}</span>
                        </div>
                    )}
                    <div style={styles.totalRow}>
                        <span>Net Payable:</span>
                        <span>
                            {formatCurrency(entry.after_tds_apply || entry.gross_amount)}
                        </span>
                    </div>
                    <div style={styles.paymentMethod}>
                        Payment Method: <strong>{entry.payment_type}</strong>
                    </div>
                </div>
            </div>

            {/* ===== Signatures ===== */}
            <div style={styles.signatureSection}>
                <div style={styles.signatureBox}>
                    <div style={styles.dotLine}></div>
                    <div>Receiver Signature</div>
                </div>
                <div style={styles.signatureBox}>
                    <div style={styles.dotLine}></div>
                    <div>Authorized Signatory</div>
                </div>
            </div>
        </div>
    );
});

export default WageSlip;
