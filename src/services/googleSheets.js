const { google } = require("googleapis");

let auth;

try {
  const credentials = process.env.GOOGLE_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
    : null;

  if (!credentials) {
    console.warn("⚠️ GOOGLE_CREDENTIALS not found");
  }

  auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
} catch (err) {
  console.error("❌ Google Credentials Error:", err.message);
}

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// 🔧 Helper to get sheets instance
async function getSheetsInstance() {
  if (!auth) {
    throw new Error("Google Auth not initialized");
  }

  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

// ✅ Add Lead to Sheet
exports.addToSheet = async (lead) => {
  try {
    const sheets = await getSheetsInstance();

    const values = [
      [
        lead.name,
        lead.email,
        lead.phone,
        lead.course,
        lead.college,
        lead.year,
        lead.status,
        lead.created_at,
        "",
      ],
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:I",
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });

    const updatedRange = response.data.updates.updatedRange;
    const rowNumber = updatedRange.match(/\d+/)[0];

    return rowNumber;
  } catch (error) {
    console.error("❌ Sheet Insert Error:", error.message);
    return null;
  }
};

// ✅ Update Status in Sheet
exports.updateSheetStatus = async (rowId, status) => {
  try {
    const sheets = await getSheetsInstance();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!G${rowId}`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[status]],
      },
    });
  } catch (error) {
    console.error("❌ Sheet Update Error:", error.message);
  }
};
