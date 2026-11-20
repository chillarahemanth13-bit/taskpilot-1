import mongoose from "mongoose";
import Task from "../models/task.model.js";
import { errorHandler } from "../utils/error.js";

export const createTask = async (req, res, next) => {
    try {
        const { title, description, priority, dueDate, assignedTo, attachment, todoChecklist } = req.body;

        if (!title || title.trim() === "") {
            return next(errorHandler(400, "Title is required"));
        }

        if (!dueDate) {
            return next(errorHandler(400, "Due date is required"));
        }

        if (!Array.isArray(assignedTo)) {
            return next(errorHandler(400, "assignedTo must be an array of user IDs"));
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachment,
            todoChecklist,
            createdBy: req.user.id,
        });

        res.status(201).json({ success: true, message: "Task created successfully", task });
    } catch (error) {
        next(error);
    }
};


export const getTask = async (req, res, next) => {
    try {
        const { status } = req.query

        let filter = {}

        if (status) {
            filter.status = status;
        }

        let tasks

        if (req.user.role === "admin") {
            tasks = await Task.find(filter).populate(
                "assignedTo",
                "name email profileImageUrl"
            )
        } else {
            tasks = await Task.find({
                ...filter,
                assignedTo: req.user.id,
            }).populate("assignedTo", "name email profileImageUrl")
        }


        tasks = await Promise.all(
            tasks.map(async (task) => {
                const completedCount = task.todoChecklist.filter(
                    (item) => item.completed
                ).length;

                return {
                    ...task._doc,
                    completedCount: completedCount,
                };
            })
        )

        //counting status summary

        const allTasks = await Task.countDocuments(
            req.user.role === "admin" ? {} : { assignedTo: req.user.id }
        )

        const pendingTasks = await Task.countDocuments({
            ...filter,
            status: "Pending",
            ...(req.user.role !== "admin" && { assignedTo: req.user.id })
        })

        const inprogressTasks = await Task.countDocuments({
            ...filter,
            status: "In Progress",
            ...(req.user.role !== "admin" && { assignedTo: req.user.id })
        })

        const completedTasks = await Task.countDocuments({
            ...filter,
            status: "Completed",
            ...(req.user.role !== "admin" && { assignedTo: req.user.id })
        })

        res.status(200).json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inprogressTasks,
                completedTasks,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        )

        if (!task) {
            return next(errorHandler(404, "task not found"))
        }

        res.status(200).json(task);
    } catch (error) {
        next(error)
    }
}

export const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)

        if (!task) {
            return next(errorHandler(404, "task not found"))
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.status = req.body.status || task.status;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachment = req.body.attachment || task.attachment;

        if (req.body.progress !== undefined) {
            task.progress = req.body.progress;
        }

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return next(errorHandler(400, "assignedTo must be an array of user IDs"));
            }

            task.assignedTo = req.body.assignedTo;
        }


        const updatedTask = await task.save()

        return res.status(200).json({ updatedTask, message: "task updated successfully" })
    } catch (error) {
        next(error)
    }
}


export const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)

        if (!task) {
            return next(errorHandler(404, "no tasks found"))
        }

        await task.deleteOne()

        res.status(200).json({ message: "task deleted successfully" })
    } catch (error) {
        next(error)
    }
}

export const updateTaskStatus = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)

        if (!task) {
            return next(errorHandler(404, "no task found"))
        }

        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user.id
        );

        if (!isAssigned && req.user.role !== "admin") {
            return next(errorHandler(403, "Unauthorized"));
        }

        task.status = req.body.status || task.status;

        if (task.status === "Completed") {
            task.todoChecklist.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        await task.save();

        res.status(200).json({ success: true, message: "Task status updated", task });
    } catch (error) {
        next(error)
    }
}

