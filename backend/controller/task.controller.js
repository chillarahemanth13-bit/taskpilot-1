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
