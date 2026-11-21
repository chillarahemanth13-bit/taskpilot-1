import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import UserCard from "../../components/UserCard";
import axiosInstance from "../../utils/axioInstance";
import toast from "react-hot-toast";
import { FaFileExcel } from "react-icons/fa6";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/users/get-users");
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleExportUsers = async () => {
    try {
      const response = await axiosInstance.get("/reports/export/users", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Users report downloaded");
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export report");
    }
  };

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              View all registered users and their workload distribution
            </p>
          </div>

          <button
            onClick={handleExportUsers}
            className="flex items-center space-x-2 px-4 py-2 border border-green-600 text-green-700 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors cursor-pointer self-start sm:self-auto"
            title="Download Users Excel Report"
          >
            <FaFileExcel className="text-base text-green-600" />
            <span>Export Users</span>
          </button>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl h-40 p-6 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-base font-medium">
              No team members registered yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard key={user._id} userInfo={user} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
