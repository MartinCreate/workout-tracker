const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/trackerx"
);

////// --------------------------------/register & /login page------------------------------------------------//
////--POST
module.exports.submitRegistration = (first, last, email, password) => {
    return db.query(
        `
    INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
        [first, last, email, password]
    );
};

module.exports.login = (loginEmail) => {
    return db.query(
        `
    SELECT password, id FROM users WHERE email = $1`,
        [loginEmail]
    );
};

////// --------------------------------/homepage ------------------------------------------------//
module.exports.getName = (id) => {
    return db.query(
        `
        SELECT first, last, id FROM users WHERE id = $1`,
        [id]
    );
};

////// --------------------------------/reset-password ------------------------------------------------//
////--POST
module.exports.checkUser = (loginEmail) => {
    return db.query(
        `
    SELECT id, email, first, last FROM users WHERE email = $1`,
        [loginEmail]
    );
};

module.exports.saveCode = (email, code) => {
    return db.query(
        `
    INSERT INTO reset_codes (email, code)
    VALUES ($1, $2)`,
        [email, code]
    );
};

module.exports.getCode = () => {
    return db.query(
        `
        SELECT * FROM reset_codes
        WHERE CURRENT_TIMESTAMP - created_at < INTERVAL '20 minutes'
        ORDER BY id DESC
        LIMIT 1`
    );
};

module.exports.updatePassword = (email, password) => {
    return db.query(
        `
        UPDATE users
        SET password = $2
        WHERE email = $1`,
        [email, password]
    );
};
// ////// --------------------------------choose exercise ------------------------------------------------//
module.exports.getUserExerNames = (userId) => {
    return db.query(
        `
        SELECT exercise_name FROM exercises WHERE user_id = $1 ORDER BY exercise_name ASC`,
        [userId]
    );
};
// ////// --------------------------------/save-workout ------------------------------------------------//
module.exports.checkWorkout = (userId, wrktName) => {
    return db.query(
        `
        SELECT id AS wrkt_id
        FROM workouts
        WHERE user_id = $1 AND workout_name = $2`,
        [userId, wrktName]
    );
};
module.exports.insertWorkout = (userId, wrktName) => {
    return db.query(
        `
        INSERT INTO workouts (user_id, workout_name)
        VALUES ($1, $2)
        RETURNING id`,
        [userId, wrktName]
    );
};
module.exports.deleteWrktTags = (userId, wrktId) => {
    return db.query(
        `
        DELETE FROM workout_tags
        WHERE user_id = $1 AND workout_id = $2`,
        [userId, wrktId]
    );
};
module.exports.deleteExersByWrkt = (userId, wrktId) => {
    return db.query(
        `
        DELETE FROM workout_exercises
        WHERE user_id = $1 AND workout_id = $2`,
        [userId, wrktId]
    );
};
module.exports.insertWrktTag = (userId, wrktId, wrktTag) => {
    return db.query(
        `
        INSERT INTO workout_tags (user_id, workout_id, wo_tags)
        VALUES ($1, $2, $3)`,
        [userId, wrktId, wrktTag]
    );
};
module.exports.insertExersByWrkt = (userId, wrktId, exerId) => {
    return db.query(
        `
        INSERT INTO workout_exercises (user_id, workout_id, exercise_id)
        VALUES ($1, $2, $3)`,
        [userId, wrktId, exerId]
    );
};

// ////// --------------------------------/submit-exercise ------------------------------------------------//
module.exports.checkExercise = (userId, exerName) => {
    return db.query(
        `
        SELECT id AS exer_id
        FROM exercises
        WHERE user_id = $1 AND exercise_name = $2`,
        [userId, exerName]
    );
};
module.exports.insertExercise = (userId, exerName) => {
    return db.query(
        `
        INSERT INTO exercises (user_id, exercise_name)
        VALUES ($1, $2)
        RETURNING id`,
        [userId, exerName]
    );
};
module.exports.deleteExerTags = (userId, exerId) => {
    return db.query(
        `
        DELETE FROM exercise_tags
        WHERE user_id = $1 AND exercise_id = $2`,
        [userId, exerId]
    );
};
module.exports.insertExerTag = (userId, exerId, exerTag) => {
    return db.query(
        `
        INSERT INTO exercise_tags (user_id, exercise_id, exer_tags)
        VALUES ($1, $2, $3)`,
        [userId, exerId, exerTag]
    );
};

module.exports.deleteExerSets = (userId, exerId) => {
    return db.query(
        `
        DELETE FROM sets_table
        WHERE user_id = $1 AND exercise_id = $2`,
        [userId, exerId]
    );
};
module.exports.insertSet = (
    userId,
    exerId,
    setNum,
    reps,
    val1 = null,
    units1 = null,
    val2 = null,
    units2 = null
) => {
    return db.query(
        `
        INSERT INTO sets_table
        (user_id, exercise_id, set_number, reps, val1, units1, val2, units2)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
            userId,
            exerId,
            setNum,
            reps,
            val1 || null,
            units1 || null,
            val2 || null,
            units2 || null,
        ]
    );
};

// ////// --------------------------------/track-workout ------------------------------------------------//
//// --------------/choose-workout -----------------//
module.exports.getWorkouts = (userId) => {
    return db.query(
        `
        SELECT * FROM workouts
        WHERE user_id = $1
        ORDER BY created_at DESC`,
        [userId]
    );
};

