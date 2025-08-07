import { BrowserRouter, Routes, Route } from "react-router-dom";
import SuperAdminLogin from "./components/pages/SuperAdminLogin.jsx";
import SuperAdminDashboard from "./components/pages/SuperAdminDashboard.jsx";
import BranchLogin from "./components/pages/BranchLogin.jsx";
import BranchDashboard from "./components/pages/BranchDashboard.jsx";
import AdminLogin from "./components/pages/admin/AdminLogin.jsx";
import AdminDashboard from "./components/pages/admin/AdminDashboard.jsx";
import AddFabric from "./components/pages/admin/Fabric/AddFabric.jsx";


export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/branch/login" element={<BranchLogin />} />
        <Route path="/branch/dashboard" element={<BranchDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/fabric/add" element={<AddFabric />} />

      </Routes>
    </BrowserRouter>
  );
}
