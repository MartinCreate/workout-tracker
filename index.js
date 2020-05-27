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

////------------------------------- /submit-exercise ---------------------------------------------- //
app.post("/submit-exercise", async (req, res) => {
    console.log("We're in /submit-exercise!");
    console.log("req.body in /submit-exercise: ", req.body);
    const bod = req.body;
    const myId = req.session.userId;
    const { exName, sets } = req.body;

    try {
        let exerId;

        const check = await db.checkExercise(myId, exName);

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
    } catch (e) {
        console.log("ERROR in /submit-exercise: ", e);
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
            await db.deleteWrktTags(myId, wrktId);
            await db.deleteExersByWrkt(myId, wrktId);
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

        let exerIds = [];
        for (const exer of exers) {
            console.log("exer in loop: ", exer);
            const { rows } = await db.checkExercise(id, exer);
            exerIds.push(rows[0].exer_id);
        }
        console.log("exerIds: ", exerIds);

        for (const exer of exers) {
            const ind = exers.indexOf(exer);
            console.log("ind of current exer in loop: ", ind);
            await db.insertExersByWrkt(id, wrktId, exerIds[ind]);
        }

        console.log("END OF /SAVE-WORKOUT");
    } catch (e) {
        console.log("ERROR in /save-workout: ", e);
    }
});

////------------------------------- /track-workout ---------------------------------------------- //
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
    let woTags = respWoTags.rows.map((tag) => {
        return tag.wo_tags;
    });
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

// ////------------------------------- /upload-image route ---------------------------------------------- //
// //uploader.single('propertyKey from formData') runs the multer code from the boilerplate above
// app.post("/upload-profile", uploader.single("file"), s3.upload, (req, res) => {
//     const { user_id } = req.body;

//     if (req.file) {
//         db.updateImgUrl(
//             //this url is copied from aws page of image (without the id-characters at the end)
//             "https://martinpaul-msg-socialnetwork.s3.eu-central-1.amazonaws.com/" +
//                 req.file.filename,
//             user_id
//         )
//             .then(({ rows }) => {
//                 const resp = rows[0];
//                 res.json({
//                     resp,
//                 });
//             })
//             .catch((err) => {
//                 console.log("ERROR in updateImgUrl: ", err);
//                 res.json({
//                     success: false,
//                 });
//             });
//     } else {
//         res.json({
//             success: false,
//         });
//     }
// });

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

app.listen(8080, function () {
    console.log("trackerX server listening...");
});
