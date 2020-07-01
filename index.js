//AWS Bucketname: martinpaul-msg-socialnetwork
/* To check the images on aws, go to
https://s3.console.aws.amazon.com/s3/buckets/martinpaul-msg-socialnetwork/
*/

const express = require("express");
const app = express();
const db = require("./db");
const { hash, compare } = require("./bc");
const compression = require("compression");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const c = require("crypto-random-string");
const { sendEmail } = require("./ses");
const s3 = require("./s3");

//////////////////////// DON'T TOUCH below - IMAGE UPLOAD BIOLDERPLATE /////////////////////////////
//npm packages we installed
const multer = require("multer"); //saves our files to our harddrive
const uidSafe = require("uid-safe"); //creates random string to give each file a unique name
//core node module
const path = require("path");

const diskStorage = multer.diskStorage({
    //where on harddrive files will be saved
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    //makes sure each file we upload has a different name. uidSafe creates a random 24-character name
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        }); //this adds the original filepath and extention to the 24-character-random-name
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152, //limits uploaded filesize to be 2mb max
    },
});
//////////////////////// DON'T TOUCH above - IMAGE UPLOAD BIOLDERPLATE /////////////////////////////

////------------------------------- MIDDLEWARE ---------------------------------------------- //
app.use((req, res, next) => {
    console.log(
        "//-------------------- NEW REQUEST ------------------------//"
    );
    next();
});
app.use(compression());

