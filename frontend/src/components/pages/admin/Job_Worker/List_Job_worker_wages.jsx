import React, { useState, useMemo, useRef } from "react";
import axios from "axios";
import { SizeDetailsModal } from "./Job_worker_slip/SizeDetailsModal.jsx";
import WageSlip from "./Job_worker_slip/WageSlip.jsx";
import { PaymentModal } from "./Job_worker_slip/PaymentModal.jsx";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const ViewJobWorkerEntries = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const branch_id = localStorage.getItem("branchId");
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [modalData, setModalData] = useState({});
    const [receivePcs, setReceivePcs] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [entryToPay, setEntryToPay] = useState(null);
    const [entryToPrint, setEntryToPrint] = useState(null);
    console.log('entryToPrint: ', entryToPrint);
    const slipRef = useRef();
    const [showPaid, setShowPaid] = useState(false);

    // Fetch all entries
    const fetchEntries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("branchToken");
            const branchId = localStorage.getItem("branchId") || localStorage.getItem("branch_id") || "1";

            const res = await axios.get(`${apiBaseUrl}/api/job-worker/all/${branchId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setEntries(res.data.data);
            } else {
                setError("Failed to fetch job worker entries");
            }
        } catch (err) {
            console.error(err);
            setError("Error fetching entries");
        }
        setLoading(false);
    };

    React.useEffect(() => {
        fetchEntries();
    }, []);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry =>
            entry.worker_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [entries, searchQuery]);

    // const unpaidEntries = filteredEntries.filter(entry => parseInt(entry.total_recv_pcs || 0) < parseInt(entry.total_pcs));
    // const paidEntries = filteredEntries.filter(entry => parseInt(entry.total_recv_pcs || 0) === parseInt(entry.total_pcs));
    const unpaidEntries = filteredEntries.filter(entry => entry.payment_type === "Pending");
    const paidEntries = filteredEntries.filter(entry => entry.payment_type === "Paid");

    const handleViewDetails = (sizeWiseEntry) => {
        try {
            let parsed = {};
            if (typeof sizeWiseEntry === "string") {
                parsed = JSON.parse(sizeWiseEntry || "{}");
            } else if (typeof sizeWiseEntry === "object" && sizeWiseEntry !== null) {
                parsed = { ...sizeWiseEntry };
            }
            setModalData(parsed && Object.keys(parsed).length ? parsed : { Message: "No size-wise data." });
            setShowSizeModal(true);
        } catch (error) {
            console.error("Error parsing size data:", error);
            setModalData({ Message: "An error occurred while loading details." });
            setShowSizeModal(true);
        }
    };

    const handleReceivePcsUpdate = async (entry) => {
        if (!receivePcs || isNaN(receivePcs) || parseInt(receivePcs) <= 0) {
            alert("Enter a valid number of received pcs");
            return;
        }

        try {
            const token = localStorage.getItem("branchToken");
            const res = await axios.put(`${apiBaseUrl}/api/job-worker/update/${entry.job_worker_id}/${branch_id}`, {
                received_pcs: parseInt(receivePcs)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                alert(`Updated successfully. Total received pcs: ${res.data.total_recv_pcs}`);
                fetchEntries();
                setReceivePcs("");
            } else {
                alert(res.data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update received pcs");
        }
    };

    const handlePrint = async (entry) => {
        if (parseInt(entry.total_recv_pcs || 0) !== parseInt(entry.total_pcs)) {
            alert("Cannot print receipt until all pieces are received.");
            return;
        }

        try {
            const token = localStorage.getItem("branchToken");
            const branchId = localStorage.getItem("branchId") || branch_id;

            const res = await axios.get(
                `${apiBaseUrl}/api/job-worker/payments/${entry.job_worker_id}/${branchId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success && res.data.data) {
                const paidEntry = res.data.data;

                // ✅ Parse size_wise_entry (since it's likely stored as JSON string)
                if (typeof paidEntry.size_wise_entry === "string") {
                    paidEntry.size_wise_entry = JSON.parse(paidEntry.size_wise_entry);
                }

                setEntryToPrint(paidEntry);

                // ✅ Wait a short delay before printing
                setTimeout(() => {
                    if (slipRef.current) {
                        const printContents = slipRef.current.innerHTML;
                        const printWindow = window.open("", "_blank");
                        printWindow.document.write(`
            <html>
              <head>
                <title>Wage Slip</title>
                <style>
                  body { font-family: Arial; padding: 20px; }
                  h2 { text-align: center; }
                  p { margin: 5px 0; }
                </style>
              </head>
              <body>${printContents}</body>
            </html>
          `);
                        printWindow.document.close();
                        printWindow.focus();
                        printWindow.print();
                        printWindow.close();
                    }
                }, 300);
            } else {
                alert("Paid entry not found for printing.");
            }
        } catch (err) {
            console.error("Error fetching paid entry for printing:", err);
            alert("Failed to fetch paid entry.");
        }
    };

    const openPaymentModal = (entry) => {
        setEntryToPay(entry);
        setShowPaymentModal(true);
    };

    if (loading) return <p className="text-center text-gray-500">Loading entries...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto bg-white shadow p-6 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0071bc]">Job Worker Entries</h2>
                    <a
                        href="/admin/25/dashboard/job-worker/add-wages"
                        className="mt-3 md:mt-0 inline-flex items-center gap-2 bg-[#0071bc] text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                    >
                        ➕ Add Wages
                    </a>
                </div>

                {/* Toggle Buttons for Paid/Unpaid */}
                <div className="flex justify-center gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by worker name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-1/2 mb-4 py-2 px-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={() => setShowPaid(false)}
                        className={`px-4 py-2 rounded ${!showPaid ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Unpaid
                    </button>
                    <button
                        onClick={() => setShowPaid(true)}
                        className={`px-4 py-2 rounded ${showPaid ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Paid
                    </button>
                </div>

                {/* Unpaid Entries Section */}
                {!showPaid && (
                    <div>
                        <h3 className="text-lg font-semibold text-red-600 mb-2">Unpaid Entries ({unpaidEntries.length})</h3>
                        {unpaidEntries.length === 0 ? (
                            <p className="text-gray-500 mb-4">All entries are fully received.</p>
                        ) : (
                            <div className="space-y-3 mb-6">
                                {unpaidEntries.map((entry) => (
                                    <div key={entry.job_worker_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                                        <div>
                                            <p className="font-medium">{entry.worker_name}</p>
                                            <p className="text-sm text-gray-600">Product: {entry.product_name}</p>
                                            <p className="text-sm text-gray-600">Gross Amount: ₹{entry.gross_amount}</p>
                                            <p className="text-sm text-gray-600">Received: {entry.total_recv_pcs || 0}/{entry.total_pcs}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewDetails(entry.size_wise_entry)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                                            >
                                                View Sizes
                                            </button>
                                            {parseInt(entry.total_recv_pcs || 0) < parseInt(entry.total_pcs) ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        placeholder="Receive pcs"
                                                        value={receivePcs}
                                                        onChange={(e) => setReceivePcs(e.target.value)}
                                                        className="w-24 border rounded px-2 py-1 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => handleReceivePcsUpdate(entry)}
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                                                    >
                                                        Update
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => openPaymentModal(entry)}
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                                                >
                                                    Payment
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Paid Entries Section */}
                {showPaid && (
                    <div>
                        <h3 className="text-lg font-semibold text-green-600 mb-2">Paid Entries ({paidEntries.length})</h3>
                        {paidEntries.length === 0 ? (
                            <p className="text-gray-500">No fully received entries yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {paidEntries.map((entry) => (
                                    <div key={entry.job_worker_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                                        <div>
                                            <p className="font-medium">{entry.worker_name}</p>
                                            <p className="text-sm text-gray-600">Product: {entry.product_name}</p>
                                            <p className="text-sm text-gray-600">Gross Amount: ₹{entry.gross_amount}</p>
                                            <p className="text-sm text-gray-600">Total pcs: {entry.total_pcs}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewDetails(entry.size_wise_entry)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                                            >
                                                View Sizes
                                            </button>
                                            <button
                                                onClick={() => handlePrint(entry)}
                                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                                            >
                                                Print Receipt
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <SizeDetailsModal
                show={showSizeModal}
                onClose={() => setShowSizeModal(false)}
                data={modalData}
            />

            {entryToPrint && (
                <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
                    <WageSlip ref={slipRef} entry={entryToPrint} sizeDetails={entryToPrint.size_wise_entry} />
                </div>
            )}

            <PaymentModal
                show={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                entry={entryToPay}
                onSubmit={async ({ tds, totalAmount, paymentMode, entryId }) => {
                    try {
                        const token = localStorage.getItem("branchToken");
                        const res = await axios.post(`${apiBaseUrl}/api/job-worker/payment/${entryId}`, {
                            tds,
                            branchId: branch_id,
                            totalAmount,
                            paymentMode
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (res.data.success) {
                            alert("Payment successful!");
                            fetchEntries();
                        } else {
                            alert(res.data.error);
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Payment failed");
                    } finally {
                        setShowPaymentModal(false);
                        setEntryToPay(null); // reset entry after modal closes
                    }
                }}
            />
        </div>
    );
};

export default ViewJobWorkerEntries;
