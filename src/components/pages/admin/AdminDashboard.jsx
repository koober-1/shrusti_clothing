import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom'; // <-- useLocation add kiya
import { 
    FaSearch, FaBolt, FaUserCircle, FaTachometerAlt, FaIndustry, 
    FaTshirt, FaUsers, FaCut, FaMoneyBillWave, FaWallet, FaUserTie,
    FaChevronRight, FaChevronDown 
} from 'react-icons/fa';

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
      { label: 'View Fabric Stock', path: '/admin/dashboard/fabric/view' }, 
      { label: 'Add New', path: '/admin/dashboard/fabric/add' },
    ]
  },
 {
    label: 'Product Entry',
    icon: <FaTshirt />,
    children: [
      { label: 'View all operation', path: '/admin/dashboard/products/operations' },
      { label: 'View all products', path: '/admin/dashboard/products/view-all' },
      { label: 'Add new product', path: '/admin/dashboard/products/add-new' },
    ]
  },
  {
    label: 'Staff Entry',
    icon: <FaUsers />,
    children: [
      { label: 'Add Staff', path: '/admin/dashboard/staff/add' },
      { label: 'Staff List', path: '/admin/dashboard/staff/list' },
      /* { label: 'Attendance', path: '/admin/dashboard/staff/attendance' }, */
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
  const [openSubmenu, setOpenSubmenu] = useState('Fabric Inward');
  const navigate = useNavigate();
  const location = useLocation(); // <-- current route path milta hai

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenSubmenu(openSubmenu === item.label ? '' : item.label);
    }
  };

  const handleSubMenuClick = (childItem) => {
    navigate(childItem.path);
  };

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
          {sidebarItems.map((item, index) => {
            // Agar koi child ka path current location se match kare to parent active
            const isParentActive = item.children?.some(child => location.pathname === child.path);
            return (
              <React.Fragment key={index}>
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  onClick={() => handleMenuClick(item)}
                  isSelected={isParentActive || openSubmenu === item.label}
                  isSubmenuOpen={openSubmenu === item.label}
                  hasSubmenu={!!item.children}
                />
                {item.children && openSubmenu === item.label && (
                  <div className="pl-8 text-sm flex flex-col space-y-1 my-1">
                    {item.children.map((child, childIndex) => {
                      const isChildActive = location.pathname === child.path;
                      return (
                        <button
                          key={childIndex}
                          onClick={() => handleSubMenuClick(child)}
                          className={`text-left p-2 rounded transition-colors duration-200 
                            ${isChildActive 
                              ? 'bg-[#0071bc] text-white' 
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
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

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, onClick, isSelected, hasSubmenu, isSubmenuOpen }) => (
  <div
    className={`flex items-center justify-between space-x-2 p-2 rounded cursor-pointer transition-colors duration-200 
               ${isSelected ? 'bg-[#0071bc] text-white' : 'text-gray-400 hover:bg-gray-800'}`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-2">
      <span>{icon}</span>
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