export const updateTaskChecklist = async (req, res, next) => {
    try {
        const { todoChecklist } = req.body

        const task = await Task.findById(req.params.id)

        if (!task) {
            return next(errorHandler(404, "no task found"))
        }

        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user.id
        );

        if (!isAssigned && req.user.role !== "admin") {
            return next(errorHandler(403, "not authorized"))
        }


        task.todoChecklist = todoChecklist || []


        const completedCount = task.todoChecklist.filter((item) => item.completed).length

        const totalItems = task.todoChecklist.length

        task.progress = totalItems > 0 ? Math.round(completedCount / totalItems * 100) : 0

        if (task.progress === 100) {
            task.status = "Completed"
        } else if (task.progress > 0) {
            task.status = "In Progress"
        } else {
            task.status = "Pending"
        }

        await task.save()

        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        )

        res.status(200).json({ success: true, message: "task checklist updated", task: updatedTask })
    } catch (error) {
        next(error)
    }
}

export const getDashboardData = async (req, res, next) => {
    try {
        //fetch statistics

        const totaltasks = await Task.countDocuments()
        const pendingTasks = await Task.countDocuments({ status: "Pending" })
        const inProgressTasks = await Task.countDocuments({ status: "In Progress" })
        const completedTasks = await Task.countDocuments({ status: "Completed" })
        const overdueTasks = await Task.countDocuments({
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() }
        })


        const taskstatuses = ["Pending", "In Progress", "Completed"]

        const taskDistributionRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                }
            }
        ])

        const taskDistribution = taskstatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "")

            acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0
            return acc
        }, {})

        taskDistribution["All"] = totaltasks


        const taskpriorities = ["Low", "Medium", "High"]

        const taskprioritylevelRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                },
            },
        ])

        const taskprioritylevel = taskpriorities.reduce((acc, priority) => {
            acc[priority] = taskprioritylevelRaw.find((item) => item._id === priority)?.count || 0
            return acc
        }, {})

        //fetch recent 10 tasks


        const recentTasks = await Task.find().sort({ createdAt: -1 }).limit(10).select("title status priority dueDate createdAt")

        res.status(200).json({
            statistics: {
                totaltasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                overdueTasks
            },
            charts: {
                taskDistribution,
                taskprioritylevel
            },
            recentTasks,
        })
    } catch (error) {
        next(error)
    }
}


export const userDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id
        const userObjectId = new mongoose.Types.ObjectId(userId)

        //fetch statistics for user specifix tasks

        const totaltasks = await Task.countDocuments({ assignedTo: userObjectId })
        const pendingTasks = await Task.countDocuments({
            assignedTo: userObjectId, status: "Pending"
        })
        const inProgressTasks = await Task.countDocuments({
            assignedTo: userObjectId, status: "In Progress"
        })
        const completedTasks = await Task.countDocuments({
            assignedTo: userObjectId, status: "Completed"
        })
        const overdueTasks = await Task.countDocuments({
            assignedTo: userObjectId, status: { $ne: "Completed" },
            dueDate: { $lt: new Date() }
        })


        const taskstatuses = ["Pending", "In Progress", "Completed"]

        const taskDistributionRaw = await Task.aggregate([{
            $match: { assignedTo: userObjectId },
        },
        {
            $group: { _id: "$status", count: { $sum: 1 } }
        },
        ])

        const taskDistribution = taskstatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "")

            acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0

            return acc
        }, {})
        taskDistribution["All"] = totaltasks

        const taskpriorities = ["Low", "Medium", "High"]

        const taskprioritylevelRaw = await Task.aggregate([
            {
                $match: { assignedTo: userObjectId }
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                },
            },
        ])

        const taskprioritylevel = taskpriorities.reduce((acc, priority) => {
            acc[priority] = taskprioritylevelRaw.find((item) => item._id === priority)?.count || 0


            return acc
        }, {})


        const recentTasks = await Task.find({ assignedTo: userObjectId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt")

        res.status(200).json({
            statistics: {
                totaltasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskprioritylevel
            },
            recentTasks
        })




    } catch (error) {
        next(error)
    }
}