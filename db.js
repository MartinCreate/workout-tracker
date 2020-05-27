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
// ////--UPSERT
// module.exports.upsertWorkout = (id, wo_name) => {
//     return db.query(
//         `
//         INSERT INTO workouts (user_id, workout_name)
//         VALUES ($1, $2)
//         ON CONFLICT (workout_name) DO NOTHING`,
//         [id, wo_name]
//     );
// };
// module.exports.upsExerByWo = (id, wo_id, exer_id) => {
//     return db.query(
//         `
//         INSERT INTO exercises (user_id, exercise_name)
//         VALUES ($1, $2)
//         ON CONFLICT (exercise_name) DO NOTHING`,
//         [id, exercise]
//     );
// };

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
// ////--UPSERT
// module.exports.upsertExercise = (userId, exercise) => {
//     return db.query(
//         `
//         INSERT INTO exercises (user_id, exercise_name)
//         VALUES ($1, $2)
//         ON CONFLICT (exercise_name) DO NOTHING
//         RETURNING id`,
//         [userId, exercise]
//     );
// };
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

// module.exports.upsertSets = (
//     userId,
//     exerId,
//     setNum,
//     reps,
//     val1,
//     units1,
//     val2,
//     units2
// ) => {
//     return db.query(
//         `
//         INSERT INTO sets_table
//         (user_id, exercise_id, set_number, reps, val1, units1, val2, units2)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//         ON CONFLICT (set_number) DO UPDATE
//         SET set_number = $3, reps = $4, val1 = $5, units1 = $6, val2 = $7, units2 = 8$`,
//         [userId, exerId, setNum, reps, val1, units1, val2, units2]
//     );
// };

// module.exports.setDefaultExTags = (id, ex_name) => {
//     return db.query(
//         `
//         INSERT INTO default_workouts (user_id, workout, exercises)
//         VALUES ($1, $2, $3)
//         ON CONFLICT (exercises) DO NOTHING`,
//         [id, wo_name, ex_name]
//     );
// };

// ////--UPSERT
// module.exports.setDefaultWorkouts = (id, wo_name, ex_name) => {
//     return db.query(
//         `
//         INSERT INTO default_workouts (user_id, workout, exercises)
//         VALUES ($1, $2, $3)
//         ON CONFLICT (exercises) DO UPDATE SET exercises = $1`,
//         [user_id, age || null, city, checkUrl(url)]
//     );
// };

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

// ////// --------------------------FROM SOCIAL NETWORK BELOW ------------------------------------------------//
// ////// --------------------------------/user ------------------------------------------------//
// module.exports.getUserInfo = (id) => {
//     return db.query(
//         `
//     SELECT * FROM users WHERE id = $1`,
//         [id]
//     );
// };

// module.exports.updateImgUrl = (imgUrl, id) => {
//     return db.query(
//         `
//         UPDATE users
//         SET image_url = $1
//         WHERE id = $2
//         RETURNING image_url`,
//         [imgUrl, id]
//     );
// };

// module.exports.updateBio = (biotext, id) => {
//     return db.query(
//         `
//         UPDATE users
//         SET bio = $1
//         WHERE id = $2`,
//         [biotext, id]
//     );
// };

// ////// --------------------------------/other-user/:id ------------------------------------------------//
// module.exports.getOtherUserInfo = (id) => {
//     return db.query(
//         `
//     SELECT id, first, last, email, image_url, bio, created_at FROM users WHERE id = $1`,
//         [id]
//     );
// };

// ////// --------------------------------/friend-status ------------------------------------------------//

// module.exports.checkFriendship = (receiver, sender) => {
//     return db.query(
//         `
//         SELECT * FROM friendships
//         WHERE (receiver_id = $1 AND sender_id = $2)
//         OR (receiver_id = $2 AND sender_id = $1)`,
//         [receiver, sender]
//     );
// };
// module.exports.requestFriendship = (receiver, sender) => {
//     return db.query(
//         `
//         INSERT INTO friendships (receiver_id, sender_id)
//         VALUES ($1, $2)`,
//         [receiver, sender]
//     );
// };
// module.exports.deleteFriendship = (r, s) => {
//     return db.query(
//         `
//         DELETE FROM friendships
//         WHERE (receiver_id = $1 AND sender_id = $2)
//         OR (receiver_id = $2 AND sender_id = $1)`,
//         [r, s]
//     );
// };
// module.exports.acceptFriendship = (r, s) => {
//     return db.query(
//         `
//         UPDATE friendships
//         SET accepted = true
//         WHERE (receiver_id = $1 AND sender_id = $2)
//         OR (receiver_id = $2 AND sender_id = $1)`,
//         [r, s]
//     );
// };

