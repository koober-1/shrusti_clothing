import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const UpdateProductPricePage = () => {
    const { branchId } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [fabricType, setFabricType] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("branchToken");
                if (!token) return navigate("/login");

                const res = await axios.get(`${apiBaseUrl}/api/products`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { branch_id: branchId }
                });
                setProducts(res.data || []); // adjust based on console.log
            } catch (err) {
                console.error("Error fetching products:", err);
                toast.error("Failed to fetch products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [branchId, navigate]);

    // Handle selection of a product
    const handleProductSelect = (e) => {
        const productId = e.target.value;
        setSelectedProductId(productId);

        const product = products.find((p) => p.id.toString() === productId);
        if (product) {
            setFabricType(product.fabric_type || "");
            setProductPrice(product.product_price || "");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProductId || !productPrice) {
            toast.error("Please select a product and enter price.");
            return;
        }

        try {
            const token = localStorage.getItem("branchToken");
            if (!token) return navigate("/login");

            // Find selected product from products table
            const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

            if (!selectedProduct) {
                toast.error("Selected product not found.");
                return;
            }

            // Send to backend to insert into job_worker_product_entry
            await axios.post(
                `${apiBaseUrl}/api/job-worker/add-product-entry`,
                {
                    productName: selectedProduct.product_name,
                    fabricType: selectedProduct.fabric_type,
                    productPrice
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Product added to branch price table successfully!");
            setSelectedProductId("");
            setFabricType("");
            setProductPrice("");
        } catch (err) {
            console.error("Error adding product entry:", err);
            toast.error("Failed to add product price.");
        }
    };


    if (loading) return <p className="text-center mt-10">Loading products...</p>;

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Add Product Price</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-semibold mb-1">Select Product</label>
                    <select
                        value={selectedProductId}
                        onChange={handleProductSelect}
                        className="w-full border p-2 rounded"
                        required
                    >
                        <option value="" disabled>
                            Select product
                        </option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.product_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-semibold mb-1">Fabric Type</label>
                    <input
                        type="text"
                        value={fabricType}
                        disabled
                        className="w-full border p-2 rounded bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Product Price</label>
                    <input
                        type="number"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="Enter new price"
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Add Price
                </button>
            </form>

            <ToastContainer />
        </div>
    );
};

export default UpdateProductPricePage;
