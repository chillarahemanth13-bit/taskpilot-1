import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/DashboardLayout";
import Progress from "../../components/Progress";
import axiosInstance from "../../utils/axioInstance";
import { STATUS_DATA } from "../../utils/data";
import toast from "react-hot-toast";
import moment from "moment";
import {
  FaArrowLeft,
  FaCheck,
  FaPaperclip,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaUser,
  FaTasks,
} from "react-icons/fa";

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [togglingTodoIndex, setTogglingTodoIndex] = useState(null);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/tasks/${id}`);
      if (response.data) {
        setTask(response.data);
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error(error.response?.data?.message || "Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!task || task.status === newStatus) return;

    try {
      setUpdatingStatus(true);
      const response = await axiosInstance.put(`/tasks/${id}/status`, {
        status: newStatus,
      });

      if (response.data?.task) {
        setTask(response.data.task);
      } else {
        setTask((prev) => ({ ...prev, status: newStatus }));
      }

      toast.success("Task status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleToggleTodo = async (index) => {
    if (!task?.todoChecklist) return;

    const updatedChecklist = task.todoChecklist.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );

    try {
      setTogglingTodoIndex(index);
      const response = await axiosInstance.put(`/tasks/${id}/todo`, {
        todoChecklist: updatedChecklist,
      });

      if (response.data?.task) {
        setTask(response.data.task);
      } else {
        const completedCount = updatedChecklist.filter((t) => t.completed).length;
        const total = updatedChecklist.length;
        const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        setTask((prev) => ({
          ...prev,
          todoChecklist: updatedChecklist,
          progress,
        }));
      }

      toast.success("Checklist item updated");
    } catch (error) {
      console.error("Error updating checklist:", error);
      toast.error(error.response?.data?.message || "Failed to update item");
    } finally {
      setTogglingTodoIndex(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const handleBack = () => {
    if (currentUser?.role === "admin") {
      navigate("/admin/tasks");
    } else {
      navigate("/user/tasks");
    }
  };

  const activeMenu = currentUser?.role === "admin" ? "Manage Task" : "My Tasks";

  if (loading) {
    return (
      <DashboardLayout activeMenu={activeMenu}>
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="bg-white p-6 rounded-xl space-y-4 animate-pulse border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout activeMenu={activeMenu}>
        <div className="p-6 max-w-5xl mx-auto text-center py-16">
          <h2 className="text-xl font-bold text-gray-800">Task Not Found</h2>
          <p className="text-gray-500 mt-2">
            The task you are looking for does not exist or you don't have access.
          </p>
          <button
            onClick={handleBack}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const completedChecklistCount =
    task.todoChecklist?.filter((item) => item.completed)?.length || 0;
  const totalChecklistCount = task.todoChecklist?.length || 0;

  return (
    <DashboardLayout activeMenu={activeMenu}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Back and Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium w-fit cursor-pointer"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to Tasks</span>
          </button>

          <div className="flex items-center space-x-3">
            <label className="text-xs text-gray-500 font-medium">
              Update Status:
            </label>
            <select
              value={task.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-sm font-medium border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-800 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
            >
              {STATUS_DATA.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Task Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityBadge(
                task.priority
              )}`}
            >
              {task.priority || "Low"} Priority
            </span>

            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                task.status
              )}`}
            >
              {task.status}
            </span>

            {task.dueDate && (
              <span className="flex items-center text-xs text-gray-500 ml-auto space-x-1.5">
                <FaCalendarAlt className="text-gray-400" />
                <span>Due {moment(task.dueDate).format("MMM DD, YYYY")}</span>
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {task.title}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-3 leading-relaxed whitespace-pre-wrap">
              {task.description || "No description provided."}
            </p>
          </div>

          {/* Progress Section */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Overall Progress</span>
              <span className="font-semibold text-blue-600">
                {task.progress ?? 0}%
              </span>
            </div>
            <Progress progress={task.progress ?? 0} status={task.status} />
          </div>
        </div>

        {/* 2-Column Grid: Checklist & Meta Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checklist (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FaTasks className="text-blue-600 text-sm" />
                <h3 className="font-semibold text-gray-800 text-base">
                  Action Items Checklist
                </h3>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {completedChecklistCount} of {totalChecklistCount} completed
              </span>
            </div>

            {totalChecklistCount === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                No checklist items for this task.
              </p>
            ) : (
              <div className="space-y-2.5">
                {task.todoChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleTodo(idx)}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                      item.completed
                        ? "bg-gray-50/70 border-gray-200"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-xs"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center border transition-colors ${
                        item.completed
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {item.completed && <FaCheck className="text-xs" />}
                    </div>
                    <span
                      className={`text-sm flex-1 leading-snug ${
                        item.completed
                          ? "line-through text-gray-400"
                          : "text-gray-700 font-medium"
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Assigned Team & Attachments */}
          <div className="space-y-6">
            {/* Assigned Users Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                <FaUser className="text-blue-600 text-sm" />
                <h3 className="font-semibold text-gray-800 text-base">
                  Assigned Team
                </h3>
              </div>

              {!task.assignedTo || task.assignedTo.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">
                  No team members assigned yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {task.assignedTo.map((user) => (
                    <div key={user._id || user} className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-blue-200">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt={user.name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{(user.name || "U")[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {user.name || "Member"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email || ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                <FaPaperclip className="text-blue-600 text-sm" />
                <h3 className="font-semibold text-gray-800 text-base">
                  Attachments ({task.attachment?.length || 0})
                </h3>
              </div>

              {!task.attachment || task.attachment.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">No attachments.</p>
              ) : (
                <div className="space-y-2">
                  {task.attachment.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 text-blue-600 text-sm transition-colors group"
                    >
                      <span className="truncate pr-2 font-medium">
                        {link.length > 35 ? `${link.substring(0, 32)}...` : link}
                      </span>
                      <FaExternalLinkAlt className="text-xs text-gray-400 group-hover:text-blue-600 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TaskDetails;
