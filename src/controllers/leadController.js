const { Op } = require("sequelize");
const Lead = require("../models/Lead");
const { pool } = require("../config/db");
const { addToSheet, updateSheetStatus } = require("../services/googleSheets");

exports.createLead = async (req, res) => {
  const { name, email, phone, course, college, year } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM leads WHERE email=$1", [
      email,
    ]);

    if (existing.rows.length)
      return res.status(400).json({ msg: "Email already exists" });

    const result = await pool.query(
      `INSERT INTO leads (name,email,phone,course,college,year)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, email, phone, course, college, year],
    );

    const lead = result.rows[0];

    // 🔥 Add to Google Sheet
    const rowId = await addToSheet(lead);

    // Save row id
    if (rowId) {
      await pool.query("UPDATE leads SET sheet_row_id=$1 WHERE id=$2", [
        rowId,
        lead.id,
      ]);
    }

    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeads = async (req, res) => {
  const { search, course } = req.query;

  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (course) {
    where.course = course;
  }

  const result = await Lead.findAll({ where });
  res.json(result);
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE leads SET status=$1 WHERE id=$2 RETURNING *",
      [status, id],
    );

    const lead = result.rows[0];

    // 🔥 Update in Sheet
    if (lead.sheet_row_id) {
      await updateSheetStatus(lead.sheet_row_id, status);
    }

    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
