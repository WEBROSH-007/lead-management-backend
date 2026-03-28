const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = "1VFGbzaiRCyWO1aaz8Epw3Oae6jMUHrpHiiNWz3zY64w";

async function getSheetsInstance() {
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

// ✅ Add Lead to Sheet
exports.addToSheet = async (lead) => {
  try {
    const sheets = await getSheetsInstance();

    const values = [
      [
        lead.name || "",
        lead.email || "",
        lead.phone || "",
        lead.course || "",
        lead.college || "",
        lead.year || "",
        lead.status || "new",
        lead.created_at
          ? new Date(lead.created_at).toLocaleString()
          : new Date().toLocaleString(),
        "", // reminder column
      ],
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:I",
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });

    // Extract row number
    const updatedRange = response.data.updates.updatedRange;
    const rowNumber = updatedRange.match(/\d+/)[0];

    console.log(`✅ Lead added to Sheet at row ${rowNumber}:`, lead.email);
    return rowNumber;
  } catch (error) {
    console.error("❌ Sheet Insert Error:", error.message);
    console.error("Full Error:", error);
    return null;
  }
};

// ✅ Update Status in Sheet
exports.updateSheetStatus = async (rowId, status) => {
  try {
    const sheets = await getSheetsInstance();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!G${rowId}`, // G = status column
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[status]],
      },
    });

    console.log(`✅ Status updated in Sheet at row ${rowId} to: ${status}`);
  } catch (error) {
    console.error("❌ Sheet Update Error:", error.message);
    console.error("Full Error:", error);
  }
};
