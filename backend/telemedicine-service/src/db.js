// This file is deprecated. The telemedicine-service uses MongoDB via ./config/db.js
// Do not use or import this file.


const dbPath = process.env.DB_PATH || './telemedicine-service.db';
const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS telemedicine_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL UNIQUE,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    room_name TEXT NOT NULL UNIQUE,
    meeting_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS delivery_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    channel TEXT NOT NULL,
    recipient_type TEXT NOT NULL,
    recipient_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    sent_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES telemedicine_sessions(id) ON DELETE CASCADE
  );
`);

module.exports = db;
