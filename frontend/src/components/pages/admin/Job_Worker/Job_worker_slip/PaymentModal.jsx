import React, { useState, useEffect } from "react";
import { FaCashRegister, FaCreditCard, FaMobileAlt, FaCheckCircle } from 'react-icons/fa'; // Icons for payment methods

export const PaymentModal = ({ show, onClose, entry, onSubmit }) => {
    const [tdsEnabled, setTdsEnabled] = useState(false);
    const [tdsPercent, setTdsPercent] = useState(0); // TDS % instead of fixed amount
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [totalAmount, setTotalAmount] = useState(0);
    const [tdsAmount, setTdsAmount] = useState(0); // calculated from % of gross

    // Update TDS amount and total whenever gross, TDS enabled, or TDS % changes
    useEffect(() => {
        if (!entry) return;

        const gross = parseFloat(entry.gross_amount || 0);
        const tds = tdsEnabled ? (gross * parseFloat(tdsPercent || 0)) / 100 : 0;
        setTdsAmount(tds.toFixed(2));
        setTotalAmount((gross - tds).toFixed(2)); // add TDS to gross if required
    }, [tdsEnabled, tdsPercent, entry]);

    // Reset modal state whenever entry changes
    useEffect(() => {
        if (entry) {
            setTdsEnabled(false);
            setTdsPercent(0);
            setPaymentMode("Cash");
            setTotalAmount(entry.gross_amount);
            setTdsAmount(0);
        }
    }, [entry]);

    if (!show || !entry) return null;

    const handleSubmit = () => {
        onSubmit({
            tds: parseFloat(tdsAmount),
            totalAmount: parseFloat(totalAmount),
            paymentMode,
            entryId: entry.job_worker_id
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96 transition-transform transform scale-95 hover:scale-100">
                <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">Make Payment</h2>

                <div className="mb-4">
                    <p className="text-lg text-gray-700"><strong>Gross Amount:</strong> ₹{entry.gross_amount}</p>
                </div>

                <div className="mb-5">
                    <label className="flex items-center gap-2 text-gray-700">
                        <input
                            type="checkbox"
                            checked={tdsEnabled}
                            onChange={(e) => setTdsEnabled(e.target.checked)}
                            className="w-5 h-5 text-purple-500"
                        />
                        <span className="text-lg">Apply TDS (%)</span>
                    </label>
                    {tdsEnabled && (
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={tdsPercent}
                            onChange={(e) => setTdsPercent(e.target.value)}
                            className="w-full mt-2 border-2 border-gray-300 rounded-xl px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter TDS %"
                        />
                    )}
                </div>

                {tdsEnabled && (
                    <div className="mb-5">
                        <p className="text-lg text-gray-700"><strong>TDS Amount:</strong> ₹{tdsAmount}</p>
                    </div>
                )}

                <div className="mb-5">
                    <p className="text-lg text-gray-700"><strong>Total Amount:</strong> ₹{totalAmount}</p>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-lg text-gray-700">Payment Mode</label>
                    <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Cheque">Cheque</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl text-gray-700 border-2 border-gray-300 hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
                    >
                        Pay
                    </button>
                </div>
            </div>
        </div>
    );
};
