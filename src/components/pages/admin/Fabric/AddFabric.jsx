// src/pages/admin/Fabric/AddFabric.jsx
import React, { useState } from 'react';

const AddFabric = () => {
  
  const [formData, setFormData] = useState({
    supplierName: '',
    supplierShortName: '',
    invoiceNo: '',
    date: '',
    weightOfMaterial: '', 
    serialNo: '',         
    fabricType: '',       
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);

    // TODO: Backend post request here
    // axios.post('/api/fabric', formData)
    //   .then(...)
    //   .catch(...)
  };

  return (
    <div className="min-h-screen bg-gray-100 p-7">
      
      {/* The main container with max-width and center alignment */}
      <div className="max-w-2xl mx-auto">
        
        {/* Header is now inside this container, so its width is controlled */}
        <div className="flex justify-center items-center bg-[#0071bc] text-white p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">Add New Fabric</h2>
        </div>

        {/* The form container */}
        <div className="bg-white shadow p-6 rounded-b-lg">
          <form onSubmit={handleSubmit} className="space-y-4">

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
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700">Weight of Material</label>
              <input
                type="number"
                name="weightOfMaterial"
                value={formData.weightOfMaterial}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                placeholder="Enter weight of material"
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
                placeholder="Enter fabric type"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0071bc] text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFabric;