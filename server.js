require("dotenv").config();
const app = require("./src/app");
const { sequelize, pool } = require("./src/config/db");
require("./src/models/Lead");

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    app.listen(process.env.PORT, () =>
      console.log(`Server running on ${process.env.PORT}`),
    );
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

startServer();