// ////// --------------------------------/friend-wannabes ------------------------------------------------//

// module.exports.getFriendsAndWannabes = (myID) => {
//     return db.query(
//         `
//     SELECT users.id, first, last, image_url, accepted
//     FROM friendships
//     JOIN users
//     ON (accepted = false AND receiver_id = $1 AND sender_id = users.id)
//     OR (accepted = true AND receiver_id = $1 AND sender_id = users.id)
//     OR (accepted = true AND sender_id = $1 AND receiver_id = users.id)`,
//         [myID]
//     );
// };

// ////// --------------------------------/users FindPeople/Search------------------------------------------------//
// module.exports.getRecentRegisters = () => {
//     return db.query(`
//     SELECT * FROM users
//     ORDER BY id
//     DESC LIMIT 3`);
// };

// module.exports.getMatchingUsersFirst = (val) => {
//     return db.query(
//         `SELECT * FROM users
//         WHERE first ILIKE $1
//         ORDER BY first LIMIT 20`,
//         [val + "%"]
//     );
// };
// module.exports.getMatchingUsersLast = (val) => {
//     return db.query(
//         `SELECT * FROM users
//         WHERE (last ILIKE $1 AND last ILIKE $1  <> first ILIKE $1)
//         ORDER BY last LIMIT 20`,
//         [val + "%"]
//     );
// };

// ////// --------------------------------/chat ------------------------------------------------//
// module.exports.getLastTenMessages = () => {
//     // needs to be a join from users (first, last, image_url) and chats (chat_text, chat_sender_id)
//     return db.query(`
//     SELECT chat.id AS m_id, msg_sender_id AS msg_sender_id, chat_msg, chat.created_at, first, last, image_url
//     FROM chat
//     JOIN users
//     ON (msg_sender_id = users.id)
//     ORDER BY chat.created_at
//     DESC LIMIT 10`);
// };

// module.exports.insertNewMessage = (msg, sender_id) => {
//     //insert into chat and get info (first, last, image_url) about sender_id
//     //gonna have to be a join aswell. output has to look just like getLastTenMessages

//     return db.query(
//         `
//     INSERT INTO chat (chat_msg, msg_sender_id)
//     VALUES ($1, $2)`,
//         [msg, sender_id]
//     );
// };

// module.exports.mostRecentMessage = () => {
//     // needs to be a join from users (first, last, image_url) and chats (chat_text, chat_sender_id)
//     return db.query(`
//     SELECT chat.id AS m_id, msg_sender_id AS msg_sender_id, chat_msg, chat.created_at, first, last, image_url
//     FROM chat
//     JOIN users
//     ON (msg_sender_id = users.id)
//     ORDER BY chat.created_at
//     DESC LIMIT 1`);
// };

// //// ---------------------- private chat ---------------------- //
// module.exports.getPrivChatIds = (myID) => {
//     return db.query(
//         `
//     SELECT sender_id, receiver_id, created_at
//     FROM private_chat
//     WHERE receiver_id = $1 OR sender_id = $1
//     ORDER BY created_at DESC`,
//         [myID]
//     );
// };

// module.exports.getChatterById = (otherId) => {
//     return db.query(
//         `
//         SELECT id AS other_id, first, last, image_url
//         FROM users
//         WHERE id = $1`,
//         [otherId]
//     );
// };

// module.exports.getPrivateChatMsgs = (myId, otherId) => {
//     return db.query(
//         `
//         SELECT private_chat.id AS m_id, sender_id, receiver_id, priv_msg, first, last, image_url, private_chat.created_at AS created_at
//         FROM private_chat
//         JOIN users
//         ON sender_id = users.id
//         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
//         ORDER BY created_at
//         DESC LIMIT 500`,
//         [myId, otherId]
//     );
// };

