import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';

const ViewAllProductsTable = () => {
  // Sample data to display in the table
  const [products, setProducts] = useState([
    { sNo: 1, productName: 'Pant', fabricType: 'Cotton', singerPrice: 10, overlockPrice: 15, flatlockPrice: 15 },
    { sNo: 2, productName: 'Shirt', fabricType: 'Polyester', singerPrice: 10, overlockPrice: 15, flatlockPrice: 15 },
    { sNo: 3, productName: 'Skirt', fabricType: 'Denim', singerPrice: 12, overlockPrice: 18, flatlockPrice: 18 },
    { sNo: 4, productName: 'Jacket', fabricType: 'Leather', singerPrice: 25, overlockPrice: 30, flatlockPrice: 30 },
    { sNo: 5, productName: 'Dress', fabricType: 'Silk', singerPrice: 20, overlockPrice: 25, flatlockPrice: 25 },
  ]);

  // State for the search inputs
  const [productSearch, setProductSearch] = useState('');
  const [fabricSearch, setFabricSearch] = useState('');

  const handleEditProduct = (sNo) => {
    alert(`Editing product with S. No. ${sNo}`);
  };

  const handleExportPDF = () => {
    alert('Export to PDF button clicked!');
  };

  // Filter the products based on the search input
  const filteredProducts = products.filter(product => {
    const matchesProductName = product.productName.toLowerCase().includes(productSearch.toLowerCase());
    const matchesFabricType = product.fabricType.toLowerCase().includes(fabricSearch.toLowerCase());
    return matchesProductName && matchesFabricType;
  });

  return (
    // This div provides the blue background from the Tailwind CSS class
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="bg-[#0071bc] p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">View All Product</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportPDF}
              className="bg-[#6a053c] text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-[#6a053c] transition duration-200"
            >
              Export PDF
            </button>
          </div>
        </div>
        
        {/* Search Bars for filtering */}
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search Product Name..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            // 👇 Here is the change for the white search bar
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800 text-black bg-white"
          />
          <input
            type="text"
            placeholder="Search Fabric Type..."
            value={fabricSearch}
            onChange={(e) => setFabricSearch(e.target.value)}
            // 👇 Here is the change for the white search bar
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800 text-black bg-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-center border-b">S. No.</th>
                <th className="py-3 px-6 text-left border-b">Product Name</th>
                <th className="py-3 px-6 text-left border-b">Fabric Type</th>
                <th className="py-3 px-6 text-center border-b">Singer Price (RS)</th>
                <th className="py-3 px-6 text-center border-b">Overlock Price (RS)</th>
                <th className="py-3 px-6 text-center border-b">Flatlock Price (RS)</th>
                <th className="py-3 px-6 text-center border-b">Edit Product</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {filteredProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-center whitespace-nowrap border-r">{product.sNo}</td>
                  <td className="py-3 px-6 text-left border-r">{product.productName}</td>
                  <td className="py-3 px-6 text-left border-r">{product.fabricType}</td>
                  <td className="py-3 px-6 text-center border-r">{product.singerPrice}</td>
                  <td className="py-3 px-6 text-center border-r">{product.overlockPrice}</td>
                  <td className="py-3 px-6 text-center border-r">{product.flatlockPrice}</td>
                  <td className="py-3 px-6 text-center">
                    <button onClick={() => handleEditProduct(product.sNo)} className="text-gray-500 hover:text-blue-500">
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination area */}
        <div className="flex justify-end mt-4 text-white text-sm">
          <div className="flex space-x-1">
            <span className="p-1">Page</span>
            <a href="#" className="p-1 px-2 rounded hover:bg-gray-200 hover:text-black border border-white">1</a>
            <a href="#" className="p-1 px-2 rounded hover:bg-gray-200 hover:text-black border border-white">2</a>
            <a href="#" className="p-1 px-2 rounded hover:bg-gray-200 hover:text-black border border-white">3</a>
            <a href="#" className="p-1 px-2 rounded hover:bg-gray-200 hover:text-black border border-white">4</a>
            <span>...</span>
            <a href="#" className="p-1 px-2 rounded hover:bg-gray-200 hover:text-black border border-white">10</a>
            <a href="#" className="p-1 px-2 rounded hover:bg-gray-200 hover:text-black border border-white">11</a>
            <a href="#" className="p-1 px-2 rounded hover:bg-gray-200 hover:text-black border border-white">12</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllProductsTable;