CREATE TABLE IF NOT EXISTS chokuei_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);