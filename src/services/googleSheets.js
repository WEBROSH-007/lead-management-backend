const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

let auth;

function loadGoogleCredentials() {
  if (process.env.GOOGLE_CREDENTIALS) {
    return JSON.parse(process.env.GOOGLE_CREDENTIALS);
  }

  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      type: "service_account",
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  const credentialsPath = path.resolve(process.cwd(), "credentials.json");
  if (fs.existsSync(credentialsPath)) {
    const fileData = fs.readFileSync(credentialsPath, "utf8");
    return JSON.parse(fileData);
  }

  return null;
}

try {
  const credentials = loadGoogleCredentials();

  if (!credentials) {
    console.warn(
      "GOOGLE_CREDENTIALS not found. Provide GOOGLE_CREDENTIALS JSON, or GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY, or credentials.json",
    );
  }

  auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
} catch (err) {
  console.error("Google Credentials Error:", err.message);
}

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// 🔧 Helper to get sheets instance
async function getSheetsInstance() {
  if (!auth) {
    throw new Error("Google Auth not initialized");
  }

  if (!SPREADSHEET_ID) {
    throw new Error("SPREADSHEET_ID is not set");
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
    console.error("Sheet Insert Error:", error.message);
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
    console.error("Sheet Update Error:", error.message);
  }
};
