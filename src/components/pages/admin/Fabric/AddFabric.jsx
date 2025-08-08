import React, { useState } from 'react';
import { QRCode } from 'react-qr-code'; // Barcode ki jagah QR code import kiya hai

// Helper function to get today's date in DD-MM-YY format
const getTodayDateDDMMYY = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

const AddFabric = () => {
  // Form data ke liye state
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
  // State ka naam QR code ke hisab se badal diya hai
  const [qrCodeData, setQrCodeData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 10-digit ka unique number generate karna
  const handleGenerateUniqueNumber = () => {
    const uniqueId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setFormData(prev => ({ ...prev, uniqueNumber: uniqueId }));
  };

  // Naye supplier ko add karne ke liye function (Placeholder)
  const handleAddNewSupplier = () => {
    // Yahan par aap naye supplier ko add karne ke liye modal open kar sakte hain
    alert('Naya supplier add karne ke liye yahan logic likhein (e.g., open a modal).');
  };

  // Form submit par QR code banana
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const qrValue = formData.uniqueNumber;

    if (!qrValue) {
      alert("Please generate a Unique Number first.");
      return;
    }

    // QR code value aur display ke liye extra data save karna
    setQrCodeData({ 
      value: qrValue, // QR code is value se banega
      display: {
        supplierName: formData.supplierName,
        date: formData.date,
        fabricType: formData.fabricType,
        weightOfMaterial: formData.weightOfMaterial
      }
    });
  };

  const handleGenerateNew = () => {
    setQrCodeData(null);
    setFormData(initialFormState);
  };

  // QR Code ticket view
  if (qrCodeData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-[#0071bc] mb-4">Fabric QR Code Ticket</h2>
          
          {/* QR code ke upar details dikhane ke liye section */}
          <div className="text-left mb-4 p-4 border-dashed border-2 border-gray-300 rounded-lg space-y-1">
            <p><strong>Supplier:</strong> {qrCodeData.display.supplierName}</p>
            <p><strong>Date:</strong> {qrCodeData.display.date}</p>
            <p><strong>Fabric:</strong> {qrCodeData.display.fabricType}</p>
            <p><strong>Weight:</strong> {qrCodeData.display.weightOfMaterial} kg</p>
          </div>

          {/* QR Code box */}
          <div className="p-4 border rounded-lg inline-block bg-white">
            <QRCode 
              value={qrCodeData.value} 
              size={160} // QR code ka size
            />
          </div>
          {/* QR code ke neeche 10 digit ka number */}
          <p className="text-center font-mono text-lg mt-2 tracking-widest">
            {qrCodeData.value}
          </p>

          <p className="text-gray-500 mt-4">This QR code contains the Unique Number.</p>
          <button onClick={handleGenerateNew} className="w-full mt-6 bg-[#0071bc] text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add Another Fabric
          </button>
        </div>
      </div>
    );
  }

  // Default form view
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-4">Add New Fabric</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Unique Number section */}
            <div>
              <label className="block font-semibold text-gray-700">Unique Number</label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  name="uniqueNumber"
                  value={formData.uniqueNumber}
                  readOnly
                  className="w-full border border-gray-300 p-2 rounded bg-gray-200 focus:outline-none"
                  placeholder="Click Generate"
                />
                <button
                  type="button"
                  onClick={handleGenerateUniqueNumber}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Supplier Name section with Add button */}
            <div>
              <label className="block font-semibold text-gray-700">Supplier Name</label>
              <div className="flex items-center space-x-2 mt-1">
                <input 
                    type="text" 
                    name="supplierName" 
                    value={formData.supplierName} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-2 rounded" 
                    placeholder="Enter supplier name"
                    required 
                />
                <button
                  type="button"
                  onClick={handleAddNewSupplier}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg whitespace-nowrap hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Baaki ke form fields */}
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
            <button type="submit" className="w-full bg-[#0071bc] text-white px-4 py-2 rounded-lg">Generate QR Code</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFabric;