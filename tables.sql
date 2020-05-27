-- DROP TABLE IF EXISTS users, reset_codes;
-- CREATE TABLE users(
--       id SERIAL PRIMARY KEY,
--       first VARCHAR(255) NOT NULL CHECK (first != '' AND first != ' '),
--       last VARCHAR(255) NOT NULL CHECK (last != '' AND last != ' '),
--       email VARCHAR(255) NOT NULL CHECK (email != '' AND email != ' ') UNIQUE,
--       password VARCHAR(255) NOT NULL CHECK (password != '' AND password != ' '),
--       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--       );

-- DROP TABLE IF EXISTS default_workouts, default_workout_tags, default_exercise_tags, default_sets;

DROP TABLE IF EXISTS track_workout_exercises;
DROP TABLE IF EXISTS track_workout_tags;
DROP TABLE IF EXISTS track_exercise_tags;
DROP TABLE IF EXISTS track_sets_table;
DROP TABLE IF EXISTS track_exercises;
DROP TABLE IF EXISTS workout_session;

-- DROP TABLE IF EXISTS workout_exercises;
DROP TABLE IF EXISTS workout_tags;
DROP TABLE IF EXISTS exercise_tags;
-- DROP TABLE IF EXISTS sets_table;
-- DROP TABLE IF EXISTS exercises;
-- DROP TABLE IF EXISTS workouts;

-- CREATE TABLE workouts(
--       id SERIAL PRIMARY KEY,
--       user_id INT NOT NULL REFERENCES users(id),
--       workout_name VARCHAR(100) NOT NULL,
--       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--       );
CREATE TABLE workout_tags(
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      workout_id INT NOT NULL REFERENCES workouts(id),
      wo_tags VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
-- CREATE TABLE exercises(
--       id SERIAL PRIMARY KEY,
--       user_id INT NOT NULL REFERENCES users(id),
--       exercise_name VARCHAR(100) NOT NULL,
--       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--       );
-- CREATE TABLE sets_table(
--       id SERIAL PRIMARY KEY,
--       user_id INT NOT NULL REFERENCES users(id),
--       exercise_id INT NOT NULL REFERENCES exercises(id),
--       set_number INT NOT NULL,
--       reps INT NOT NULL,
--       val1 VARCHAR(100),
--       units1 VARCHAR(100),
--       val2 VARCHAR(100),
--       units2 VARCHAR(100),
--       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--       );
CREATE TABLE exercise_tags(
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      exercise_id INT NOT NULL REFERENCES exercises(id),
      exer_tags VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
-- CREATE TABLE workout_exercises(
--       id SERIAL PRIMARY KEY,
--       user_id INT NOT NULL REFERENCES users(id),
--       workout_id INT NOT NULL,
--       exercise_id INT NOT NULL,
--       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--       );



CREATE TABLE workout_session(
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      workout_name VARCHAR(100) NOT NULL,
      workout_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
CREATE TABLE track_workout_tags(
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      wo_session_id INT NOT NULL REFERENCES workout_session(id),
      workout_id INT NOT NULL REFERENCES workouts(id),
      wo_tag1 VARCHAR(255),
      wo_tag2 VARCHAR(255),
      wo_tag3 VARCHAR(255),
      wo_tag4 VARCHAR(255),
      wo_tag5 VARCHAR(255),
      wo_tag6 VARCHAR(255),
      wo_tag7 VARCHAR(255),
      wo_tag8 VARCHAR(255),
      wo_tag9 VARCHAR(255),
      wo_tag10 VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
CREATE TABLE track_exercises(
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      wo_session_id INT NOT NULL REFERENCES workout_session(id),
      exercise_name VARCHAR(100) NOT NULL,
      exercise_id INT NOT NULL REFERENCES exercises(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
CREATE TABLE track_sets_table(
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      wo_session_id INT NOT NULL REFERENCES workout_session(id),
      exercise_id INT NOT NULL REFERENCES exercises(id),
      set_number INT NOT NULL,
      reps INT NOT NULL,
      val1 VARCHAR(100),
      units1 VARCHAR(100),
      val2 VARCHAR(100),
      units2 VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
CREATE TABLE track_exercise_tags(
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      wo_session_id INT NOT NULL REFERENCES workout_session(id),
      exercise_id INT NOT NULL REFERENCES exercises(id),
      e_tag1 VARCHAR(255),
      e_tag2 VARCHAR(255),
      e_tag3 VARCHAR(255),
      e_tag4 VARCHAR(255),
      e_tag5 VARCHAR(255),
      e_tag6 VARCHAR(255),
      e_tag7 VARCHAR(255),
      e_tag8 VARCHAR(255),
      e_tag9 VARCHAR(255),
      e_tag10 VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
CREATE TABLE track_workout_exercises(
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      wo_session_id INT NOT NULL REFERENCES workout_session(id),
      workout_id INT NOT NULL,
      exercise_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

-- psql -d trackerx -f tables.sql
--(make sure you're cd'd into the the folder that contains this file before running the line above)