import Task from "../models/task.model.js";
import exceljs from "exceljs";
import User from "../models/user.model.js";

export const exportTaskReport = async (req, res, next) => {
    try {
        const tasks = await Task.find().populate("assignedTo", "name email");
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");

        worksheet.columns = [
            { header: "Task Id", key: "_id", width: 25 },
            { header: "Title", key: "title", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Priority", key: "priority", width: 15 },
            { header: "Status", key: "status", width: 20 },
            { header: "DueDate", key: "dueDate", width: 25 },
            { header: "Assigned To", key: "assignedTo", width: 30 },
        ];

        tasks.forEach((task) => {
            const assignedTo = (task.assignedTo || [])
                .map((user) => `${user.name} (${user.email})`)
                .join(", ");

            worksheet.addRow({
                _id: task._id.toString(),
                title: task.title,
                description: task.description || "",
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
                assignedTo: assignedTo || "unassigned",
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="tasks_report.xlsx"'
        );

        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        next(error);
    }
};

export const exportUsersReport = async (req, res, next) => {
    try {
        const users = await User.find().select("name email _id").lean();
        const userTasks = await Task.find().populate("assignedTo", "name email _id");

        const userTaskMap = {};

        users.forEach((user) => {
            userTaskMap[user._id.toString()] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTask: 0,
                inprogressTask: 0,
                completedTask: 0,
            };
        });

        userTasks.forEach((task) => {
            if (task.assignedTo && Array.isArray(task.assignedTo)) {
                task.assignedTo.forEach((assignedUser) => {
                    const userId = assignedUser._id ? assignedUser._id.toString() : assignedUser.toString();
                    if (userTaskMap[userId]) {
                        userTaskMap[userId].taskCount += 1;

                        if (task.status === "Pending") {
                            userTaskMap[userId].pendingTask += 1;
                        } else if (task.status === "In Progress") {
                            userTaskMap[userId].inprogressTask += 1;
                        } else if (task.status === "Completed") {
                            userTaskMap[userId].completedTask += 1;
                        }
                    }
                });
            }
        });

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("User Task Report");

        worksheet.columns = [
            { header: "User Name", key: "name", width: 35 },
            { header: "Email", key: "email", width: 30 },
            { header: "Total Assigned Tasks", key: "taskCount", width: 25 },
            { header: "Pending Tasks", key: "pendingTask", width: 15 },
            { header: "In Progress Tasks", key: "inprogressTask", width: 20 },
            { header: "Completed Tasks", key: "completedTask", width: 20 },
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="users_report.xlsx"'
        );

        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        next(error);
    }
};
