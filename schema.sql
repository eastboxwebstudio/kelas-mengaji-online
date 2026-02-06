DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Note: In production, hash passwords using bcrypt/argon2
  role TEXT DEFAULT 'student',
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  schedule TEXT,
  price REAL DEFAULT 0,
  googleMeetLink TEXT,
  isActive BOOLEAN DEFAULT 1,
  type TEXT,
  instructorId TEXT,
  instructorName TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  classId TEXT NOT NULL,
  status TEXT DEFAULT 'Unpaid', -- 'Unpaid', 'Paid'
  transactionId TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(userId) REFERENCES users(id),
  FOREIGN KEY(classId) REFERENCES classes(id)
);

-- Seed Initial Admin (Optional)
-- INSERT INTO users (id, name, email, password, role, phone) VALUES ('admin-1', 'Admin CelikKalam', 'admin@celikkalam.com', 'admin123', 'admin', '0123456789');
