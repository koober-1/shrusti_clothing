import React, { useState } from 'react';
// --- BADLAV 1: Outlet ko import karna hai ---
import { useNavigate, Outlet } from 'react-router-dom';
import { 
    FaSearch, FaBolt, FaUserCircle, FaTachometerAlt, FaIndustry, 
    FaTshirt, FaUsers, FaCut, FaMoneyBillWave, FaWallet, FaUserTie,
    FaChevronRight, FaChevronDown 
} from 'react-icons/fa';

// --- BADLAV 2: Routes.js se match karne ke liye paths ko theek karna ---
const sidebarItems = [
  {
    label: 'Dashboard',
    icon: <FaTachometerAlt />,
    children: [
      { label: 'View Report', path: '/admin/dashboard/view-report' },
      { label: 'Business Summary', path: '/admin/dashboard/business-summary' },
    ]
  },
  {
    label: 'Fabric Inward',
    icon: <FaIndustry />,
    children: [
      { label: 'View Fabric Stock', path: '/admin/dashboard/fabric/add' },
      { label: 'Add New', path: '/admin/dashboard/fabric/view' },
    ]
  },
  {
    label: 'Product Entry',
    icon: <FaTshirt />,
    children: [
      { label: 'Add Product', path: '/admin/dashboard/products/add' },
      { label: 'View Products', path: '/admin/dashboard/products/view' },
      { label: 'Update Stock', path: '/admin/dashboard/products/stock' },
    ]
  },
  {
    label: 'Staff Entry',
    icon: <FaUsers />,
    children: [
      { label: 'Add Staff', path: '/admin/dashboard/staff/add' },
      { label: 'Staff List', path: '/admin/dashboard/staff/list' },
      { label: 'Attendance', path: '/admin/dashboard/staff/attendance' },
    ]
  },
  {
    label: 'Cutting Entry',
    icon: <FaCut />,
    children: [
      { label: 'Add New Staff', path: '/admin/dashboard/cutting/add-staff' },
      { label: 'View All Staff', path: '/admin/dashboard/cutting/view-staff' },
    ]
  },
  {
    label: 'Advance pay.',
    icon: <FaMoneyBillWave />,
    children: [
      { label: 'New Payment', path: '/admin/dashboard/advance/new' },
      { label: 'Payment History', path: '/admin/dashboard/advance/history' },
    ]
  },
  {
    label: 'New Wages',
    icon: <FaWallet />,
    children: [
      { label: 'View New Wages', path: '/admin/dashboard/wages/view' },
      { label: 'Add New Wages', path: '/admin/dashboard/wages/add' },
    ]
  },
  {
    label: 'Job Worker',
    icon: <FaUserTie />,
    children: [
      { label: 'View All Job Workers', path: '/admin/dashboard/job-worker/view' },
      { label: 'Add New Job Worker', path: '/admin/dashboard/job-worker/add' },
      { label: 'Assign Slip', path: '/admin/dashboard/job-worker/assign' },
    ]
  },
];


const AdminDashboard = () => {
  // --- BADLAV 3: activeMenu state ki ab zaroorat nahi hai ---
  const [openSubmenu, setOpenSubmenu] = useState('Fabric Inward'); // Default khula rakh sakte hain
  const navigate = useNavigate();

  // Menu item (parent) par click karne se sirf submenu khulega/band hoga
  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenSubmenu(openSubmenu === item.label ? '' : item.label);
    }
  };
  
  // Submenu item (child) par click karne se sirf navigation hoga
  const handleSubMenuClick = (childItem) => {
    navigate(childItem.path);
  };

  // --- BADLAV 4: renderSectionContent function ki ab zaroorat nahi ---

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 flex flex-col bg-black text-white">
        {/* Sidebar Header */}
        <div className="bg-black h-24 p-6 flex items-center space-x-2 border-b border-gray-700">
          <img src="/Shrusti_logo.png" alt="Company Logo" className="h-15 w-15" />
          <h1 className="text-white text-center">
            <span className="text-3xl font-bold tracking-widest block">Shrusti</span>
            <span className="text-xl font-normal tracking-wide block -mt-1">clothing</span>
          </h1>
        </div>
        {/* Sidebar Navigation */}
        <nav className="flex-1 py-4 px-2">
          {sidebarItems.map((item, index) => (
            <React.Fragment key={index}>
              <SidebarItem
                icon={item.icon}
                label={item.label}
                onClick={() => handleMenuClick(item)}
                isSelected={openSubmenu === item.label}
                isSubmenuOpen={openSubmenu === item.label}
                hasSubmenu={!!item.children}
              />
              {item.children && openSubmenu === item.label && (
                <div className="pl-8 text-sm flex flex-col space-y-1 my-1">
                  {item.children.map((child, childIndex) => (
                    <button
                      key={childIndex}
                      onClick={() => handleSubMenuClick(child)}
                      className="text-gray-400 hover:text-white text-left p-2 rounded hover:bg-gray-800 transition-colors duration-200"
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#0071bc] text-white p-7 flex items-center justify-between">
          <div className="flex-1 flex justify-center items-center">
            <div className="relative flex items-center bg-black rounded-full p-1 w-64">
              <input type="text" placeholder="Search here" className="bg-black text-white pl-4 pr-10 py-1 outline-none rounded-full placeholder-gray-400 w-full" />
              <FaSearch className="absolute right-3 text-white" />
            </div>
            <button className="bg-white text-[#0071bc] flex items-center px-4 py-2 rounded-full text-sm font-semibold ml-4">
              <FaBolt className="mr-1" /> Quick Actions
            </button>
          </div>
          <FaUserCircle size={40} className='text-white ml-4' />
        </header>

        {/* --- BADLAV 5 (Sabse Zaroori): Yahan Outlet Aayega --- */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// SidebarItem component mein koi badlav nahi
const SidebarItem = ({ icon, label, onClick, isSelected, hasSubmenu, isSubmenuOpen }) => (
  <div
    className={`flex items-center justify-between space-x-2 p-2 rounded cursor-pointer transition-colors duration-200 
               ${isSelected ? 'bg-[#0071bc] text-white' : 'text-gray-400 hover:bg-gray-800'}`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-2">
      <span className={`${isSelected ? 'text-white' : 'text-gray-400'}`}>{icon}</span>
      <span className="font-semibold">{label}</span>
    </div>
    {hasSubmenu && (
      <span className="transition-transform duration-200">
        {isSubmenuOpen ? <FaChevronDown /> : <FaChevronRight />}
      </span>
    )}
  </div>
);

export default AdminDashboard;