import Users from "../schema/users.schema.js";
import tokenUtils from "../utils/token.utils.js";

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  userName: user.userName,
  date: user.date,
});

const register = async (req, res) => {
  try {
    const { name, userName, password } = req.body;

    if (!name || !userName || !password) {
      return res
        .status(400)
        .json({ message: "Name, username and password are required" });
    }

    const existingUser = await Users.findOne({ userName });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const user = await Users.create({ name, userName, password });
    const token = tokenUtils.createToken({ id: user._id });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to register user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await Users.findOne({ userName });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = tokenUtils.createToken({ id: user._id });

    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to login user", error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to get user", error: error.message });
  }
};

const logout = (req, res) => {
  return res.status(200).json({ message: "User logged out successfully" });
};

const usersController = { register, login, getUser, logout };

export default usersController;
