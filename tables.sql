-- DROP TABLE IF EXISTS users, reset_codes;
CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL CHECK (first != '' AND first != ' '),
      last VARCHAR(255) NOT NULL CHECK (last != '' AND last != ' '),
      email VARCHAR(255) NOT NULL CHECK (email != '' AND email != ' ') UNIQUE,
      password VARCHAR(255) NOT NULL CHECK (password != '' AND password != ' '),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

-- psql -d trackerx -f tables.sql
--(make sure you're cd'd into the the folder that contains this file before running the line above)