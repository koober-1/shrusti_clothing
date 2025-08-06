import React from 'react';
import { FaSearch, FaBolt, FaUserCircle } from 'react-icons/fa';
import {
  FaTachometerAlt,
  FaIndustry,
  FaCogs,
  FaTshirt,
  FaUsers,
  FaCut,
  FaMoneyBillWave,
  FaWallet,
  FaUserTie,
} from 'react-icons/fa';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold tracking-widest">
            <span className="text-white">SHRUSTI</span>
            <br />
            <span className="text-sm font-normal tracking-wide">CLOTHING</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-3 text-sm">
          <SidebarItem icon={<FaTachometerAlt />} label="Dashboard" />
          <SidebarItem icon={<FaIndustry />} label="Fabric (IN)" />
          <SidebarItem icon={<FaCogs />} label="Machine Entry" />
          <SidebarItem icon={<FaTshirt />} label="Product Entry" />
          <SidebarItem icon={<FaUsers />} label="Staff Entry" />
          <SidebarItem icon={<FaCut />} label="Cutting Entry" />
          <SidebarItem icon={<FaMoneyBillWave />} label="Advance pay." />
          <SidebarItem icon={<FaWallet />} label="New Wages" />
          <SidebarItem icon={<FaUserTie />} label="Job Worker" />
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#0071bc] text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search here"
                className="rounded-full pl-4 pr-10 py-1 text-black outline-none"
              />
              <FaSearch className="absolute right-3 top-1.5 text-black" />
            </div>
            <button className="bg-white text-[#0071bc] flex items-center px-3 py-1 rounded-full text-sm font-semibold">
              <FaBolt className="mr-1" /> Quick Actions
            </button>
          </div>
          <FaUserCircle size={32} />
        </header>

        {/* Main section */}
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-center mb-8">Demo</h1>
          {/* Demo Chart Placeholder */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6 flex justify-center">
              <img src="/demo-chart.png" alt="Demo Chart" className="w-full h-auto" />
              {/* Replace with a real chart component or canvas later */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label }) => (
  <div className="flex items-center space-x-2 hover:bg-gray-800 p-2 rounded cursor-pointer">
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);

export default AdminDashboard;
