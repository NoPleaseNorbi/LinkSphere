const UserModel = require("../models/userModel");

const UserController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getAll();
      res.json(users);
    } catch (err) {
      console.error("Error fetching users:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  },

  addUser: async (req, res) => {
    try {
      const { name, email } = req.body;
      const newUser = await UserModel.create(name, email);
      res.status(201).json(newUser);
    } catch (err) {
      console.error("Error adding user:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = UserController;
