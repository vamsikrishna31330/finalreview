BEGIN TRANSACTION;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  organization TEXT,
  avatar TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  link TEXT,
  file_name TEXT,
  file_blob TEXT,
  created_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT,
  author_id INTEGER,
  published_at TEXT DEFAULT CURRENT_TIMESTAMP,
  audience TEXT,
  FOREIGN KEY (author_id) REFERENCES users(id)
);
CREATE TABLE forums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  created_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  sector TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE forum_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  forum_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (forum_id) REFERENCES forums(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);
CREATE TABLE sectors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  contact TEXT,
  region TEXT,
  description TEXT
);
CREATE TABLE sector_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  sector_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (sector_id) REFERENCES sectors(id)
);
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  start_date TEXT,
  end_date TEXT,
  location TEXT,
  sector_id INTEGER,
  created_by INTEGER,
  FOREIGN KEY (sector_id) REFERENCES sectors(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  level TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  read_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
COMMIT;
