import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [selectedSection, setSelectedSection] = useState('Dashboard');
  const navigate = useNavigate();

  const handleButtonClick = (section, buttonLabel) => {
    if (section === "Fabric Inward" && buttonLabel === "Add New Fabric") {
      navigate("/admin/fabric/add");
    }
    if (section === "Cutting Entry" && buttonLabel === "Add New Staff") {
      // navigate("/admin/cutting/add-staff");
    }
  };

  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'Dashboard':
        return (
          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6 flex justify-center">
              <img src="https://placehold.co/800x400/e2e8f0/000000?text=Demo+Chart" alt="Demo Chart" className="w-full h-auto" />
            </div>
          </div>
        );
      case 'Product Entry':
        return (
          <Section title="Product Entry" buttons={['Add Product', 'View Products', 'Update Stock']} onButtonClick={handleButtonClick} />
        );
      case 'Staff Entry':
        return (
          <Section title="Staff Entry" buttons={['Add Staff', 'Staff List', 'Attendance']} onButtonClick={handleButtonClick} />
        );
      case 'Advance pay.':
        return (
          <Section title="Advance Payment" buttons={['New Payment', 'Payment History']} onButtonClick={handleButtonClick} />
        );
      case 'Fabric Inward':
        return (
          <Section
            title="Fabric Inward"
            buttons={['Add New Fabric', 'View Fabric Stock', 'Return Fabric']}
            onButtonClick={handleButtonClick}
          />
        );
      case 'Cutting Entry':
        return (
          <Section title="Cutting Entry" buttons={['Add New Staff', 'View All Staff']} onButtonClick={handleButtonClick} />
        );
      case 'Job Worker':
        return (
          <Section title="Job Worker" buttons={['View All job Worker', 'Add New Job Worker', 'Assign Slip']} onButtonClick={handleButtonClick} />
        );
      case 'New Wages':
        return (
          <Section title="New Wages" buttons={['View New Wages', 'Add New Wages']} onButtonClick={handleButtonClick} />
        );
      default:
        return <div className="text-center text-gray-500">Select a section</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 flex flex-col bg-black text-white">
        <div className="bg-black h-24 p-6 flex items-center space-x-2 border-b border-gray-700">
          <img src="/Shrusti_logo.png" alt="Company Logo" className="h-10 w-40" />

        {/*   <h1 className="text-white">
            <span className="text-xl font-bold tracking-widest block">YOUR BRAND</span>
            <span className="text-xs font-normal tracking-wide block">TAGLINE</span>
          </h1> */}
        </div>
        <nav className="flex-1 space-y-2 py-4 px-2">
          <SidebarItem icon={<FaTachometerAlt />} label="Dashboard" onClick={setSelectedSection} isSelected={selectedSection === 'Dashboard'} />
          <SidebarItem icon={<FaIndustry />} label="Fabric Inward" onClick={setSelectedSection} isSelected={selectedSection === 'Fabric Inward'} />
          {/* <SidebarItem icon={<FaCogs />} label="Machine Entry" onClick={setSelectedSection} isSelected={selectedSection === 'Machine Entry'} /> */}
          <SidebarItem icon={<FaTshirt />} label="Product Entry" onClick={setSelectedSection} isSelected={selectedSection === 'Product Entry'} />
          <SidebarItem icon={<FaUsers />} label="Staff Entry" onClick={setSelectedSection} isSelected={selectedSection === 'Staff Entry'} />
          <SidebarItem icon={<FaCut />} label="Cutting Entry" onClick={setSelectedSection} isSelected={selectedSection === 'Cutting Entry'} />
          <SidebarItem icon={<FaMoneyBillWave />} label="Advance pay." onClick={setSelectedSection} isSelected={selectedSection === 'Advance pay.'} />
          <SidebarItem icon={<FaWallet />} label="New Wages" onClick={setSelectedSection} isSelected={selectedSection === 'New Wages'} />
          <SidebarItem icon={<FaUserTie />} label="Job Worker" onClick={setSelectedSection} isSelected={selectedSection === 'Job Worker'} />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-[#0071bc] text-white p-7 flex items-center justify-between">
          <div className="flex-1 flex justify-center items-center">
            <div className="relative flex items-center bg-black rounded-full p-1 w-64">
              <input
                type="text"
                placeholder="Search here"
                className="bg-black text-white pl-4 pr-10 py-1 outline-none rounded-full placeholder-gray-400 w-full"
              />
              <FaSearch className="absolute right-3 text-white" />
            </div>
            <button className="bg-white text-[#0071bc] flex items-center px-4 py-2 rounded-full text-sm font-semibold ml-4">
              <FaBolt className="mr-1" /> Quick Actions
            </button>
          </div>
          <FaUserCircle size={40} className='text-white ml-4' />
        </header>

        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-center mb-8">{selectedSection}</h1>
          {renderSectionContent()}
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, onClick, isSelected }) => (
  <div
    className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors duration-200 
                ${isSelected ? 'bg-[#0071bc] text-white' : 'text-gray-400 hover:bg-gray-800'}`}
    onClick={() => onClick(label)}
  >
    <span className={`${isSelected ? 'text-white' : 'text-gray-400'}`}>{icon}</span>
    <span className="font-semibold">{label}</span>
  </div>
);

const Section = ({ title, buttons, onButtonClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {buttons.map((btn, idx) => (
      <button
        key={idx}
        className="bg-white shadow rounded p-4 text-center font-semibold hover:bg-blue-100 transition"
        onClick={() => onButtonClick && onButtonClick(title, btn)}
      >
        {btn}
      </button>
    ))}
  </div>
);

export default AdminDashboard;
