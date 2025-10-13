import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ---------- SUPER ADMIN IMPORTS ----------
import SuperAdminLogin from "./components/pages/SuperAdminLogin.jsx";
import SuperAdminDashboard from "./components/pages/SuperAdminDashboard.jsx";
import AddBranch from "./components/pages/AddBranch.jsx";
import BranchDashboard from "./components/pages/BranchDashboard.jsx";

// ---------- ADMIN IMPORTS ----------
import AdminLogin from "./components/pages/admin/AdminLogin.jsx";
import AdminDashboard from "./components/pages/admin/AdminDashboard.jsx";
import AddFabric from "./components/pages/admin/Fabric/AddFabric.jsx";
import AddStaff from "./components/pages/admin/staff/addStaff.jsx";
import ViewOperation from "./components/pages/admin/products/ViewOperation.jsx";
import ViewAllProduct from "./components/pages/admin/products/viewAllProduct.jsx";
import AddProduct from "./components/pages/admin/products/AddProduct.jsx";
import ViewFabric from "./components/pages/admin/Fabric/ViewFabric.jsx";
import ViewStaff from "./components/pages/admin/staff/ViewStaff.jsx";
import AllSuppliar from "./components/pages/admin/Fabric/AllSuppliar.jsx";

// ---------- ADVANCE PAYMENT IMPORTS ----------
import MakePayment from "./components/pages/admin/advance_payment/MakePayment.jsx";
import AdvancePaymentView from "./components/pages/admin/advance_payment/AdvancePaymentView.jsx";

// ---------- CUTTING & WAGES IMPORTS ----------
import AddCutting from "./components/pages/admin/cutting/AddCutting.jsx";
import Range from "./components/pages/admin/cutting/Range.jsx";
import ViewCutting from "./components/pages/admin/cutting/ViewCutting.jsx";
import AddNewWages from "./components/pages/admin/wages/AddNewWages.jsx";
import ViewAllWages from "./components/pages/admin/wages/ViewAllWages.jsx";


// ---------- {/* ✅ New Job Worker route */} ----------
import CreateJobwoker from "./components/pages/admin/Job_Worker/Create_Job_worker.jsx";
import ListJobwoker from "./components/pages/admin/Job_Worker/List_Job_worker.jsx";
import ProductJobwoker from "./components/pages/admin/Job_Worker/Product_Price.jsx";
import ListProductJobwoker from "./components/pages/admin/Job_Worker/ViewJobWorkerProductEntriesPage.jsx";
import Jobwokerwages from "./components/pages/admin/Job_Worker/Create_Job_worker_wages.jsx";
import ViewJobWorkerEntries from "./components/pages/admin/Job_Worker/List_Job_worker_wages.jsx";

// ---------- DASHBOARD IMPORT ----------
import Dashboard from "./components/pages/admin/dashboard/Dashboard.jsx"; // 👈 Dashboard.jsx

// ---------- DEFAULT ADMIN HOME ----------
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
        {/* -------------------- DEFAULT ROOT PAGE -------------------- */}
        <Route path="/" element={<AdminLogin />} />

        {/* -------------------- SUPER ADMIN LOGIN -------------------- */}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/* -------------------- SUPER ADMIN DASHBOARD -------------------- */}
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />}>
          <Route path="branches/add" element={<AddBranch />} />
        </Route>

        {/* -------------------- BRANCH DASHBOARD -------------------- */}
        <Route path="/branch/dashboard" element={<BranchDashboard />} />

        {/* -------------------- ADMIN DASHBOARD WITH DYNAMIC BRANCH ID -------------------- */}
        <Route path="/admin/:branchId/dashboard" element={<AdminDashboard />}>
          {/* Default page */}
          <Route index element={<AdminHome />} />

          {/* 🧩 Dashboard Menu */}
          <Route path="view-report" element={<Dashboard />} />
          <Route path="business-summary" element={<div>Business Summary Coming Soon...</div>} />

          {/* 🧶 Fabric Routes */}
          <Route path="fabric/add" element={<AddFabric />} />
          <Route path="staff/add" element={<AddStaff />} />
          <Route path="staff/list" element={<ViewStaff />} />
          <Route path="fabric/view" element={<ViewFabric />} />
          <Route path="fabric/edit" element={<AllSuppliar />} />

          {/* 🧶 Product Routes */}
          <Route path="products/operations" element={<ViewOperation />} />
          <Route path="products/add-new" element={<AddProduct />} />
          <Route path="products/view-all" element={<ViewAllProduct />} />

          {/* 💰 Advance Payment */}
          <Route path="advance/new" element={<MakePayment />} />
          <Route path="advance/history" element={<AdvancePaymentView />} />

          {/* ✂ Cutting Entry */}
          <Route path="cutting/view-staff" element={<ViewCutting />} />
          <Route path="cutting/Add-Range" element={<Range />} />
          <Route path="cutting/add-staff" element={<AddCutting />} />

          {/* 🧾 Wages */}
          <Route path="wages/add" element={<AddNewWages />} />
          <Route path="wages/view" element={<ViewAllWages />} />

          {/* Job Worker route */}
          <Route path="job-worker/add" element={<CreateJobwoker />} />
          <Route path="job-worker/list" element={<ListJobwoker />} />
          <Route path="job-worker/product" element={<ProductJobwoker />} />
          <Route path="job-worker/product-list" element={<ListProductJobwoker />} />
          <Route path="job-worker/add-wages" element={<Jobwokerwages />} />
          <Route path="job-worker/list-wages" element={<ViewJobWorkerEntries />} />
        </Route>

        {/* -------------------- REDIRECT UNKNOWN ROUTES TO ADMIN LOGIN -------------------- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
