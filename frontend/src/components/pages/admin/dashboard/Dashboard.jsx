import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCreditCard,
  FaCut,
  FaUsers,
  FaTshirt,
  FaFileInvoice,
  FaClipboardList,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useParams, useNavigate } from "react-router-dom"; 

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const { branchId } = useParams();
  const navigate = useNavigate(); 

  const [data, setData] = useState({
    totalAdvancePayment: 0,
    totalStaffWages: 0,
    totalCuttingWages: 0,
    totalStaff: 0,
    totalProduct: 0,
    totalJobWorkerSlip: 0,
  });

  const [cuttingData, setCuttingData] = useState([]);
  const [wagesData, setWagesData] = useState([]);

  const [fabricStock, setFabricStock] = useState({
    totalFabric: 0,
    usedFabric: 0,
    remainingFabric: 0,
    usedPercent: 0,
    remainingPercent: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function for API token and config
  const getConfig = () => {
    const token = localStorage.getItem("branchToken");
    if (!token) {
      setError("Authentication failed. Please log in.");
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // --- API Fetch Functions ---

  const fetchDashboardData = async () => {
    const config = getConfig();
    if (!config) return;

    try {
      const res = await axios.get(
        `${apiBaseUrl}/api/dashboard?branchId=${branchId}`,
        config
      );

      if (res.data.success) {
        const d = res.data.data;
        setData({
          totalAdvancePayment: parseFloat(d.totalAdvancePayment || 0).toFixed(2),
          totalStaffWages: parseInt(d.totalStaffWages || 0),
          totalCuttingWages: parseInt(d.totalCuttingWages || 0),
          totalStaff: parseInt(d.totalStaff || 0),
          totalProduct: parseInt(d.totalProduct || 0),
          totalJobWorkerSlip: parseInt(d.totalJobWorkerSlip || 0),
        });
      } else {
        setError("Failed to load dashboard data.");
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Error fetching dashboard data.");
    }
  };

  const fetchGraphData = async () => {
    const config = getConfig();
    if (!config) return;

    try {
      const res = await axios.get(`${apiBaseUrl}/api/dashboard/graph`, config);
      
      if (res.data.success) {
        setCuttingData(res.data.cutting || []);
        setWagesData(res.data.wages || []);
      }
    } catch (error) {
      console.error("Graph fetch error:", error);
    }
  };

  const fetchFabricStock = async () => {
    const config = getConfig();
    if (!config) return;

    try {
      const res = await axios.get(`${apiBaseUrl}/api/dashboard/fabric-stock`, config);
      if (res.data.success) {
        const data = res.data.data;
        const total = parseFloat(data.totalFabric);
        const used = parseFloat(data.usedFabric);
        const remaining = parseFloat(data.remainingFabric);

        const usedPercent = total > 0 ? ((used / total) * 100).toFixed(2) : 0;
        const remainingPercent = total > 0 ? ((remaining / total) * 100).toFixed(2) : 0;
        
        setFabricStock({
            ...data,
            totalFabric: total,
            usedFabric: used,
            remainingFabric: remaining,
            usedPercent: usedPercent,
            remainingPercent: remainingPercent,
        });
      }
    } catch (error) {
      console.error("Fabric stock fetch error:", error);
    }
  };

  // --- Effects and Handlers ---

  useEffect(() => {
    if (branchId) {
      setLoading(true);
      Promise.all([
        fetchDashboardData(),
        fetchGraphData(),
        fetchFabricStock()
      ]).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);


  const handleRefresh = () => {
    setLoading(true);
    Promise.all([
        fetchDashboardData(),
        fetchGraphData(),
        fetchFabricStock()
      ]).finally(() => setLoading(false));
  }

  const handleProductClick = () => {
      // NOTE: Using the current branchId to construct the required path.
      // If '5173' is a static tenant/app ID, it must be handled in your App Router.
      navigate(`/admin/${branchId}/dashboard/products/view-all`);
  }

  // --- Data for Rendering ---

  const pieData = [
    {
      name: `Used in Cutting (${fabricStock.usedPercent}%)`,
      value: fabricStock.usedFabric,
      color: "#10B981",
    },
    {
      name: `Remaining Stock (${fabricStock.remainingPercent}%)`,
      value: fabricStock.remainingFabric,
      color: "#EF4444",
    },
  ];

  const cards = [
    {
      title: "Total Advance Payment (Rs.)",
      value: `₹${data.totalAdvancePayment}`,
      color: "bg-red-600",
      icon: <FaCreditCard size={35} className="opacity-80" />,
      onClick: null,
    },
    {
      title: "Total Wages Entries",
      value: data.totalStaffWages,
      color: "bg-green-800",
      icon: <FaClipboardList size={35} className="opacity-80" />,
      onClick: null,
    },
    {
      title: "Total Cutting Entries",
      value: data.totalCuttingWages,
      color: "bg-blue-700",
      icon: <FaCut size={35} className="opacity-80" />,
      onClick: null,
    },
    {
      title: "Total Staff",
      value: data.totalStaff,
      color: "bg-red-900",
      icon: <FaUsers size={35} className="opacity-80" />,
      onClick: null,
    },
    {
      title: "Total Products",
      value: data.totalProduct,
      color: "bg-blue-600",
      icon: <FaTshirt size={35} className="opacity-80" />,
      onClick: handleProductClick, 
    },
    {
      title: "Total Job Worker Slips",
      value: data.totalJobWorkerSlip,
      color: "bg-purple-400",
      icon: <FaFileInvoice size={35} className="opacity-80" />,
      onClick: null,
    },
  ];

  // Get data length for dynamic width calculation
  const cuttingDataLength = cuttingData.length;
  const wagesDataLength = wagesData.length;

  // --- Component Render ---

  // Define constants for scrollable chart width calculation
  const MIN_CHART_WIDTH = 600; // Minimum width for a decent view
  const WIDTH_PER_DATA_POINT = 70; // Pixels per data point on the X-axis

  const cuttingChartWidth = Math.max(MIN_CHART_WIDTH, cuttingDataLength * WIDTH_PER_DATA_POINT);
  const wagesChartWidth = Math.max(MIN_CHART_WIDTH, wagesDataLength * WIDTH_PER_DATA_POINT);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-blue-700 font-semibold text-lg">
          Loading dashboard data...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {/* Header and Refresh Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {/* Overview Cards (Row 1 - Full Width) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} text-white rounded-xl shadow-lg p-4 flex justify-between items-center transition duration-300 hover:scale-[1.02] ${card.onClick ? 'cursor-pointer hover:shadow-xl' : ''}`}
            onClick={card.onClick} 
          >
            <div>
              <h2 className="text-sm font-medium">{card.title}</h2>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Fabric Stock (Row 2 - Full Width, Single Column) */}
      <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">Fabric Stock Overview</h2>
        <div className="flex flex-col md:flex-row items-center justify-around">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name.substring(0, name.indexOf('(')).trim()}: ${parseFloat(value).toFixed(2)} kg`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${parseFloat(value).toFixed(2)} kg`, name]}
              />
              <Legend layout="horizontal" align="center" verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 md:mt-0 md:ml-8 space-y-3 w-full md:w-1/2">
            <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Total Stock</p>
              <p className="text-xl font-bold text-gray-800">{fabricStock.totalFabric.toFixed(2)} kg</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg shadow-sm">
              <p className="text-sm text-green-700">Used in Cutting</p>
              <p className="text-xl font-bold text-green-800">{fabricStock.usedFabric.toFixed(2)} kg</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg shadow-sm">
              <p className="text-sm text-red-700">Remaining Stock</p>
              <p className="text-xl font-bold text-red-800">{fabricStock.remainingFabric.toFixed(2)} kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts (Row 3 - Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cutting Chart (Left Column) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Cutting Entries (Scrollable)</h2>
          {cuttingData.length > 0 ? (
            <div style={{ overflowX: 'auto' }}> {/* Added scroll container */}
              <LineChart width={cuttingChartWidth} height={300} data={cuttingData}> {/* Removed ResponsiveContainer, set dynamic width */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value} pcs`, "Pieces"]}
                  labelFormatter={(dateStr) => new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                />
                <Legend />
                
                <Line
                  type="monotone"
                  dataKey="total_pieces"
                  stroke="#1E90FF"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Cutting Pieces"
                />
              </LineChart>
            </div>
          ) : (
            <p className="text-center text-gray-500 h-[300px] flex items-center justify-center">No cutting data available.</p>
          )}
        </div>

        {/* Wages Chart (Right Column) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Wages Entries (Scrollable)</h2>
          {wagesData.length > 0 ? (
            <div style={{ overflowX: 'auto' }}> {/* Added scroll container */}
              <LineChart width={wagesChartWidth} height={300} data={wagesData}> {/* Removed ResponsiveContainer, set dynamic width */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value} pcs`, "Pieces"]}
                  labelFormatter={(dateStr) => new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                />
                <Legend />
                
                <Line
                  type="monotone"
                  dataKey="total_pieces"
                  stroke="#32CD32"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Wages Pieces"
                />
              </LineChart>
            </div>
          ) : (
            <p className="text-center text-gray-500 h-[300px] flex items-center justify-center">No wages data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;