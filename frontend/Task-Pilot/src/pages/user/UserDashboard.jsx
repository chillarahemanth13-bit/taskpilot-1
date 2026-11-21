import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/DashboardLayout";
import axiosInstance from "../../utils/axioInstance";
import moment from "moment";
import RecentTasks from "../../components/RecentTasks";
import CustomPieChart from "../../components/CustomPieChart";
import CustomBarChart from "../../components/CustomBarChart";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56"];

const UserDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || {};
    const taskPriorityLevels =
      data?.taskprioritylevel || data?.taskPriorityLevel || {};

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ];

    setPieChartData(taskDistributionData);

    const priorityLevelData = [
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
    ];

    setBarChartData(priorityLevelData);
  };

  const fetchUserDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/tasks/user-dashboard-data");

      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (error) {
      console.error("Error fetching user dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDashboardData();
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 shadow-md text-white">
          <h2 className="text-2xl md:text-3xl font-bold">
            Welcome back, {currentUser?.name || "Member"}!
          </h2>
          <p className="text-blue-100 mt-1">
            {moment().format("dddd, MMMM Do YYYY")}
          </p>
        </div>

        {/* User Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
            <h3 className="text-gray-500 text-sm font-medium">Assigned Tasks</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {dashboardData?.statistics?.totaltasks || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
            <h3 className="text-gray-500 text-sm font-medium">Pending Tasks</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {dashboardData?.statistics?.pendingTasks || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-cyan-500">
            <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {dashboardData?.statistics?.inProgressTasks || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
            <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {dashboardData?.statistics?.completedTasks || 0}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              My Task Distribution
            </h3>
            <div className="h-64">
              <CustomPieChart data={pieChartData} colors={COLORS} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              My Task Priorities
            </h3>
            <div className="h-64">
              <CustomBarChart data={barChartData} />
            </div>
          </div>
        </div>

        {/* Recent Tasks List */}
        <RecentTasks tasks={dashboardData?.recentTasks || []} />
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
