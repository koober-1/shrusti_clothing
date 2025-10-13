// AdminDashboard.jsx
import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { 
    FaSearch, FaBolt, FaUserCircle, FaTachometerAlt, FaIndustry, 
    FaTshirt, FaUsers, FaCut, FaMoneyBillWave, FaWallet, FaUserTie,
    FaChevronRight, FaChevronDown, FaSignOutAlt, FaUser 
} from 'react-icons/fa';

// ... (sidebarItems array remains the same)
const sidebarItems = [
    {
        label: 'Dashboard',
        icon: <FaTachometerAlt />,
        children: [
            { label: 'View Report', path: 'view-report' },
        ]
    },
    {
        label: 'Fabric Inward',
        icon: <FaIndustry />,
        children: [
            { label: 'View Fabric Stock', path: 'fabric/view' }, 
            { label: 'Add New', path: 'fabric/add' },
            { label: 'View All Suppliar', path: 'fabric/edit' },
        ]
    },
    {
        label: 'Product Entry',
        icon: <FaTshirt />,
        children: [
            { label: 'View all operation', path: 'products/operations' },
            { label: 'View all products', path: 'products/view-all' },
            { label: 'Add new product', path: 'products/add-new' },
        ]
    },
    {
        label: 'Staff Entry',
        icon: <FaUsers />,
        children: [
            { label: 'Add Staff', path: 'staff/add' },
            { label: 'Staff List', path: 'staff/list' },
        ]
    },
    {
        label: 'Cutting Entry',
        icon: <FaCut />,
        children: [
            { label: 'View All Entry', path: 'cutting/view-staff' },
            { label: 'Add Range', path: 'cutting/Add-Range' },
            { label: 'New Cutting Entry', path: 'cutting/add-staff' },
        ]
    },
    {
        label: 'Advance pay.',
        icon: <FaMoneyBillWave />,
        children: [
            { label: 'New Payment', path: 'advance/new' },
            { label: 'Payment History', path: 'advance/history' },
        ]
    },
    {
        label: 'New Wages',
        icon: <FaWallet />,
        children: [
            { label: 'View New Wages', path: 'wages/view' },
            { label: 'Add New Wages', path: 'wages/add' },
        ]
    },
    {
        label: 'Job Worker',
        icon: <FaUserTie />,
        children: [
            { label: 'View All Job Workers', path: 'job-worker/list' },
            { label: 'Add New Job Worker', path: 'job-worker/add' },
            // { label: 'Add Product Price', path: 'job-worker/product' },
            { label: 'Product Job Worker', path: 'job-worker/product-list' },
            // { label: 'Add Wages', path: 'job-worker/add-wages' },
            { label: 'Wages List', path: 'job-worker/list-wages' },
        ]
    },
];
// ... (sidebarItems array remains the same)

const AdminDashboard = () => {
    const [openSubmenu, setOpenSubmenu] = useState('Fabric Inward');
    const [showQuickActions, setShowQuickActions] = useState(false);
    // NEW STATE for User Dropdown
    const [showUserDropdown, setShowUserDropdown] = useState(false); 
    
    const navigate = useNavigate();
    const location = useLocation();
    const { branchId } = useParams();

    const handleMenuClick = (item) => {
        if (item.children) {
            setOpenSubmenu(openSubmenu === item.label ? '' : item.label);
        }
    };

    const handleSubMenuClick = (childItem) => {
        navigate(`/admin/${branchId}/dashboard/${childItem.path}`);
    };

    const handleQuickActionClick = (path) => {
        navigate(`/admin/${branchId}/dashboard/${path}`);
        setShowQuickActions(false);
    };

    // NEW FUNCTION for User Profile/Logout
    const handleLogout = () => {
        console.log("Logging out...");
        // ** Replace this with your actual logout logic (e.g., clearing tokens, global state)**
        navigate('/login'); // Assuming '/login' is your login route
    };

    // NEW FUNCTION for View Profile
    const handleViewProfile = () => {
        setShowUserDropdown(false);
        // Replace 'profile' with your actual profile route path
        navigate(`/admin/${branchId}/dashboard/profile`); 
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
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
                        const isParentActive = item.children?.some(child => location.pathname.includes(child.path));
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
                                            // Fixing child active state logic to check if path *ends* with child path
                                            const pathToCheck = `/admin/${branchId}/dashboard/${child.path}`;
                                            const isChildActive = location.pathname === pathToCheck;

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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-[#0071bc] text-white p-7 flex items-center justify-between">
                    {/* Search bar positioned to the left */}
                    <div className="relative flex items-center bg-black rounded-full p-1 w-64 mx-auto">
                        <input
                            type="text"
                            placeholder="Search here"
                            className="bg-black text-white pl-4 pr-10 py-1 outline-none rounded-full placeholder-gray-400 w-full"
                        />
                        <FaSearch className="absolute right-3 text-white" />
                    </div>

                    {/* Quick Actions and User Profile */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowQuickActions(!showQuickActions);
                                    setShowUserDropdown(false); // Close user dropdown when opening quick actions
                                }}
                                className="bg-white text-[#0071bc] flex items-center px-4 py-2 rounded-full text-sm font-semibold"
                            >
                                <FaBolt className="mr-1" /> Quick Actions
                            </button>
                            {showQuickActions && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                                    <button
                                        onClick={() => handleQuickActionClick('wages/add')}
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                    >
                                        Add New Wages
                                    </button>
                                    <button
                                        onClick={() => handleQuickActionClick('advance/new')}
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                    >
                                        New Advance Payment
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* User Profile Dropdown - FIX APPLIED HERE */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowUserDropdown(!showUserDropdown);
                                    setShowQuickActions(false); // Close quick actions when opening user dropdown
                                }}
                                className="focus:outline-none"
                            >
                                <FaUserCircle size={40} className='text-white' />
                            </button>
                            {showUserDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                                    <button
                                        onClick={handleViewProfile}
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center space-x-2"
                                    >
                                        <FaUser className="w-4 h-4" /> <span>View Profile</span>
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                                    >
                                        <FaSignOutAlt className="w-4 h-4" /> <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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