import Database from "better-sqlite3";
import { type Database as DatabaseType } from "better-sqlite3";
import { type ActivityEvent } from "./types.js";

const db: DatabaseType = new Database("activity.db", { verbose: console.log });

db.exec(`CREATE TABLE IF NOT EXISTS activity_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    appName TEXT NOT NULL, 
    windowTitle TEXT NOT NULL, 
    startTime TEXT, 
    endTime TEXT, 
    duration INTEGER
    )`);

export const insertEvent = (event: ActivityEvent): number => {
  const stat =
    db.prepare(`INSERT INTO activity_events (appName, windowTitle, startTime, endTime, duration)
    VALUES (@appName, @windowTitle, @startTime, @endTime, @duration) `);
  const result = stat.run(event);
  return Number(result.lastInsertRowid);
};

export const updateEvent = (id: number, endTime: string, duration: number) => {
  const stat = db.prepare(
    `UPDATE activity_events SET endTime = ?, duration = ? WHERE id = ?`,
  );
  stat.run(endTime, duration, id);
};

export default db;
