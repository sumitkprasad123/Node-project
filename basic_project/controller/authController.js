const UserModel = require("../db/models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signup = catchAsync(async (req, res, next) => {
  const body = req.body;

  if (!["1", "2"].includes(body.userType)) {
    return next(new AppError("Invalid User Type.", 400));

    // return res.status(400).json({
    //   status: "fail",
    //   message: "Invalid User Type.",
    // });
  }

  const newUser = await UserModel.create({
    userType: body.userType,
    email: body.email,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
    confirmPassword: body.confirmPassword,
  });

  if (!newUser) {
    return next(new AppError("Fail to create the user.", 400));

    // return res.status(400).json({
    //   status: "fail",
    //   message: "Fail to create the user.",
    // });
  }
  const result = newUser.toJSON();

  delete result.password;
  delete result.deletedAt;

  result.token = generateToken({ id: result.id });

  return res.status(201).json({
    status: "success",
    message: "User signed up successfully",
    data: result,
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new Error("Please provide email and password.", 400));

    // return res.status(400).json({
    //   status: "fail",
    //   message: "Please provide email and password.",
    // });
  }

  const result = await UserModel.findOne({ where: { email } });
  if (!result || !(await bcrypt.compare(password, result.password))) {
    return next(new Error("Incorrect email or password", 401));

    // return res.status(401).json({
    //   status: "fail",
    //   message: "Incorrect email or password",
    // });
  }

  const token = generateToken({ id: result.id });
  return res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    token,
  });
});

const authentication = catchAsync(async (req, res, next) => {
  //1.get the token from headers
  let idToken = "";

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    idToken = req.headers.authorization.split(" ")[1];
  }

  if (!idToken) {
    return next(new AppError("Please login to get access.", 401));
  }

  //2.tken varification
  const tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET);

  //3.get the user detail from db and add to req object
  const freshUser = await UserModel.findByPk(tokenDetail.id);

  if (!freshUser) {
    return next(new AppError("User no longer exist", 400));
  }
  req.user = freshUser;
  return next();
});

const restrictTo = (...userType) => {
  const checkPermission = (req, res, next) => {
    if (!userType.includes(req.user.userType)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }
    return next();
  };

  return checkPermission;
};

module.exports = { signup, login, authentication, restrictTo };
