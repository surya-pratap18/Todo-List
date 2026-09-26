import express from "express";
import tasksController from "../controller/tasks.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const tasksRoute = express.Router();

tasksRoute.post("/", authMiddleware, tasksController.createTask);
tasksRoute.get("/", authMiddleware, tasksController.getTasks);
tasksRoute.get("/:id", authMiddleware, tasksController.getTask);
tasksRoute.put("/:id", authMiddleware, tasksController.updateTask);
tasksRoute.delete("/:id", authMiddleware, tasksController.deleteTask);
tasksRoute.patch("/:id/status", authMiddleware, tasksController.updateTaskStatus);

export default tasksRoute;
