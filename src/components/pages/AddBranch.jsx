// src/components/pages/AddBranch.jsx
import React, { useState } from "react";

export default function AddBranch() {
  const [formData, setFormData] = useState({
    branchName: "",
    branchAddress: "",
    gst: "",
    mobile: "",
    confirmMobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Branch Data:", formData);
    alert("Branch added successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-6">Add Branch</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Branch Name */}
        <div>
          <label className="block font-medium">Branch Name</label>
          <input
            type="text"
            name="branchName"
            value={formData.branchName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Branch Address */}
        <div>
          <label className="block font-medium">Branch Address</label>
          <textarea
            name="branchAddress"
            value={formData.branchAddress}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          ></textarea>
        </div>

        {/* GST */}
        <div>
          <label className="block font-medium">GST Number</label>
          <input
            type="text"
            name="gst"
            value={formData.gst}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block font-medium">Mobile Number</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Confirm Mobile */}
        <div>
          <label className="block font-medium">Confirm Mobile Number</label>
          <input
            type="tel"
            name="confirmMobile"
            value={formData.confirmMobile}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block font-medium">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold"
        >
          Add Branch
        </button>
      </form>
    </div>
  );
}
