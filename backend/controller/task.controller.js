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


export const deleteTask = async (req, res, next) => { }