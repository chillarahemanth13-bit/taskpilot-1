import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/TaskCard";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/DeleteAlert";
import axiosInstance from "../../utils/axioInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaFileExcel } from "react-icons/fa6";

const ManageTask = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const fetchTasks = async (status = "All") => {
    try {
      setLoading(true);
      const params = {};
      if (status !== "All") {
        params.status = status;
      }

      const response = await axiosInstance.get("/tasks", { params });

      if (response.data) {
        setTasks(response.data.tasks || []);
        setStatusSummary(response.data.statusSummary || {});
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(activeTab);
  }, [activeTab]);

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await axiosInstance.delete(`/tasks/${taskToDelete._id}`);
      toast.success("Task deleted successfully");
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchTasks(activeTab);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  };

  const handleExportTasks = async () => {
    try {
      const response = await axiosInstance.get("/reports/export/tasks", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "tasks_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Tasks report downloaded");
    } catch (error) {
      console.error("Error exporting tasks:", error);
      toast.error("Failed to export report");
    }
  };

  const tabs = [
    { label: "All", count: statusSummary?.all || 0 },
    { label: "Pending", count: statusSummary?.pendingTasks || 0 },
    { label: "In Progress", count: statusSummary?.inprogressTasks || 0 },
    { label: "Completed", count: statusSummary?.completedTasks || 0 },
  ];

  return (
    <DashboardLayout activeMenu="Manage Task">
      <div className="p-6 space-y-6">
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Manage Tasks</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Review, filter, and manage your team's assignments
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportTasks}
              className="flex items-center space-x-2 px-4 py-2 border border-green-600 text-green-700 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              title="Download Excel Report"
            >
              <FaFileExcel className="text-base text-green-600" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => navigate("/admin/create-task")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
            >
              <FaPlus className="text-xs" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-1">
          <TaskStatusTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Task Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl h-56 p-6 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-base font-medium">
              No tasks found for "{activeTab}" status.
            </p>
            <button
              onClick={() => navigate("/admin/create-task")}
              className="mt-4 px-4 py-2 text-sm text-blue-600 font-medium hover:underline cursor-pointer"
            >
              Create a new task &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task._id} className="relative group">
                <TaskCard
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  status={task.status}
                  progress={task.progress}
                  createdAt={task.createdAt}
                  dueDate={task.dueDate}
                  assignedTo={task.assignedTo || []}
                  attachmentCount={task.attachment?.length || 0}
                  completedTodoCount={task.completedCount || 0}
                  todoChecklist={task.todoChecklist || []}
                  onClick={() => navigate(`/user/task-details/${task._id}`)}
                />

                {/* Quick Delete Action Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTaskToDelete(task);
                    setDeleteModalOpen(true);
                  }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-xs text-red-500 bg-red-50 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded-md transition-all shadow-sm cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Task"
      >
        <DeleteAlert
          content={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
          onDelete={handleDeleteTask}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default ManageTask;
