import React, { useState, useEffect, useRef } from 'react';
import Barcode from 'react-barcode';

// आज की तारीख DD-MM-YY फॉर्मेट में प्राप्त करने के लिए हेल्पर फंक्शन
const getTodayDateDDMMYY = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`; // Updated to use / as separator
};

// 10-अंकों का यूनिक नंबर जनरेट करने के लिए फंक्शन
const generateUniqueNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// मुख्य कंपोनेंट जो फॉर्म और बारकोड व्यू को डिस्प्ले करता है
export default function App() {
  // पूरे रसीद कंटेनर का संदर्भ (reference) प्राप्त करने के लिए useRef hook का उपयोग
  const receiptRef = useRef(null);
  const barcodeRef = useRef(null); // बारकोड SVG का संदर्भ प्राप्त करने के लिए

  const [formData, setFormData] = useState({
    uniqueNumber: '',
    supplierName: '',
    supplierShortName: '',
    invoiceNo: '',
    date: getTodayDateDDMMYY(),
    weightOfMaterial: '',
    fabricType: '',
  });
  const [barcodeData, setBarcodeData] = useState(null);
  const [weightError, setWeightError] = useState('');
  const [dateError, setDateError] = useState('');

  // माउंट होने पर यूनिक नंबर ऑटो-जनरेट करें
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      uniqueNumber: generateUniqueNumber()
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // तारीख (date) फ़ील्ड के लिए विशेष हैंडलिंग
    if (name === 'date') {
      const sanitizedValue = value.replace(/[^0-9]/g, ''); // सिर्फ़ नंबर रखें
      let formattedValue = '';
      if (sanitizedValue.length > 0) {
        formattedValue += sanitizedValue.substring(0, 2);
      }
      if (sanitizedValue.length > 2) {
        formattedValue += '/' + sanitizedValue.substring(2, 4);
      }
      if (sanitizedValue.length > 4) {
        formattedValue += '/' + sanitizedValue.substring(4, 6);
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.uniqueNumber) {
      console.error("Unique Number not generated.");
      return;
    }

    // वजन के लिए अपडेटेड वैलिडेशन: दशमलव के साथ या बिना दशमलव के नंबर स्वीकार करें
    const weightRegex = /^\d+(\.\d+)?$/;
    if (!weightRegex.test(formData.weightOfMaterial)) {
      setWeightError('Please enter a valid weight (e.g., 5, 5.25)');
      return;
    } else {
      setWeightError('');
    }

    // तारीख के लिए वैलिडेशन
    const dateRegex = /^\d{2}\/\d{2}\/\d{2}$/;
    if (!dateRegex.test(formData.date)) {
        setDateError('Please enter a valid date in DD/MM/YY format.');
        return;
    } else {
        setDateError('');
    }

    setBarcodeData({
      value: formData.uniqueNumber,
      display: {
        supplierName: formData.supplierName,
        date: formData.date,
        fabricType: formData.fabricType,
        invoiceNo: formData.invoiceNo,
        weightOfMaterial: formData.weightOfMaterial,
        supplierShortName: formData.supplierShortName
      }
    });
  };

  const handleGenerateNew = () => {
    setBarcodeData(null);
    setFormData({
      uniqueNumber: generateUniqueNumber(),
      supplierName: '',
      supplierShortName: '',
      invoiceNo: '',
      date: getTodayDateDDMMYY(),
      weightOfMaterial: '',
      fabricType: '',
    });
    setWeightError('');
    setDateError('');
  };

  // पूरे रसीद सेक्शन को प्रिंट करने के लिए नया फंक्शन
  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printContents = `<div style="padding: 20px; font-family: Inter, sans-serif;">${printContent.innerHTML}</div>`;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore the original page
    }
  };

  // पूरे रसीद सेक्शन को PNG इमेज के रूप में डाउनलोड करने के लिए अपडेट किया गया फंक्शन
  const handleDownload = () => {
    if (!barcodeData) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const padding = 20;
    const width = 400; // आपके डिज़ाइन के अनुसार चौड़ाई
    const height = 250; // आपके डिज़ाइन के अनुसार ऊँचाई
    canvas.width = width;
    canvas.height = height;

    // सफेद बैकग्राउंड ड्रॉ करें
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // टेक्स्ट ड्रॉ करें
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Receipt', width / 2, 30);

    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(barcodeData.display.date, padding, 60);

    ctx.textAlign = 'right';
    const year = barcodeData.display.date.slice(-2);
    const formattedId = `${barcodeData.display.supplierShortName}-${barcodeData.display.invoiceNo}-${year}`;
    ctx.fillText(formattedId, width - padding, 60);

    ctx.textAlign = 'left';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Supplier: ${barcodeData.display.supplierName}`, padding, 90);
    ctx.fillText(`Invoice No.: ${barcodeData.display.invoiceNo}`, padding, 110);
    ctx.fillText(`Fabric type: ${barcodeData.display.fabricType}`, width / 2 + padding, 90);
    ctx.fillText(`Weight: ${barcodeData.display.weightOfMaterial} kg`, width / 2 + padding, 110);

    // SVG बारकोड को इमेज में बदलें और Canvas पर ड्रॉ करें
    const barcodeSvgElement = barcodeRef.current.querySelector('svg');
    if (barcodeSvgElement) {
        const svgString = new XMLSerializer().serializeToString(barcodeSvgElement);
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.drawImage(img, width/2 - img.width/2, 120); // बारकोड को केंद्र में ड्रॉ करें

          ctx.font = '20px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(barcodeData.value, width / 2, 220); // बारकोड नंबर को बारकोड के नीचे ड्रॉ करें

          // डाउनलोड के लिए Canvas को PNG में बदलें
          const link = document.createElement('a');
          link.download = `receipt_${formData.uniqueNumber}.png`;
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(svgUrl);
        };
        img.src = svgUrl;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans antialiased bg-gray-100 text-white">
      {/* Main content area containing the form */}
      <main className="max-w-xl w-full mx-auto">
        {barcodeData ? (
          // Barcode ticket view based on new image
          <div className="flex flex-col items-center justify-center p-4">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={handleDownload}
                className="bg-[#6a053c] hover:bg-[#800040] text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Download
              </button>
              <button
                onClick={handlePrint}
                className="bg-[#6a053c] hover:bg-[#800040] text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Print
              </button>
            </div>

            {/* Download और Print के लिए पूरे रसीद कंटेनर का संदर्भ (reference) लें */}
            <div className="max-w-md w-full bg-[#0071bc] shadow-lg rounded-3xl p-6">
              <h2 className="text-xl text-center text-white font-bold mb-4">Receipt</h2>
              <div ref={receiptRef} className="bg-white rounded-3xl p-6 flex flex-col justify-between items-center h-full">

                {
                  (() => {
                    const year = formData.date.slice(-2);
                    const formattedId = `${formData.supplierShortName}-${formData.invoiceNo}-${year}`;
                    return (
                      <div className="text-gray-900 text-sm w-full">
                        {/* Date और formatted ID को एक ही लाइन में रखें */}
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-bold">{formData.date}</p>
                          <p className="font-bold text-lg">{formattedId}</p>
                        </div>
                        {/* डेटा को कॉम्पैक्ट ग्रिड लेआउट में व्यवस्थित करें */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4">
                          <p><strong>Supplier:</strong> {formData.supplierName}</p>
                          <p><strong>Fabric type:</strong> {formData.fabricType}</p>
                          <p><strong>Invoice No.:</strong> {formData.invoiceNo}</p>
                          <p><strong>Weight:</strong> {formData.weightOfMaterial} kg</p>
                        </div>
                      </div>
                    );
                  })()
                }

                {/* बारकोड और नंबर के बीच की दूरी कम करें */}
                <div ref={barcodeRef} className="flex flex-col items-center mt-6">
                  <div className="p-2">
                    <Barcode value={barcodeData.value} height={60} width={2} displayValue={false} />
                  </div>
                  <p className="text-center font-mono text-xl text-gray-900 tracking-widest">
                    {barcodeData.value}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateNew}
              className="mt-8 bg-[#0071bc] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add Another Fabric
            </button>
          </div>
        ) : (
          // Form view
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="w-full bg-[#0071bc] shadow-lg rounded-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Supplier full name */}
                <div className="space-y-1">
                  <label className="block text-white font-semibold">Supplier full name</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={handleChange}
                      placeholder="dropdown"
                      className="flex-1 bg-white border border-[#004a79] p-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0071bc]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => console.log("Add Supplier button clicked")}
                      className="bg-[#6a053c] hover:bg-[#800040] text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Supplier short name */}
                <div className="space-y-1">
                  <label className="block text-white font-semibold">Supplier short name</label>
                  <input
                    type="text"
                    name="supplierShortName"
                    value={formData.supplierShortName}
                    onChange={handleChange}
                    placeholder="autofill via dropdown"
                    className="w-full bg-white border border-[#004a79] p-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0071bc]"
                    required
                  />
                </div>

                {/* Invoice Number */}
                <div className="space-y-1">
                  <label className="block text-white font-semibold">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNo"
                    value={formData.invoiceNo}
                    onChange={handleChange}
                    placeholder="Input"
                    className="w-full bg-white border border-[#004a79] p-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0071bc]"
                    required
                  />
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="block text-white font-semibold">Date</label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="dd/mm/yy"
                    className={`w-full bg-white border p-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0071bc] ${dateError ? 'border-red-500' : 'border-[#004a79]'}`}
                    maxLength="8" // DD/MM/YY = 8 chars
                    required
                  />
                  {dateError && <p className="text-red-400 text-sm mt-1">{dateError}</p>}
                </div>

                {/* Weight of Material */}
                <div className="space-y-1">
                  <label className="block text-white font-semibold">Weight of material (kg)</label>
                  <input
                    type="text"
                    name="weightOfMaterial"
                    value={formData.weightOfMaterial}
                    onChange={handleChange}
                    placeholder="Input Number (e.g., 5, 5.45)"
                    className={`w-full bg-white border p-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0071bc] ${weightError ? 'border-red-500' : 'border-[#004a79]'}`}
                    required
                  />
                  {weightError && <p className="text-red-400 text-sm mt-1">{weightError}</p>}
                </div>

                {/* Fabric type */}
                <div className="space-y-1">
                  <label className="block text-white font-semibold">Fabric type</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="fabricType"
                      value={formData.fabricType}
                      onChange={handleChange}
                      placeholder="Dropdown"
                      className="flex-1 bg-white border border-[#004a79] p-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0071bc]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => console.log("Add Supplier button clicked")}
                      className="bg-[#6a053c] hover:bg-[#800040] text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Submit button with gradient style */}
                <button
                  type="submit"
                  className="w-full text-white font-bold py-2 px-4 rounded-xl transition-all"
                  style={{
                    background: 'linear-gradient(to right, #facc15, #eab308)', // Yellow gradient
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
