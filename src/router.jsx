import { BrowserRouter, Routes, Route } from "react-router-dom";
import SuperAdminLogin from "./components/pages/SuperAdminLogin.jsx";
import SuperAdminDashboard from "./components/pages/SuperAdminDashboard.jsx";
import BranchLogin from "./components/pages/BranchLogin.jsx";
import BranchDashboard from "./components/pages/BranchDashboard.jsx";
import AdminLogin from "./components/pages/admin/AdminLogin.jsx";

// Admin Dashboard ke Pages
import AdminDashboard from "./components/pages/admin/AdminDashboard.jsx";
import AddFabric from "./components/pages/admin/Fabric/AddFabric.jsx";
// NOTE: Apne sidebar ke baaki pages bhi yahan import kar lein

// Ek simple component jo dashboard ke home (white area) par default mein dikhega
const AdminHome = () => (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>
        <h2>Welcome to Admin Panel</h2>
        <p>Please select an option from the sidebar to get started.</p>
    </div>
);

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- YE ROUTES WAISE HI RAHENGE (FULL PAGE ROUTES) --- */}
        <Route path="/" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/branch/login" element={<BranchLogin />} />
        <Route path="/branch/dashboard" element={<BranchDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* --- YAHAN BADLAV KIYA GAYA HAI --- */}
        {/* AdminDashboard ab ek parent (layout) route ban gaya hai */}
        <Route path="/admin/dashboard" element={<AdminDashboard />}>
            
            {/* 'index' route tab dikhega jab URL सिर्फ /admin/dashboard hoga */}
            <Route index element={<AdminHome />} />
            
            {/* Ab saare admin pages iske andar child routes banenge */}
            {/* Dhyan dein, path mein '/admin/dashboard' dobara nahi likhna hai */}
            <Route path="fabric/add" element={<AddFabric />} />
            
            {/* Aapke sidebar ke baaki sabhi items ke liye routes yahan add karein.
              For example:
              <Route path="fabric/view" element={<ViewFabricStock />} />
              <Route path="products/add" element={<AddProduct />} />
            */}

        </Route>
      </Routes>
    </BrowserRouter>
  );
}