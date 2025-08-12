import React, { useState } from 'react'; // useState hook import kiya gaya hai
import { FaEdit } from 'react-icons/fa';

const OperationsTable = () => {
  const [isAdding, setIsAdding] = useState(false); // Add form dikhane ke liye state
  const [isEditing, setIsEditing] = useState(null); // Edit form dikhane ke liye state (null ya editing item ka sNo)

  const operations = [
    { sNo: 1, name: 'Cutting' },
    { sNo: 2, name: 'Singer' },
    { sNo: 3, name: 'Overlock' },
    { sNo: 4, name: 'Flatlock' },
  ];

  const handleAddOperation = () => {
    setIsAdding(true); // Add form ko show karega
    setIsEditing(null); // Agar koi form edit ho raha hai, to use hide karega
  };

  const handleEditOperation = (sNo) => {
    setIsEditing(sNo); // Edit form ko show karega aur sNo ko set karega
    setIsAdding(false); // Agar add form dikh raha hai, to use hide karega
  };
  
  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
  };
  
  // Placeholder components for the forms
  const AddOperationForm = () => (
    <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-2">Add New Operation</h3>
      {/* Yahaan par aapka form input elements aayenge */}
      <input type="text" placeholder="Operation Name" className="border p-2 rounded w-full mb-2" />
      <div className="flex gap-2">
        <button className="bg-[#6a053c] text-white py-2 px-4 rounded">Save</button>
        <button onClick={handleCancel} className="bg-gray-500 text-white py-2 px-4 rounded">Cancel</button>
      </div>
    </div>
  );

  const EditOperationForm = ({ sNo }) => {
    const operationToEdit = operations.find(op => op.sNo === sNo);
    return (
      <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <h3 className="text-lg font-bold mb-2">Edit Operation {sNo}</h3>
        <input 
          type="text" 
          defaultValue={operationToEdit.name} // defaultValue ka use kiya gaya hai
          className="border p-2 rounded w-full mb-2"
        />
        <div className="flex gap-2">
          <button className="bg-blue-500 text-white py-2 px-4 rounded">Update</button>
          <button onClick={handleCancel} className="bg-gray-500 text-white py-2 px-4 rounded">Cancel</button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0071bc] p-6 rounded-lg shadow-lg">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddOperation}
          className="bg-[#6a053c] text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-[#6a053c] transition duration-200"
        >
          Add Operation
        </button>
      </div>

      {/* Conditional rendering: Agar isAdding true hai, to AddOperationForm dikhega */}
      {isAdding && <AddOperationForm />}
      
      {/* Conditional rendering: Agar isEditing mein sNo hai, to EditOperationForm dikhega */}
      {isEditing && <EditOperationForm sNo={isEditing} />}

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border border-gray-200">
          {/* ... table headers (thead) same rahenge ... */}
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-center border-b">S. No.</th>
              <th className="py-3 px-6 text-left border-b">Operation Name</th>
              <th className="py-3 px-6 text-center border-b">Edit Operation</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {operations.map((op, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-center whitespace-nowrap border-r">{op.sNo}</td>
                <td className="py-3 px-6 text-left border-r">{op.name}</td>
                <td className="py-3 px-6 text-center">
                  <button onClick={() => handleEditOperation(op.sNo)} className="text-gray-500 hover:text-blue-500">
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperationsTable;