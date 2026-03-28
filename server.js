require("dotenv").config();
const app = require("./src/app");
const { sequelize, pool } = require("./src/config/db");
require("./src/models/Lead");
const Admin = require("./src/models/Admin");

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) {
      await Admin.findOrCreate({
        where: { email: process.env.ADMIN_EMAIL },
        defaults: { passwordHash: process.env.ADMIN_PASSWORD_HASH },
      });
    }

    app.listen(process.env.PORT, () =>
      console.log(`Server running on ${process.env.PORT}`),
    );
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

startServer();
