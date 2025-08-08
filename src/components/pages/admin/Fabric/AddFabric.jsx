// src/pages/admin/Fabric/AddFabric.jsx
import React, { useState } from 'react';
import Barcode from 'react-barcode';

// Helper function to get today's date in DD-MM-YY format
const getTodayDateDDMMYY = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(today.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

const AddFabric = () => {
  // Form data ke liye state
  const initialFormState = {
    supplierName: '',
    supplierShortName: '',
    invoiceNo: '',
    date: getTodayDateDDMMYY(),
    weightOfMaterial: '',
    serialNo: '',
    fabricType: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [barcodeData, setBarcodeData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const barcodeValue = JSON.stringify(formData);
    setBarcodeData({
      value: barcodeValue,
      display: {
        supplierShortName: formData.supplierShortName,
        invoiceNo: formData.invoiceNo,
        date: formData.date,
      }
    });
  };

  const handleGenerateNew = () => {
    setBarcodeData(null);
    setFormData({ ...initialFormState, date: getTodayDateDDMMYY() });
  };

  if (barcodeData) {
    const displayText = `${barcodeData.display.supplierShortName}-${barcodeData.display.invoiceNo}-${barcodeData.display.date}`;

    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-7 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-[#0071bc] mb-6">Fabric Barcode</h2>
          
          <div className="p-4 border rounded-lg inline-block overflow-hidden">
            {/* Barcode ko horizontally chhota karne ke liye CSS transform add kiya */}
            <div style={{ transform: 'scaleX(0.7)', transformOrigin: 'center' }}>
              <Barcode 
                value={barcodeData.value} 
                displayValue={false}
                width={1}
                height={40}
              />
            </div>
          </div>
          
          <p className="text-gray-800 font-mono mt-4 text-lg">{displayText}</p>
          
          <p className="text-gray-500 mt-2 text-sm">Scan this barcode to get all fabric details.</p>

          <button
            onClick={handleGenerateNew}
            className="w-full mt-6 bg-[#0071bc] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Another Fabric
          </button>
        </div>
      </div>
    );
  }

  // Default mein form render karein
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-7">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center bg-[#0071bc] text-white p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">Add New Fabric</h2>
        </div>
        <div className="bg-white shadow p-6 rounded-b-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Saare form fields yahan hain... */}
            <div>
              <label className="block font-semibold text-gray-700">Supplier Name</label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                placeholder="Enter supplier name"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Supplier Short Name</label>
              <input
                type="text"
                name="supplierShortName"
                value={formData.supplierShortName}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                placeholder="Enter short name"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Invoice No</label>
              <input
                type="text"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                placeholder="Enter invoice number"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Date</label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                placeholder="DD-MM-YY"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Weight of Material (kg)</label>
              <input
                type="number"
                name="weightOfMaterial"
                value={formData.weightOfMaterial}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                placeholder="Enter weight in kilograms"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Serial No</label>
              <input
                type="text"
                name="serialNo"
                value={formData.serialNo}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                placeholder="Enter serial number"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Fabric Type</label>
              <input
                type="text"
                name="fabricType"
                value={formData.fabricType}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                placeholder="e.g., Cotton, Polyester"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#0071bc] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Barcode
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFabric;