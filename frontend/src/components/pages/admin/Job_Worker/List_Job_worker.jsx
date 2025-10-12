import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 24 24">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 
    6.34c.39-.39.39-1.02 0-1.41l-2.34-2.34a1.003 
    1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 
    1.84-1.83z"/>
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 24 24">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
);

const ViewJobWorker = () => {
    const [workerList, setWorkerList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState([]);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/api/job-worker/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("branchToken")}` },
            });
            setWorkerList(res.data || []);
        } catch (err) {
            console.error("Error fetching job workers:", err);
            toast.error("Failed to fetch job workers.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this worker?")) return;

        try {
            await axios.delete(`${apiBaseUrl}/api/job-worker/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("branchToken")}` },
            });
            toast.success("Worker deleted successfully");
            fetchWorkers();
        } catch (err) {
            console.error("Error deleting worker:", err);
            toast.error("Failed to delete worker.");
        }
    };

    const handleEditClick = async (id) => {
        try {
            const res = await axios.get(`${apiBaseUrl}/api/job-worker/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("branchToken")}` },
            });
            setEditData(res.data);
            setShowModal(true);
        } catch (err) {
            console.error("Error fetching worker details:", err);
            toast.error("Failed to fetch worker details.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${apiBaseUrl}/api/job-worker/update/${editData.id}`, editData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("branchToken")}` },
            });
            toast.success("Worker updated successfully");
            setShowModal(false);
            fetchWorkers();
        } catch (err) {
            console.error("Error updating worker:", err);
            toast.error("Failed to update worker.");
        }
    };

    if (loading) return <p className="text-center">Loading workers...</p>;

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-5">Job Workers</h2>

            {workerList.length === 0 ? (
                <p>No workers found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border px-3 py-2">S.No.</th>
                                <th className="border px-3 py-2">Full Name</th>
                                <th className="border px-3 py-2">Mobile</th>
                                <th className="border px-3 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workerList.map((worker, idx) => (
                                <tr key={worker.id} className="hover:bg-gray-100">
                                    <td className="border px-3 py-2">{idx + 1}</td>
                                    <td className="border px-3 py-2">{worker.full_name}</td>
                                    <td className="border px-3 py-2">{worker.mobile_number}</td>
                                    <td className="border px-3 py-2 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleEditClick(worker.id)} className="text-blue-600 hover:text-blue-800 p-1">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => handleDelete(worker.id)} className="text-red-600 hover:text-red-800 p-1">
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {showModal && editData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Edit Job Worker</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block font-semibold">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={editData.full_name || ""}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold">Mobile</label>
                                <input
                                    type="text"
                                    name="mobile_number"
                                    value={editData.mobile_number || ""}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold">Aadhaar Number</label>
                                <input
                                    type="text"
                                    name="aadhar_number"
                                    value={editData.aadhar_number || ""}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    maxLength={12}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold">PAN Number</label>
                                <input
                                    type="text"
                                    name="pan_number"
                                    value={editData.pan_number || ""}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold">Unit Full Address</label>
                                <input
                                    type="text"
                                    name="full_unit_address"
                                    value={editData.full_unit_address || ""}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-400 text-white px-3 py-1 rounded">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default ViewJobWorker;
