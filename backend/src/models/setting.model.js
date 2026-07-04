const { query } = require("../config/db");

async function all() {
  const rows = await query("SELECT setting_key, setting_value FROM settings ORDER BY setting_key ASC");
  return rows.reduce((acc, row) => {
    try {
      acc[row.setting_key] = JSON.parse(row.setting_value);
    } catch (_error) {
      acc[row.setting_key] = row.setting_value;
    }
    return acc;
  }, {});
}

async function upsertMany(settings) {
  for (const [key, value] of Object.entries(settings)) {
    await query(
      `INSERT INTO settings (setting_key, setting_value)
       VALUES (:setting_key, :setting_value)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      {
        setting_key: key,
        setting_value: typeof value === "string" ? value : JSON.stringify(value)
      }
    );
  }
  return all();
}

module.exports = {
  all,
  upsertMany
};
