import React, { useState } from "react";

const AddStaff = () => {
  const initialFormState = {
    fullName: "",
    operation: "",
    overlockOperator: "",
    aadharNumber: "",
    panNumber: "",
    aadharFront: null,
    aadharBack: null,
    panCardImage: null,
    photo: null,
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Staff Data:", formData);
    alert("Staff Added Successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-4">Add New Staff</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-gray-700">
                Staff Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>

            {/* Operation */}
            <div>
              <label className="block font-semibold text-gray-700">
                Select Operation
              </label>
              <select
                name="operation"
                value={formData.operation}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              >
                <option value="">-- Select Operation --</option>
                <option value="Singer">Singer</option>
                <option value="Overlock">Overlock</option>
                <option value="Helper">Helper</option>
              </select>
            </div>

            {/* Conditional Overlock Operator */}
            {formData.operation === "Singer" && (
              <div>
                <label className="block font-semibold text-gray-700">
                  Assign Overlock Operator
                </label>
                <input
                  type="text"
                  name="overlockOperator"
                  value={formData.overlockOperator}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
            )}

            {/* Aadhar Number */}
            <div>
              <label className="block font-semibold text-gray-700">
                Aadhar Number
              </label>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>

            {/* Pan Number */}
            <div>
              <label className="block font-semibold text-gray-700">
                PAN Number
              </label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>

            {/* Aadhar Front Image */}
            <div>
              <label className="block font-semibold text-gray-700">
                Aadhar Front Image
              </label>
              <label className="inline-block bg-[#0071bc] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
                Choose from Gallery / Desktop
                <input
                  type="file"
                  name="aadharFront"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* Aadhar Back Image */}
            <div>
              <label className="block font-semibold text-gray-700">
                Aadhar Back Image
              </label>
              <label className="inline-block bg-[#0071bc] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
                Choose from Gallery / Desktop
                <input
                  type="file"
                  name="aadharBack"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* PAN Card Image */}
            <div>
              <label className="block font-semibold text-gray-700">
                PAN Card Image
              </label>
              <label className="inline-block bg-[#0071bc] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
                Choose from Gallery / Desktop
                <input
                  type="file"
                  name="panCardImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* Upload Photo */}
            <div>
              <label className="block font-semibold text-gray-700">
                Upload Photo
              </label>
              <label className="inline-block bg-[#0071bc] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
                Choose from Gallery / Desktop
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* Submit Button */}
            <button
                 type="submit"
                className="w-full bg-[#0071bc] text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStaff;
