import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/TaskCard";
import axiosInstance from "../../utils/axioInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const MyTask = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

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
      console.error("Error fetching my tasks:", error);
      toast.error("Failed to load your tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(activeTab);
  }, [activeTab]);

  const tabs = [
    { label: "All", count: statusSummary?.all || 0 },
    { label: "Pending", count: statusSummary?.pendingTasks || 0 },
    { label: "In Progress", count: statusSummary?.inprogressTasks || 0 },
    { label: "Completed", count: statusSummary?.completedTasks || 0 },
  ];

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            View, track progress, and complete your assigned tasks
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-1">
          <TaskStatusTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Tasks Grid */}
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
              No tasks found for "{activeTab}".
            </p>
            <p className="text-sm text-gray-400 mt-1">
              You will see assignments here when a task is assigned to you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
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
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTask;
