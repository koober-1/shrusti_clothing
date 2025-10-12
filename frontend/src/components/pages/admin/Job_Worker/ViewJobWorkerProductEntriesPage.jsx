import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const ViewJobWorkerProductEntriesPage = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingEntry, setEditingEntry] = useState(null);

    const branch_id = localStorage.getItem("branchId");
    const token = localStorage.getItem("branchToken");

    // ---------------- Fetch job worker entries ----------------
    const fetchEntries = async () => {
        setLoading(true);
        try {
            if (!token) return navigate("/login");

            const res = await axios.get(`${apiBaseUrl}/api/job-worker/product-entries/${branch_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setEntries(res.data.data || []);
        } catch (err) {
            console.error("Error fetching entries:", err);
            toast.error("Failed to fetch product entries.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    // ---------------- Edit price ----------------
    const handleEditPrice = (entry) => setEditingEntry({ ...entry });

    const handleSavePrice = async () => {
        if (!editingEntry || editingEntry.product_price === undefined || editingEntry.product_price === "") {
            toast.error("Price cannot be empty");
            return;
        }

        try {
            await axios.put(
                `${apiBaseUrl}/api/job-worker/product-entry/${editingEntry.id}`,
                {
                    productName: editingEntry.product_name,
                    productPrice: editingEntry.product_price,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Price updated successfully!");
            setEditingEntry(null);
            fetchEntries();
        } catch (err) {
            console.error("Error updating price:", err);
            toast.error("Failed to update price.");
        }
    };

    // ---------------- Delete entry ----------------
    const handleDeleteEntry = async (id) => {
        if (!window.confirm("Are you sure you want to delete this entry?")) return;

        try {
            await axios.delete(`${apiBaseUrl}/api/job-worker/product-entry/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Entry deleted successfully!");
            setEntries(entries.filter((e) => e.id !== id));
        } catch (err) {
            console.error("Error deleting entry:", err);
            toast.error("Failed to delete entry.");
        }
    };

    if (loading) return <p className="text-center mt-10 font-semibold">Loading product entries...</p>;

    return (
        <div className="min-h-screen p-8 bg-blue-100">
           <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
  Job Worker Product Entries
  <button
    onClick={() => navigate(`/admin/${branch_id}/dashboard/job-worker/product`)}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
  >
    Add Product Price
  </button>
</h2>
            <div className="overflow-x-auto bg-white p-4 rounded shadow">
                <table className="min-w-full border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                            <th className="py-2 px-4 border">#</th>
                            <th className="py-2 px-4 border">Product Name</th>
                            <th className="py-2 px-4 border">Fabric Type</th>
                            <th className="py-2 px-4 border">Price</th>
                            <th className="py-2 px-4 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, i) => (
                            <tr key={entry.id} className="text-gray-700 hover:bg-gray-50">
                                <td className="py-2 px-4 border text-center">{i + 1}</td>
                                <td className="py-2 px-4 border">{entry.product_name}</td>
                                <td className="py-2 px-4 border">{entry.fabric_type}</td>
                                <td className="py-2 px-4 border">
                                    {editingEntry?.id === entry.id ? (
                                        <input
                                            type="number"
                                            value={editingEntry.product_price}
                                            onChange={(e) =>
                                                setEditingEntry({ ...editingEntry, product_price: e.target.value })
                                            }
                                            className="border p-1 rounded w-24"
                                        />
                                    ) : (
                                        entry.product_price
                                    )}
                                </td>
                                <td className="py-2 px-4 border flex space-x-2 justify-center">
                                    {editingEntry?.id === entry.id ? (
                                        <>
                                            <button
                                                onClick={handleSavePrice}
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingEntry(null)}
                                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEditPrice(entry)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {entries.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500">
                                    No product entries found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default ViewJobWorkerProductEntriesPage;
