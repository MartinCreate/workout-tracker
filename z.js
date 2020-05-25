// const bla = [
//     { here: "is an object", prop2: 2 },
//     { here: "is another object", prop2: 21 },
// ];

import { decodeBase64 } from "bcryptjs";

// let test;

// [...test] = bla;

// console.log("test: ", test);

//////------------------------------------ Notes for additional features ------------------------------------//

// ----------- 2. Currently online members -----------//
//---Grabbing info about multiple users at once from a database
let onlineUsers = [1, 2, 44];

//in db.js
function getUsersByIds(arrayOfIds) {
    const query = `
    SELECT id, first, last, pic
    FROM users
    WHERE id= ANY($1)`;
    return db.query(query, [arrayOfIds]);
}

//---Listening for connection
socket.on("disconnect", function () {
    //do smt when user disconnects from socket (i.e. logs out of site);
    //remove disconnected user from onlineUsers array
});

//things to consider:
//-what if user is logged in on multiple different devices (requires you to not only keep track of the userId, but the socket Ids) so, instead of of just array of users, we'd have:
let onlineUsers = [
    {
        id: 1,
        socketId: ["jdahlsdfkjashdlfajh"],
    },
    {
        id: 143,
        socketId: ["fahjdfhajsdfl", "h984h938fh3", "haflkjerha"],
    },
    {
        id: 49,
        socketId: ["f98h598f3"],
    },
];

// ----------- 3. Private Messages -----------//
//----Back-end: add a receiver_id to the table

//----Front-end: keep track of socket id of logged in user
//--emit to specific socket
// sending to individual socketid (private message)
io.to(socketId).emit("hey", "I just met you");

// ----------- 4. Wall Posts -----------//
//--pay attention to meta tags
