require("dotenv").config();
const app = require("./src/app");
const { sequelize, pool } = require("./src/config/db");
require("./src/models/Lead");

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (err) {
    console.error("Server error:", err);
    process.exit(1);
  }
};

startServer();
