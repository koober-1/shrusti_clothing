import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';

// Helper function to get today's date in DD-MM-YY format
const getTodayDateDDMMYY = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

// Function to generate 10-digit unique number
const generateUniqueNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

const AddFabric = () => {
  const initialFormState = {
    uniqueNumber: '',
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

  // Auto-generate unique number on mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      uniqueNumber: generateUniqueNumber()
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.uniqueNumber) {
      alert("Unique Number not generated.");
      return;
    }
    setBarcodeData({
      value: formData.uniqueNumber,
      display: {
        supplierName: formData.supplierName,
        date: formData.date,
        fabricType: formData.fabricType,
        weightOfMaterial: formData.weightOfMaterial
      }
    });
  };

  const handleGenerateNew = () => {
    setBarcodeData(null);
    setFormData({
      ...initialFormState,
      uniqueNumber: generateUniqueNumber()
    });
  };

  // Barcode ticket view
  if (barcodeData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-[#0071bc] mb-4">Fabric Barcode Ticket</h2>

          <div className="text-left mb-4 p-4 border-dashed border-2 border-gray-300 rounded-lg space-y-1">
            <p><strong>Supplier:</strong> {barcodeData.display.supplierName}</p>
            <p><strong>Date:</strong> {barcodeData.display.date}</p>
            <p><strong>Fabric:</strong> {barcodeData.display.fabricType}</p>
            <p><strong>Weight:</strong> {barcodeData.display.weightOfMaterial} kg</p>
          </div>

          <div className="p-4 border rounded-lg inline-block bg-white">
            <Barcode value={barcodeData.value} height={80} width={2} displayValue={false} />
          </div>

          {/* Show the unique number under the barcode */}
          <p className="text-center font-mono text-lg mt-2 tracking-widest">
            {barcodeData.value}
          </p>

          <p className="text-gray-500 mt-4">This barcode contains the Unique Number.</p>
          <button onClick={handleGenerateNew} className="w-full mt-6 bg-[#0071bc] text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add Another Fabric
          </button>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-4">Add New Fabric</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

                       
            <div>
              <label className="block font-semibold text-gray-700">Supplier Name</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  name="supplierName" 
                  value={formData.supplierName} 
                  onChange={handleChange} 
                  className="flex-1 border border-gray-300 p-2 rounded" 
                  required 
                />
                <button
                  type="button"
                  onClick={() => alert("Add Supplier feature here")}
                  className="bg-[#0071bc] hover:bg-blue-600 text-white px-4 py-2 rounded"

                >
                  Add
                </button>
              </div>
            </div>


            <div>
              <label className="block font-semibold text-gray-700">Supplier Short Name</label>
              <input type="text" name="supplierShortName" value={formData.supplierShortName} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded" required />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Invoice No</label>
              <input type="text" name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded" required />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Date</label>
              <input type="text" name="date" value={formData.date} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded" required />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Weight of Material (kg)</label>
              <input type="number" name="weightOfMaterial" value={formData.weightOfMaterial} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded" required />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Serial No (Manual)</label>
              <input type="text" name="serialNo" value={formData.serialNo} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Fabric Type</label>
              <input type="text" name="fabricType" value={formData.fabricType} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded" required />
            </div>
            <button type="submit" className="w-full bg-[#0071bc] text-white px-4 py-2 rounded-lg">Generate Barcode</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFabric;
