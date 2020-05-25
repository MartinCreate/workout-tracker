const aws = require("aws-sdk");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const ses = new aws.SES({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: "us-east-1", //EDIT THIS TO MATCH MY AWS REGION
});

//the 'to' that you pass to sendEmail can be any registered email, even with the pluses, e.g. martinpaul.career+banana@gmail.com
exports.sendEmail = (to, subject, text) => {
    return ses
        .sendEmail({
            Source: "martinfis@hotmail.de",
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Body: {
                    Text: {
                        Data: text,
                    },
                },
                Subject: {
                    Data: subject,
                },
            },
        })
        .promise()
        .then(() => console.log("it worked!"))
        .catch((err) => console.log("ERROR in sendEmail: ", err));
};

// //what David had
// exports.sendEmail = (to, subject, text) => {
//     return ses
//         .sendEmail({
//             Source: "martinfis@hotmail.de",
//             Destination: {
//                 ToAddresses: [to],
//             },
//             Message: {
//                 Body: {
//                     Text: {
//                         Data: text,
//                     },
//                 },
//                 Subject: {
//                     Data: subject,
//                 },
//             },
//         })
//         .promise();
// };
