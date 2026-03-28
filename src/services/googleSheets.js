const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

let auth;

function parseJson(raw) {
  if (!raw) return null;

  const trimmed = raw.trim();
  const unquoted =
    trimmed.startsWith("'") && trimmed.endsWith("'")
      ? trimmed.slice(1, -1)
      : trimmed;

  return JSON.parse(unquoted);
}

function loadGoogleCredentials() {
  const jsonEnvKeys = [
    "GOOGLE_CREDENTIALS",
    "GOOGLE_SERVICE_ACCOUNT_JSON",
    "GOOGLE_APPLICATION_CREDENTIALS_JSON",
  ];

  for (const key of jsonEnvKeys) {
    if (process.env[key]) {
      return parseJson(process.env[key]);
    }
  }

  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    const decoded = Buffer.from(
      process.env.GOOGLE_CREDENTIALS_BASE64,
      "base64",
    ).toString("utf8");
    return parseJson(decoded);
  }

  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      token_uri: "https://oauth2.googleapis.com/token",
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
      "Google credentials not found. Set GOOGLE_CREDENTIALS / GOOGLE_SERVICE_ACCOUNT_JSON / GOOGLE_APPLICATION_CREDENTIALS_JSON / GOOGLE_CREDENTIALS_BASE64, or GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY, or credentials.json",
    );
  } else {
    console.log(
      `Google credentials loaded for ${credentials.client_email || "service-account"}`,
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
    const details =
      error?.response?.data?.error?.message ||
      error?.response?.data?.error ||
      error.message;
    console.error("Sheet Insert Error:", details);
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
    const details =
      error?.response?.data?.error?.message ||
      error?.response?.data?.error ||
      error.message;
    console.error("Sheet Update Error:", details);
  }
};
