import db from "./database.js";

const rows = db.prepare("SELECT * FROM activity_events ORDER BY startTime DESC LIMIT 20").all();
console.table(rows);
