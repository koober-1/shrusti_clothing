// src/pages/BranchDashboard.jsx

import React, { useState } from 'react';

const BranchDashboard = () => {
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <img src="/logo.png" alt="Logo" className="w-32 mx-auto" />
        </div>

        {/* Menu Options */}
        <nav className="flex flex-col p-4 gap-4">
          <button
            className="text-left hover:text-blue-400"
            onClick={() => setShowDrawer(true)}
          >
            ➕ Add New Branch
          </button>
          <button className="text-left hover:text-blue-400">📋 Show All Branches</button>
          <button className="text-left hover:text-blue-400">❌ Delete Branch</button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#0071bc] text-white p-4 text-2xl font-bold shadow-md">
          Branch Management
        </header>

        {/* Page Content */}
        <main className="p-6">
          <h2 className="text-xl">Welcome to Branch Management</h2>
        </main>
      </div>

      {/* Drawer Form */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1" onClick={() => setShowDrawer(false)}></div>
          <div className="w-[400px] bg-[#0071bc] text-white p-6 overflow-y-auto shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Add New Branch</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Branch Name" className="w-full p-2 rounded text-black" />
              <input type="text" placeholder="Branch Address" className="w-full p-2 rounded text-black" />
              <input type="text" placeholder="GST Number" className="w-full p-2 rounded text-black" />
              <input type="text" placeholder="Mobile Number" className="w-full p-2 rounded text-black" />
              <input type="text" placeholder="Email address" className="w-full p-2 rounded text-black" />
              <input type="text" placeholder="Alternate Number" className="w-full p-2 rounded text-black" />
              <input type="password" placeholder="Password" className="w-full p-2 rounded text-black" />
              <input type="password" placeholder="Confirm Password" className="w-full p-2 rounded text-black" />
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                Save Branch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchDashboard;
