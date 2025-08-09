import { BrowserRouter, Routes, Route } from "react-router-dom";
import SuperAdminLogin from "./components/pages/SuperAdminLogin.jsx";
import SuperAdminDashboard from "./components/pages/SuperAdminDashboard.jsx";
import AddBranch from "./components/pages/AddBranch.jsx"; // ✅ sahi import
import BranchDashboard from "./components/pages/BranchDashboard.jsx"; // ✅ add kiya

import AdminLogin from "./components/pages/admin/AdminLogin.jsx";
import AdminDashboard from "./components/pages/admin/AdminDashboard.jsx";
import AddFabric from "./components/pages/admin/Fabric/AddFabric.jsx";
import AddStaff from "./components/pages/admin/staff/addStaff.jsx";


const AdminHome = () => (
  <div style={{ padding: "2rem", textAlign: "center", color: "#555" }}>
    <h2>Welcome to Admin Panel</h2>
    <p>Please select an option from the sidebar to get started.</p>
  </div>
);

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        {/* FULL PAGE ROUTES */}
        <Route path="/" element={<SuperAdminLogin />} />

        {/* SUPER ADMIN DASHBOARD with nested routes */}
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />}>
          <Route path="branches/add" element={<AddBranch />} />
        </Route>

        {/* Branch */}
        <Route path="/branch/dashboard" element={<BranchDashboard />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Dashboard with nested routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />}>
          <Route index element={<AdminHome />} />
          <Route path="fabric/add" element={<AddFabric />} />
          <Route path="staff/add" element={<AddStaff />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
