import React from "react";

export const SizeDetailsModal = ({ show, onClose, data }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-center">Size-wise Details</h2>
        <div className="max-h-96 overflow-y-auto">
          {typeof data === "object" ? (
            Object.entries(data).map(([size, qty]) => (
              <p key={size} className="mb-1">
                <span className="font-medium">{size}:</span> {qty}
              </p>
            ))
          ) : (
            <p>{data}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};
