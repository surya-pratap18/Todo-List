import mongoose from "mongoose";
import Tasks from "../schema/tasks.schema.js";

const taskStatuses = ["pending", "in progress", "done"];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;

        if (!title) { 
            return res.status(400).json({ message: "Title is required" });
        }

        if (status && !taskStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid task status" });
        }

        const task = await Tasks.create({
            title,
            description,
            status: status || "pending",
            user: req.user._id,
        });

        return res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create task", error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid task id" });
        }

        if (status && !taskStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid task status" });
        }

        const updateData = {};

        if (title !== undefined) {
            updateData.title = title;
        }

        if (description !== undefined) {
            updateData.description = description;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        const task = await Tasks.findOneAndUpdate(
            { _id: id, user: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({ message: "Task updated successfully", task });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update task", error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid task id" });
        }

        const task = await Tasks.findOneAndDelete({ _id: id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete task", error: error.message });
    }
};

const getTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid task id" });
        }

        const task = await Tasks.findOne({ _id: id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({ task });
    } catch (error) {
        return res.status(500).json({ message: "Failed to get task", error: error.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const tasks = await Tasks.find({ user: req.user._id }).sort({ date: -1 });

        return res.status(200).json({ tasks });
    } catch (error) {
        return res.status(500).json({ message: "Failed to get tasks", error: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ message: "Invalid task id" });
        }

        const task = await Tasks.findOne({ _id: id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const currentStatusIndex = taskStatuses.indexOf(task.status);
        const nextStatusIndex = currentStatusIndex === -1 ? 0 : (currentStatusIndex + 1) % taskStatuses.length;

        task.status = taskStatuses[nextStatusIndex];
        await task.save();

        return res.status(200).json({ message: "Task status updated successfully", task });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update task status", error: error.message });
    }
};

const tasksController = {
    createTask,
    updateTask,
    deleteTask,
    getTask,
    getTasks,
    updateTaskStatus,
};

export default tasksController;
