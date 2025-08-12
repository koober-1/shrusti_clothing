import React, { useState } from 'react';

const AddProductForm = () => {
  const [productName, setProductName] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [operations, setOperations] = useState([
    { name: 'Cutting', rate: '' },
    { name: 'Singer', rate: '' },
    { name: 'Flatlock', rate: '' },
  ]);

  const handleOperationChange = (index, e) => {
    const { name, value } = e.target;
    const newOperations = [...operations];
    newOperations[index][name] = value;
    setOperations(newOperations);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      productName,
      fabricType,
      operations,
    });
    // You would typically send this data to a backend server here
    alert('Form Submitted! Check the console for the data.');

    // Reset form fields
    setProductName('');
    setFabricType('');
    setOperations([
      { name: 'Cutting', rate: '' },
      { name: 'Singer', rate: '' },
      { name: 'Flatlock', rate: '' },
    ]);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 p-4">
      <div className="bg-[#0071bc] text-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name Input */}
          <div>
            <label htmlFor="productName" className="block text-lg font-medium mb-1">
              Product name
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full p-3 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Input"
              required
            />
          </div>

          {/* Select Fabric Type Dropdown */}
          <div>
            <label htmlFor="fabricType" className="block text-lg font-medium mb-1">
              Select Fabric Type
            </label>
            <select
              id="fabricType"
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              className="w-full p-3 rounded-xl bg-white text-black appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="" disabled hidden>
                Dropdown
              </option>
              <option value="Cotton">Cotton</option>
              <option value="Polyester">Polyester</option>
              <option value="Wool">Wool</option>
            </select>
          </div>

          {/* Operations and Rates Section */}
          <div>
            <h3 className="text-lg font-medium mb-2">Enter product Operation with Rate</h3>
            <div className="space-y-4">
              {operations.map((op, index) => (
                <div key={index} className="flex space-x-4 items-center">
                  <input
                    type="text"
                    name="name"
                    value={op.name}
                    onChange={(e) => handleOperationChange(index, e)}
                    className="w-1/2 p-3 rounded-xl bg-white text-black text-center focus:outline-none cursor-not-allowed"
                    readOnly
                  />
                  <input
                    type="number"
                    name="rate"
                    value={op.rate}
                    onChange={(e) => handleOperationChange(index, e)}
                    className="w-1/2 p-3 rounded-xl bg-white text-black text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Rate (RS.)"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-[#4b003a] text-white font-bold text-lg hover:bg-[#6c0054] transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;