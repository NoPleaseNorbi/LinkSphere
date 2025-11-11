const pool = require("../db");

const UserModel = {
  getAll: async () => {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
  },

  create: async (name, email) => {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    return result.rows[0];
  },
};

module.exports = UserModel;
