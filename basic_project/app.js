require("dotenv").config({ path: `${process.cwd()}/.env` });
const express = require("express");
const authRoutes = require("./route/authRoutes");
const projectRoutes = require("./route/projectRoutes");
const userRoutes = require("./route/userRoutes");
const catchAsync = require("./utils/catchAsync");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");

const app = express();

app.use(express.json());
//all routes will be here
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/users", userRoutes);

app.use(
  catchAsync(async (req, res, next) => {
    // return next(new Error("This is error"));
    // throw new Error("This is error.");
    throw new AppError(`Can't find ${req.originalUrl} on this server`, 404);

    // res.status(404).json({ status: "fail", message: "Route not found." });
  })
);

// app.use((err, req, res, next) => {
//   res.status(err.statusCode).json({
//     status: err.statusCode,
//     message: err.message,
//     stack: err.stack,
//   });
// });

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
});
