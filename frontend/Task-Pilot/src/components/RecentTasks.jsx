import React from "react";
import moment from "moment";

const RecentTasks = ({ tasks = [] }) => {
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Tasks</h3>

      {!tasks || tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No tasks found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-medium">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Due Date</th>
                <th className="pb-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 font-medium text-gray-800">
                    {task.title}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority || "Low"}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-500">
                    {task.dueDate
                      ? moment(task.dueDate).format("MMM DD, YYYY")
                      : "—"}
                  </td>
                  <td className="py-3.5 text-gray-400 text-xs">
                    {task.createdAt
                      ? moment(task.createdAt).fromNow()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentTasks;
