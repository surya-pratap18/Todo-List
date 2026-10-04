import express from "express";
import dbConnect from "./config/dbConfig.js";
import usersRoute from "./routes/users.route.js";
import tasksRoute from "./routes/tasks.route.js";
import dotenv from "dotenv";

import * as path from "path";
const rootPath = process.cwd();

dotenv.config();

dbConnect();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

app.use("/users", usersRoute);
app.use("/tasks", tasksRoute);

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(rootPath, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
