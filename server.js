// import express from "express";
// import dotenv from "dotenv";
// import dbConnect from "./config/dbConfig.js";

// dotenv.config();

// dbConnect();

// const app = express();
// const port = 3000;

// app.use(express.json());

// app.use(express.static("public"));

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.post("/login", (req, res) => {
//   const body = req.body;

//   res.send(JSON.stringify(body));
//   res.status(403);
// });

// app.get("/user", (req, res) => {
//   res.send("Good Morning, Surya ");
// });

// app.get("/products", (req, res) => {
//   const { limit, skip } = req.query;
//   if (limit || skip) {
//     res.send(
//       `Hitting product api with query limit: ${limit || 0} & skip: ${skip || 0}`,
//     );
//   }

//   res.send("products");
// });

// app.get("/products/:id", (req, res) => {
//   const { id } = req.params;
//   //   const id = req.params.id;
//   res.send(`product id : ${id}`);
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

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

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(rootPath, "public", "index.html"));
});

app.use("/users", usersRoute);
app.use("/tasks", tasksRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