//// --------------/get-wo-data/:woId -----------------//
module.exports.getWoTags = (userId, woId) => {
    return db.query(
        `
        SELECT wo_tags FROM workout_tags
        WHERE user_id = $1 AND workout_id = $2
        ORDER BY wo_tags ASC`,
        [userId, woId]
    );
};
module.exports.getExersByWorkout = (userId, woId) => {
    return db.query(
        `
        SELECT exercise_id FROM workout_exercises
        WHERE user_id = $1 AND workout_id = $2
        ORDER BY id ASC`,
        [userId, woId]
    );
};
module.exports.getExerNames = (exerId) => {
    return db.query(
        `
        SELECT exercise_name FROM exercises
        WHERE id = $1`,
        [exerId]
    );
};
module.exports.getExerSets = (userId, exerId) => {
    return db.query(
        `
        SELECT * FROM sets_table
        WHERE user_id = $1 AND exercise_id = $2
        ORDER BY set_number ASC`,
        [userId, exerId]
    );
};
module.exports.getExerTags = (userId, exerId) => {
    return db.query(
        `
        SELECT exer_tags FROM exercise_tags
        WHERE user_id = $1 AND exercise_id = $2
        ORDER BY exer_tags ASC`,
        [userId, exerId]
    );
};

// ////// --------------------------------POST /track-workout ------------------------------------------------//
module.exports.insertWorkoutSession = (userId, woName, woId) => {
    return db.query(
        `
        INSERT INTO workout_session (user_id, workout_name, workout_id)
        VALUES ($1, $2, $3)
        RETURNING id`,
        [userId, woName, woId]
    );
};

module.exports.trackInsertExercise = (userId, seshId, exerName, exerId) => {
    return db.query(
        `
        INSERT INTO track_exercises (user_id, wo_session_id, exercise_name, exercise_id)
        VALUES ($1, $2, $3, $4)`,
        [userId, seshId, exerName, exerId]
    );
};
module.exports.trackInsertExerTag = (
    userId,
    seshId,
    exerId,
    eTag1 = null,
    eTag2 = null,
    eTag3 = null,
    eTag4 = null,
    eTag5 = null,
    eTag6 = null,
    eTag7 = null,
    eTag8 = null,
    eTag9 = null,
    eTag10 = null
) => {
    return db.query(
        `
        INSERT INTO track_exercise_tags (user_id, wo_session_id, exercise_id, e_tag1, e_tag2, e_tag3, e_tag4, e_tag5, e_tag6, e_tag7, e_tag8, e_tag9, e_tag10)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
            userId,
            seshId,
            exerId,
            eTag1,
            eTag2,
            eTag3,
            eTag4,
            eTag5,
            eTag6,
            eTag7,
            eTag8,
            eTag9,
            eTag10,
        ]
    );
};
module.exports.trackInsertSet = (
    userId,
    seshId,
    exerId,
    setNum,
    reps,
    val1 = null,
    units1 = null,
    val2 = null,
    units2 = null
) => {
    return db.query(
        `
        INSERT INTO track_sets_table
        (user_id, wo_session_id, exercise_id, set_number, reps, val1, units1, val2, units2)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
            userId,
            seshId,
            exerId,
            setNum,
            reps,
            val1 || null,
            units1 || null,
            val2 || null,
            units2 || null,
        ]
    );
};
module.exports.trackInsertWrktTag = (
    userId,
    seshId,
    wrktId,
    wo_tag1 = null,
    wo_tag2 = null,
    wo_tag3 = null,
    wo_tag4 = null,
    wo_tag5 = null,
    wo_tag6 = null,
    wo_tag7 = null,
    wo_tag8 = null,
    wo_tag9 = null,
    wo_tag10 = null
) => {
    return db.query(
        `
        INSERT INTO track_workout_tags (user_id, wo_session_id, workout_id, wo_tag1, wo_tag2, wo_tag3, wo_tag4, wo_tag5, wo_tag6, wo_tag7, wo_tag8, wo_tag9, wo_tag10)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
            userId,
            seshId,
            wrktId,
            wo_tag1,
            wo_tag2,
            wo_tag3,
            wo_tag4,
            wo_tag5,
            wo_tag6,
            wo_tag7,
            wo_tag8,
            wo_tag9,
            wo_tag10,
        ]
    );
};
module.exports.trackInsertExersByWrkt = (
    userId,
    seshId,
    wrktId,
    exerId,
    exerNm
) => {
    return db.query(
        `
        INSERT INTO track_workout_exercises (user_id, wo_session_id, workout_id, exercise_id, exer_name)
        VALUES ($1, $2, $3, $4, $5)`,
        [userId, seshId, wrktId, exerId, exerNm]
    );
};

// ////// -------------------------------- /view-basic-wo-data ------------------------------------------------//
module.exports.getWoSessions = (userId) => {
    return db.query(
        `
        SELECT * FROM workout_session WHERE user_id = $1`,
        [userId]
    );
};
module.exports.getTrackedExers = (seshId) => {
    return db.query(
        `
        SELECT exer_name, exercise_id FROM track_workout_exercises WHERE wo_session_id = $1`,
        [seshId]
    );
};
module.exports.getTrackedSets = (seshId, exerId) => {
    return db.query(
        `
        SELECT set_number AS setNr, reps, val1, units1, val2, units2
        FROM track_sets_table
        WHERE wo_session_id = $1 AND exercise_id = $2`,
        [seshId, exerId]
    );
};