// module.exports.insertNewPrivateMessage = (msg, receiver_id, sender_id) => {
//     return db.query(
//         `
//     INSERT INTO private_chat (priv_msg, receiver_id, sender_id)
//     VALUES ($1, $2, $3)`,
//         [msg, receiver_id, sender_id]
//     );
// };

// module.exports.mostRecentPrivMessage = (myId, otherId) => {
//     return db.query(
//         `
//         SELECT private_chat.id AS m_id, sender_id, receiver_id, priv_msg, first, last, image_url, private_chat.created_at AS created_at
//         FROM private_chat
//         JOIN users
//         ON sender_id = users.id
//         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
//         ORDER BY created_at
//         DESC LIMIT 1`,
//         [myId, otherId]
//     );
// };

// // module.exports.searchFriends = (myId, val) => {
// //     return db.query(
// //         `
// //     SELECT users.id, first, last, image_url, accepted
// //     FROM friendships
// //     JOIN users
// //     ON (accepted = true AND receiver_id = $1 AND sender_id = users.id)
// //     OR (accepted = true AND sender_id = $1 AND receiver_id = users.id)
// //     WHERE first ILIKE $2
// //     ORDER BY first`,
// //         [myId, val + "%"]
// //     );
// // };

// module.exports.searchFriendsFirst = (myId, val) => {
//     return db.query(
//         `
//     SELECT users.id, first, last, image_url, accepted
//     FROM friendships
//     JOIN users
//     ON (accepted = true AND receiver_id = $1 AND sender_id = users.id)
//     OR (accepted = true AND sender_id = $1 AND receiver_id = users.id)
//     WHERE first ILIKE $2
//     ORDER BY first`,
//         [myId, val + "%"]
//     );
// };
// module.exports.searchFriendsLast = (myId, val) => {
//     return db.query(
//         `
//     SELECT users.id, first, last, image_url, accepted
//     FROM friendships
//     JOIN users
//     ON (accepted = true AND receiver_id = $1 AND sender_id = users.id)
//     OR (accepted = true AND sender_id = $1 AND receiver_id = users.id)
//     WHERE (last ILIKE $2 AND last ILIKE $2  <> first ILIKE $2)
//     ORDER BY last`,
//         [myId, val + "%"]
//     );
// };

// module.exports.getOnlyFriends = (myId) => {
//     return db.query(
//         `
//     SELECT *
//     FROM friendships
//     WHERE (sender_id = $1 OR receiver_id = $1) AND accepted = true`,
//         [myId]
//     );
// };

// ////--- number of new messages

// // module.exports.resetNumbNewMsgs = (sender_id, receiver_id) => {
// //     return db.query(
// //         `
// //         UPDATE numb_of_newmsgs
// //         SET new_msgs = null
// //         WHERE sender_id = $1 AND receiver_id = $2`,
// //         [sender_id, receiver_id]
// //     );
// // };

// // module.exports.getNumbNewMsgs = (sender_id, receiver_id, newMsgs) => {
// //     return db.query(
// //         `
// //         SELECT new_msgs FROM numb_of_newmsgs
// //         WHERE sender_id = $1 AND receiver_id = $2`,
// //         [sender_id, receiver_id, newMsgs]
// //     );
// // };
// // module.exports.updateNumbNewMsgs = (sender_id, receiver_id, newMsgs) => {
// //     return db.query(
// //         `
// //         UPDATE numb_of_newmsgs
// //         SET new_msgs = $3
// //         WHERE sender_id = $1 AND receiver_id = $2`,
// //         [sender_id, receiver_id, newMsgs]
// //     );
// // };
// // module.exports.updateOneNewMsgs = (sender_id, receiver_id) => {
// //     return db.query(
// //         `
// //         UPDATE numb_of_newmsgs
// //         SET new_msgs = 1
// //         WHERE sender_id = $1 AND receiver_id = $2`,
// //         [sender_id, receiver_id]
// //     );
// // };
// // module.exports.insertOneNewMsgs = (sender_id, receiver_id, newMsgs) => {
// //     return db.query(
// //         `
// //         INSERT INTO numb_of_newmsgs (new_msgs, sender_id, receiver_id)
// //         VALUES ($1, $2, 1)
// //         WHERE sender_id = $1 AND receiver_id = $2`,
// //         [sender_id, receiver_id, newMsgs]
// //     );
// // };
