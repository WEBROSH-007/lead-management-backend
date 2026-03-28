const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Lead = sequelize.define(
  "Lead",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
    },
    course: {
      type: DataTypes.STRING,
    },
    college: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "new",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    sheet_row_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "leads",
    timestamps: false,
  },
);

module.exports = Lead;
