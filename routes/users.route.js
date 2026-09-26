import express from "express";
import usersController from "../controller/users.contoller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const usersRoute = express.Router();

usersRoute.post("/register", usersController.register);
usersRoute.post("/login", usersController.login);
usersRoute.get("/logout", authMiddleware, usersController.logout);
usersRoute.get("/:id", authMiddleware, usersController.getUser);

export default usersRoute;
