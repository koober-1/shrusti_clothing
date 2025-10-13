import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// 🔹 Decode JWT Helper
const decodeJwt = (token) => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
};

// 🔹 Reusable Modal Component
const Modal = ({ title, message, onClose }) => {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-gray-800">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <p className="mb-6">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const JobWorkerEntry = () => {
    const navigate = useNavigate();
    const [branchId, setBranchId] = useState(null);
    const [jobWorkers, setJobWorkers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [productPrice, setProductPrice] = useState(0);
    const [workerDetails, setWorkerDetails] = useState({
        aadhar_number: "",
        pan_number: "",
        mobile_number: "",
    });
    const [sizeWiseEntry, setSizeWiseEntry] = useState({});
    const [totalPcs, setTotalPcs] = useState(0);
    const [grossAmount, setGrossAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ title: "", message: "" });
    const [rangeInput, setRangeInput] = useState("");

    const sizes = ["2-3", "3-4", "4-5", "6-7", "7-8", "9-10", "11-12", "13-14"];

    // 🔹 Get branch ID from token
    useEffect(() => {
        const token = localStorage.getItem("branchToken");
        if (token) {
            const decoded = decodeJwt(token);
            if (decoded?.branch_id) setBranchId(decoded.branch_id);
            else navigate("/login");
        } else navigate("/login");
    }, [navigate]);

    // 🔹 Fetch Job Workers & Products
    useEffect(() => {
        if (!branchId) return;
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("branchToken");
                const headers = { Authorization: `Bearer ${token}` };

                const [workersRes, productsRes] = await Promise.all([
                    axios.get(`${apiBaseUrl}/api/job-worker/all`, { headers }),
                    axios.get(`${apiBaseUrl}/api/job-worker/product-entry/${branchId}`, {
                        headers,
                    }),
                ]);

                setJobWorkers(workersRes.data);
                setProducts(productsRes.data.data);

                console.log("✅ Workers:", workersRes.data);
                console.log("✅ Products:", productsRes.data);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                setModal({
                    title: "Error",
                    message: "Error fetching job workers or products.",
                });
            }
        };
        fetchData();
    }, [branchId]);

    // 🔹 Handle worker selection (auto-fill details)
    const handleWorkerChange = (e) => {
        const name = e.target.value;
        setSelectedWorker(name);
        const selected = jobWorkers.find((w) => w.full_name === name);
        if (selected) {
            setWorkerDetails({
                aadhar_number: selected.aadhar_number || "",
                pan_number: selected.pan_number || "",
                mobile_number: selected.mobile_number || "",
            });
        } else {
            setWorkerDetails({ aadhar_number: "", pan_number: "", mobile_number: "" });
        }
    };

    // 🔹 Handle product selection and set price
    const handleProductChange = (e) => {
        const name = e.target.value;
        setSelectedProduct(name);
        const product = products.find((p) => p.product_name === name);
        console.log("🧾 Selected Product:", product);
        if (product) setProductPrice(product.product_price || 0);
        else setProductPrice(0);
    };

    // 🔹 Handle size entry
    const handleSizeWiseEntryChange = (size, value) => {
        const newEntry = { ...sizeWiseEntry, [size]: value };
        setSizeWiseEntry(newEntry);
        const total = Object.entries(newEntry).reduce(
            (sum, [k, v]) => sum + (parseInt(v) || 0),
            0
        );
        setTotalPcs(total);
    };

    // 🔹 Fill all sizes
    const handleRangeFill = () => {
        const val = parseInt(rangeInput, 10);
        if (isNaN(val) || val < 0) {
            setModal({ title: "Error", message: "Please enter a valid number." });
            return;
        }
        const filled = {};
        sizes.forEach((s) => (filled[s] = val));
        setSizeWiseEntry(filled);
        setTotalPcs(val * sizes.length);
    };

    // 🔹 Auto calculate gross amount
    useEffect(() => {
        setGrossAmount(totalPcs * productPrice);
    }, [totalPcs, productPrice]);

    // 🔹 Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedWorker || !selectedProduct || totalPcs <= 0) {
            setModal({
                title: "Incomplete Form",
                message: "Please fill all required fields properly.",
            });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("branchToken");

            await axios.post(
                `${apiBaseUrl}/api/job-worker/add-jobworker-entry`,
                {
                    worker_name: selectedWorker,
                    aadhar_number: workerDetails.aadhar_number,
                    pan_number: workerDetails.pan_number,
                    mobile_number: workerDetails.mobile_number,
                    size_wise_entry: sizeWiseEntry,
                    total_pcs: totalPcs,
                    branchId: branchId,
                    product_name: selectedProduct,
                    gross_amount: grossAmount,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setModal({
                title: "Success",
                message: "Job Worker Entry successfully added ✅",
            });

            // Reset form
            setSelectedWorker("");
            setWorkerDetails({ aadhar_number: "", pan_number: "", mobile_number: "" });
            setSelectedProduct("");
            setProductPrice(0);
            setSizeWiseEntry({});
            setTotalPcs(0);
            setGrossAmount(0);
            setRangeInput("");
        } catch (error) {
            console.error("Error submitting form:", error);
            setModal({
                title: "Error",
                message: "Server error while submitting entry.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !branchId)
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <p>Loading...</p>
            </div>
        );

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-5xl">
                <h2 className="text-2xl font-bold text-center text-[#0071bc] mb-6">
                    Job Worker Entry
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Worker Details */}
                    <div className="bg-gray-50 p-6 rounded-xl border">
                        <h3 className="font-bold mb-4 text-gray-700">Worker Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Worker Name
                                </label>
                                <select
                                    value={selectedWorker}
                                    onChange={handleWorkerChange}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-xl"
                                    required
                                >
                                    <option value="">-- Select Worker --</option>
                                    {jobWorkers.map((w) => (
                                        <option key={w.id} value={w.full_name}>
                                            {w.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <input
                                type="text"
                                value={workerDetails.aadhar_number}
                                readOnly
                                className="mt-8 block w-full p-3 border border-gray-300 rounded-xl bg-gray-100"
                                placeholder="Aadhar Number"
                            />
                            <input
                                type="text"
                                value={workerDetails.pan_number}
                                readOnly
                                className="mt-8 block w-full p-3 border border-gray-300 rounded-xl bg-gray-100"
                                placeholder="PAN Number"
                            />
                            <input
                                type="text"
                                value={workerDetails.mobile_number}
                                readOnly
                                className="mt-8 block w-full p-3 border border-gray-300 rounded-xl bg-gray-100"
                                placeholder="Mobile Number"
                            />
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="bg-gray-50 p-6 rounded-xl border">
                        <h3 className="font-bold mb-4 text-gray-700">Product Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={selectedProduct}
                                onChange={handleProductChange}
                                className="p-3 border border-gray-300 rounded-xl"
                                required
                            >
                                <option value="">-- Select Product --</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.product_name}>
                                        {p.product_name} — ₹{p.product_price}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Size Entry */}
                    <div className="bg-gray-50 p-6 rounded-xl border">
                        <h3 className="font-bold mb-2">Size-wise Entry</h3>
                        <div className="flex items-center space-x-2 mb-4">
                            <input
                                type="number"
                                value={rangeInput}
                                onChange={(e) => setRangeInput(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Enter value for all sizes"
                            />
                            <button
                                type="button"
                                onClick={handleRangeFill}
                                className="bg-gray-300 text-gray-800 p-2 rounded-lg hover:bg-gray-400"
                            >
                                Fill All
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                            {sizes.map((size) => (
                                <div key={size}>
                                    <label className="text-sm font-bold text-gray-500 block">
                                        {size}
                                    </label>
                                    <input
                                        type="number"
                                        value={sizeWiseEntry[size] || ""}
                                        onChange={(e) =>
                                            handleSizeWiseEntryChange(size, e.target.value)
                                        }
                                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
                                        placeholder="No."
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Total Pcs
                                </label>
                                <input
                                    type="text"
                                    value={totalPcs}
                                    readOnly
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-xl bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Gross Amount
                                </label>
                                <input
                                    type="text"
                                    value={grossAmount}
                                    readOnly
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-xl bg-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl text-white font-bold text-lg bg-[#4b003a] hover:bg-[#6c0054]"
                    >
                        Submit
                    </button>
                </form>
            </div>

            {/* Modal */}
            {modal.message && (
                <Modal
                    title={modal.title}
                    message={modal.message}
                    onClose={() => setModal({ title: "", message: "" })}
                />
            )}
        </div>
    );
};

export default JobWorkerEntry;
