import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signOutSuccess } from "../redux/slice/userSlice";
import {
  FaThLarge,
  FaTasks,
  FaPlusCircle,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";

const DashboardLayout = ({ children, activeMenu = "Dashboard" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(signOutSuccess());
    navigate("/login");
  };

  const isAdmin = currentUser?.role === "admin";

  const menuItems = isAdmin
    ? [
        { name: "Dashboard", path: "/admin/dashboard", icon: <FaThLarge /> },
        { name: "Manage Tasks", path: "/admin/tasks", icon: <FaTasks /> },
        { name: "Create Task", path: "/admin/create-task", icon: <FaPlusCircle /> },
        { name: "Manage Users", path: "/admin/users", icon: <FaUsers /> },
      ]
    : [
        { name: "Dashboard", path: "/user/dashboard", icon: <FaThLarge /> },
        { name: "My Tasks", path: "/user/tasks", icon: <FaTasks /> },
      ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <FaPeopleGroup className="text-xl" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-800">
              TaskPilot
            </span>
          </Link>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeMenu === item.name;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <FaBars className="text-lg" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 ml-2 lg:ml-0">
              {activeMenu}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {currentUser?.profileImageUrl ? (
                <img
                  src={currentUser.profileImageUrl}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : <FaUser />}
                </div>
              )}
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-sm font-medium text-gray-800">
                  {currentUser?.name || "User"}
                </p>
                <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold tracking-wide">
                  {currentUser?.role || "Member"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-gray-500 hover:text-red-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