app.use(
    cookieSession({
        secret: `the hounds are always hungry`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.json());
app.use(express.static("public"));

// csruf security
app.use(csurf());
app.use(function (req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});

//React-specific code. if-block runs when we're running the application locally
//app.use runs whenever we receive a request for bundle.js and passes on the request to port 8081, which means our second server (bundle-server) takes care of the request, handles it, then sends it back to our html through bundle.js
if (process.env.NODE_ENV != "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({
            target: "http://localhost:8081/",
        })
    );
} else {
    //for heroku
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

//--Not really middleware
const cleanTime = (uploadTime) => {
    return (uploadTime = new Intl.DateTimeFormat("en-GB", {
        // weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
        timeZone: "Etc/GMT-2",
    }).format(uploadTime));
};

////------------------------------- ROUTES ----------------------------------------------------------------------------------- //

app.get("/welcome", (req, res) => {
    console.log("We're in /welcome!");

    if (req.session.userId) {
        res.redirect("/");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.get("/logout", (req, res) => {
    console.log("We're in /logout!");

    req.session = null;
    res.redirect("/");
});

////------------------------------- /user route ---------------------------------------------- //
app.get("/user", async (req, res) => {
    console.log("We're in /user!");

    try {
        const { rows } = await db.getUserInfo(req.session.userId);
        res.json(rows[0]);
    } catch (e) {
        console.log("ERROR in /user getUserInfo: ", e);
    }
});

////------------------------------- /register route ---------------------------------------------- //
app.post("/register", async (req, res) => {
    console.log("We're in /register!");
    const { first, last, email, password } = req.body;

    if (password == "" || !password) {
        return res.json({ success: false });
    } else {
        try {
            const hashedP = await hash(password);
            const resp = await db.submitRegistration(
                first,
                last,
                email,
                hashedP
            );
            const id = resp.rows[0].id;

            req.session.userId = id;
            res.json({ success: true });
        } catch (e) {
            console.log("ERROR in /register: ", e);
            res.json({ success: false });
        }
    }
});

////------------------------------- /login route ---------------------------------------------- //
app.post("/login", async (req, res) => {
    console.log("We're in /login!");

    try {
        const { rows } = await db.login(req.body.email);
        const matchValue = await compare(req.body.password, rows[0].password);

        if (req.body.password == "") {
            throw Error;
        }

        if (matchValue) {
            req.session.userId = rows[0].id;
        } else {
            throw Error;
        }

        res.json({ success: true });
    } catch (e) {
        console.log("ERROR in POST /login: ", e);
        res.json({ success: false });
    }
});

////------------------------------- /reset password routes ---------------------------------------------- //
app.post("/reset-pword/one", async (req, res) => {
    const { email } = req.body;
    try {
        const { rows } = await db.checkUser(email);
        if (rows.length == 0) {
            throw Error;
        }

        const resp = rows[0];

        const newCode = c({ length: 6 });
        const emailBody = `Dearest ${resp.first} ${resp.last},

Here is your password-reset code.

Code: ${newCode}

This code expires after 20 minutes.
Enter the code into the password-reset form along with your new password of choice.

Forever yours,
amJam`;

        await sendEmail(email, "Reset-code for amJam", emailBody);
        await db.saveCode(email, newCode);
        res.json({ success: true });
    } catch (e) {
        console.log("ERROR in /reset-pword/one: ", e);
        res.json({ success: false });
    }
});

app.post("/reset-pword/two", async (req, res) => {
    const { newPassword, code, email } = req.body;

    try {
        const { rows } = await db.getCode();

        if (code == "" || rows.length == 0 || newPassword == 0) {
            throw Error;
        }

        if (code == rows[0].code) {
            const hashedP = await hash(newPassword);
            await db.updatePassword(email, hashedP);
            res.json({ success: true });
        } else {
            throw Error;
        }
    } catch (e) {
        console.log("ERROR in /reset-pword/two: ", e);
        res.json({ success: false });
    }
});
////------------------------------- /homepage ---------------------------------------------- //
app.get("/homepage", async (req, res) => {
    console.log("We're in /homepage!");

    const { rows } = await db.getName(req.session.userId);
    console.log("rows: ", rows);
    res.json(rows);
});

////------------------------------- /Choose exercise Routes ---------------------------------------------- //
app.get("/get-ex-names", async (req, res) => {
    try {
        const { rows } = await db.getUserExerNames(req.session.userId);
        console.log("rows: ", rows);
        res.json(rows);
    } catch (e) {
        console.log("ERROR in /get-ex-names: ", e);
    }
});

app.get("/get-ex-data/:exname", async (req, res) => {
    const id = req.session.userId;
    console.log("req.params.exname: ", req.params.exname);

    try {
        const { rows } = await db.getExerId(id, req.params.exname);
        const exerId = rows[0].exer_id;
        console.log("exerId: ", exerId);

        //xxx
        const tagsResp = await db.getExerTags(id, exerId);
        const tagsRespRows = tagsResp.rows;
        let tagsArr = [];
        for (let i = 0; i < tagsRespRows.length; i++) {
            tagsArr.push(tagsRespRows[i].exer_tags);
        }

        const setsResp = await db.getExerSets(id, exerId);
        const setsArr = setsResp.rows;

        const exerData = {
            exercise: req.params.exname,
            exerId,
            tagsArr,
            setsArr,
        };

        console.log("exerData in /get-ex-data: ", exerData);
        res.json(exerData);
    } catch (e) {
        console.log("ERROR in /get-ex-data: ", e);
    }
});
////------------------------------- /submit-exercise ---------------------------------------------- //
app.post("/submit-exercise", async (req, res) => {
    console.log("req.body in /submit-exercise: ", req.body);
    const bod = req.body;
    const myId = req.session.userId;
    const { exName, sets } = req.body;

    try {
        let exerId;

        const check = await db.getExerId(myId, exName);

        if (check.rows[0]) {
            exerId = check.rows[0].exer_id;
            await db.deleteExerTags(myId, exerId);
            await db.deleteExerSets(myId, exerId);
        } else {
            const { rows } = await db.insertExercise(myId, exName);
            exerId = rows[0].id;
        }

        if (bod.exTags) {
            for (const tag of bod.exTags) {
                await db.insertExerTag(myId, exerId, tag);
            }
        }

        for (const set of sets) {
            let setNr = sets.indexOf(set) + 1;
            let reps = set[0];

            let units;
            let val1;
            let meas1;
            let val2;
            let meas2;

            if (set[1]) {
                units = set[1];
                val1 = units[0][0];
                meas1 = units[0][1];

                if (units[1]) {
                    val2 = units[1][0];
                    meas2 = units[1][1];
                }
            }

            await db.insertSet(
                myId,
                exerId,
                setNr,
                reps,
                val1,
                meas1,
                val2,
                meas2
            );
        }

        res.json("success");
    } catch (e) {
        console.log("ERROR in /submit-exercise: ", e);
        res.json("error");
    }
});

////------------------------------- /save-workout ---------------------------------------------- //
app.post("/save-workout", async (req, res) => {
    console.log("We're in /save-workout");
    console.log("req.body in /save-workout: ", req.body);
    const bod = req.body;
    const id = req.session.userId;
    const { woName, exers } = req.body;

    try {
        let wrktId;

        const check = await db.checkWorkout(id, woName);
        if (check.rows[0]) {
            wrktId = check.rows[0].wrkt_id;
            await db.deleteWrktTags(id, wrktId);
            await db.deleteExersByWrkt(id, wrktId);
        } else {
            const { rows } = await db.insertWorkout(id, woName);
            wrktId = rows[0].id;
        }

        if (bod.woTags) {
            for (const tag of bod.woTags) {
                console.log("tag inside loop: ", tag);
                await db.insertWrktTag(id, wrktId, tag);
            }
        }

        for (const exer of exers) {
            console.log("exer in loop: ", exer);
            const { rows } = await db.getExerId(id, exer);
            await db.insertExersByWrkt(id, wrktId, rows[0].exer_id);
        }

        //------ I think these lines are made redundant be the for..of loop above, but brain is mush, so I'm keeping these lines just in case
        // let exerIds = [];
        // for (const exer of exers) {
        //     console.log("exer in loop: ", exer);
        //     const { rows } = await db.getExerId(id, exer);
        //     exerIds.push(rows[0].exer_id);
        // }
        // console.log("exerIds: ", exerIds);
        // for (const exer of exers) {
        //     const ind = exers.indexOf(exer);
        //     console.log("ind of current exer in loop: ", ind);
        //     await db.insertExersByWrkt(id, wrktId, exerIds[ind]);
        // }

        console.log("END OF /SAVE-WORKOUT");
        res.json("success");
    } catch (e) {
        console.log("ERROR in /save-workout: ", e);

        const eStr = e.toString();
        if (
            eStr.includes(
                "TypeError: Cannot read property 'exer_id' of undefined"
            )
        ) {
            // res.json("Error: save each new exercise");
            res.json("Err: unsaved exers");
            return;
        }
        res.json("error");
    }
});

////------------------------------- Track Workout routes ---------------------------------------------- //
app.get("/choose-workout", async (req, res) => {
    console.log("We're in /choose-workout");

    const { rows } = await db.getWorkouts(req.session.userId);
    console.log("rows: ", rows);
    res.json(rows);
});

app.get("/get-wo-data/:woId", async (req, res) => {
    console.log("We're in /get-wo-data");

    console.log("req.params.woId: ", req.params.woId);
    const id = req.session.userId;
    const woId = req.params.woId;

    const respWoTags = await db.getWoTags(id, woId);
    let woTags = [];
    if (respWoTags.rows) {
        woTags = respWoTags.rows.map((tag) => {
            return tag.wo_tags;
        });
    }
    console.log("woTags: ", woTags);

    const respExs = await db.getExersByWorkout(id, woId);
    let exerIds = respExs.rows.map((res) => {
        return res.exercise_id;
    });
    console.log("exerIds: ", exerIds);

    let exerSetsTags = [];
    for (const exerId of exerIds) {
        const respN = await db.getExerNames(exerId);
        const exerName = respN.rows[0].exercise_name;
        const { rows } = await db.getExerSets(id, exerId);

        // console.log("rows SETS: ", rows);
        let setsArr = rows.map((set) => {
            let retSet = {
                id: set.id,
                setNr: set.set_number,
                reps: set.reps,
                date: set.created_at,
            };

            if (set.val1) {
                retSet.units = [
                    {
                        val: set.val1,
                        units: set.units1,
                    },
                ];
                if (set.val2) {
                    retSet.units.push({
                        val: set.val2,
                        units: set.units2,
                    });
                }
            } else {
                retSet.units = null;
            }

            return retSet;
        });

        console.log("setsArr: ", setsArr);

        const respT = await db.getExerTags(id, exerId);
        let tags = respT.rows.map((t) => {
            return t.exer_tags;
        });

        const setsObj = {
            exerId,
            exerName,
            sets: setsArr,
            tags,
        };
        exerSetsTags.push(setsObj);
    }
    // console.log("exerSetsTags: ", exerSetsTags);
    const woData = {
        woTags,
        exerSetsTags,
    };
    console.log("woData: ", woData);

    res.json(woData);
});

// ////------------------------------- /track-workout route ---------------------------------------------- //
app.post("/track-workout", async (req, res) => {
    console.log("We're in /track-workout!");
    console.log("req.body: ", req.body);
    const bod = req.body;

    const id = req.session.userId;
    const { woName } = bod;
    const exersData = bod.exersData;
    const { rows } = await db.checkWorkout(id, woName);
    const woId = rows[0].wrkt_id;
    console.log("woId: ", woId);

    const resp = await db.insertWorkoutSession(id, woName, woId);
    const seshId = resp.rows[0].id;
    console.log("seshId: ", seshId);

    try {
        if (bod.woTags) {
            let woTag1;
            let woTag2;
            let woTag3;
            let woTag4;
            let woTag5;
            let woTag6;
            let woTag7;
            let woTag8;
            let woTag9;
            let woTag10;

            let woTags = [
                woTag1,
                woTag2,
                woTag3,
                woTag4,
                woTag5,
                woTag6,
                woTag7,
                woTag8,
                woTag9,
                woTag10,
            ];

            for (const tag of bod.woTags) {
                const ind = bod.woTags.indexOf(tag);
                woTags[ind] = tag;
            }

            await db.trackInsertWrktTag(
                id,
                seshId,
                woId,
                woTags[0],
                woTags[1],
                woTags[2],
                woTags[3],
                woTags[4],
                woTags[5],
                woTags[6],
                woTags[7],
                woTags[8],
                woTags[9]
            );
        }

        for (const exer of exersData) {
            console.log("exer in loop: ", exer);
            const { rows } = await db.getExerId(id, exer.exName);
            await db.trackInsertExersByWrkt(
                id,
                seshId,
                woId,
                rows[0].exer_id,
                exer.exName
            );
        }
    } catch (e) {
        console.log("ERROR in /track-workout Workout: ", e);
        res.json("error");
    }

    ////--------- TRACK EXERCISE ----------------- //
    for (const exerData of exersData) {
        const { exName, sets } = exerData;

        try {
            let exerId;

            const check = await db.getExerId(id, exName);
            exerId = check.rows[0].exer_id;
            console.log("exerId: ", exerId);
            await db.trackInsertExercise(id, seshId, exName, exerId);

            if (exerData.exTags) {
                let eTag1;
                let eTag2;
                let eTag3;
                let eTag4;
                let eTag5;
                let eTag6;
                let eTag7;
                let eTag8;
                let eTag9;
                let eTag10;

                let eTags = [
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
                ];

                for (const tag of exerData.exTags) {
                    const ind = exerData.exTags.indexOf(tag);
                    eTags[ind] = tag;
                }

                await db.trackInsertExerTag(
                    id,
                    seshId,
                    exerId,
                    eTags[0],
                    eTags[1],
                    eTags[2],
                    eTags[3],
                    eTags[4],
                    eTags[5],
                    eTags[6],
                    eTags[7],
                    eTags[8],
                    eTags[9]
                );
            }

            for (const set of sets) {
                let setNr = sets.indexOf(set) + 1;
                let reps = set[0];

                let units;
                let val1;
                let meas1;
                let val2;
                let meas2;

                if (set[1]) {
                    units = set[1];
                    val1 = units[0][0];
                    meas1 = units[0][1];

                    if (units[1]) {
                        val2 = units[1][0];
                        meas2 = units[1][1];
                    }
                }

                await db.trackInsertSet(
                    id,
                    seshId,
                    exerId,
                    setNr,
                    reps,
                    val1,
                    meas1,
                    val2,
                    meas2
                );
            }
        } catch (e) {
            console.log("ERROR in /track-workout Exercises: ", e);
            return res.json("error");
        }
    }

    console.log("END OF POST /TRACK-WORKOUT");
    res.json("success");
});

// ////------------------------------- /view-basic-wo-data route ---------------------------------------------- //
app.get("/view-basic-wo-data", async (req, res) => {
    console.log("We're in /view-basic-wo-data!");
    const id = req.session.userId;

    let woData = {};

    try {
        const { rows } = await db.getWoSessions(id);
        console.log("rows db.getWoSessions(): ", rows);

        let test = "123456789";
        test = test.substring(0, 5);

        console.log("test: ", test);

        let seshIds = rows.map((sesh) => {
            return sesh.id;
        });

        let seshData = rows.map((s) => {
            let date = `${s.created_at}`;
            date = date.substring(4, 15);
            const session = {
                seshId: s.id,
                woName: s.workout_name,
                woId: s.workout_id,
                date,
            };
            return session;
        });
        console.log("seshIds: ", seshIds);

        // for (const s of seshData) {
        //     const res = await db.getTrackedExers(s.seshId);
        //     let exercises = [];
        //     for (const r of res.rows) {
        //         exercises.push(r.exer_name);
        //     }
        //     s.exers = exercises;
        // }
        for (const s of seshData) {
            const res = await db.getTrackedExers(s.seshId);
            let exercises = [];
            for (const r of res.rows) {
                exercises.push({
                    exerName: r.exer_name,
                    exerId: r.exercise_id,
                });
            }
            s.exers = exercises;
        }

        //get sets

        for (const s of seshData) {
            for (const ex of s.exers) {
                const res = await db.getTrackedSets(s.seshId, ex.exerId);
                // console.log("res.rows: ", res.rows);
                ex.sets = res.rows;
            }
        }
        // console.log("seshData[0].exers: ", seshData[0].exers[0].sets);

        console.log("seshData: ", seshData);
        res.json(seshData);
    } catch (e) {
        console.log("ERROR in /view-basic-wo-data: ", e);
    }
});

////------------------------------- * route ---------------------------------------------- //

app.get("*", function (req, res) {
    console.log("We're in * !");

    if (!req.session.userId) {
        res.redirect("/welcome");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

////-------------------------------  Port ---------------------------------------------- //

// app.listen(8080, function () {
//     console.log("trackerX server listening...");
// });

//for heroku
app.listen(process.env.PORT || 8080, function () {
    console.log("trackerX server listening...");
});
