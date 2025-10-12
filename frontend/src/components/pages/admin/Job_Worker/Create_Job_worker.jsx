import React, { useState } from "react";
import axios from "axios";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const AddJobWorker = () => {
  const initialFormState = {
    fullName: "",
    aadharNumber: "",
    panNumber: "",
    mobileNumber: "",
    fullUnitAddress: "",
    aadharFront: null,
    aadharBack: null,
    panCardImage: null,
    photo: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [resetKey, setResetKey] = useState(Date.now());
  const [photoPreview, setPhotoPreview] = useState(null);

  // Handle field changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      if (name === "photo") setPhotoPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    for (const key in formData) {
      dataToSend.append(key, formData[key] || "");
    }

    try {
      await axios.post(`${apiBaseUrl}/api/job-worker/add-worker`, dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("branchToken")}`,
        },
      });

      alert("Job Worker added successfully!");
      setFormData(initialFormState);
      setResetKey(Date.now());
      setPhotoPreview(null);
    } catch (err) {
      console.error("Error:", err);
      const msg =
        err.response?.data?.error || "Failed to add Job Worker. Try again.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#0071bc]">
          Add Job Worker
        </h2>

        <form key={resetKey} onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
                maxLength={10}
                pattern="[0-9]{10}"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Aadhar Number</label>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
                maxLength={12}
                pattern="[0-9]{12}"
              />
            </div>

            <div>
              <label className="block font-semibold">PAN Number</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                className="w-full border p-2 rounded-md uppercase"
                maxLength={10}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold">Full Unit Address</label>
              <textarea
                name="fullUnitAddress"
                value={formData.fullUnitAddress}
                onChange={handleChange}
                className="w-full border p-2 rounded-md"
                rows={3}
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="p-6 border rounded-lg bg-gray-50 flex flex-col items-center">
            <h3 className="font-semibold mb-2">Worker Photo (Required)</h3>
            <div className="w-40 h-40 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center overflow-hidden mb-3">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">Upload Photo</span>
              )}
            </div>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
              required
            />
          </div>

          {/* Document Uploads */}
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="font-bold mb-4">Document Uploads</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["aadharFront", "aadharBack", "panCardImage"].map((field) => (
                <div key={field}>
                  <label className="block font-semibold">
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type="file"
                    name={field}
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#0071bc] text-white px-4 py-2 rounded-lg hover:bg-[#005b96]"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJobWorker;
