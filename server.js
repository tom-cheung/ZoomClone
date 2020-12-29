const express = require("express")
const app = express(); 

const http = require("http"); // built in node module 
const server = http.createServer(app); // app is handling the requests sent to this server 

const socket = require("socket.io");
const io = socket(server); // passing in the instance of our server to socket

const rooms = {};

io.on("connection", socket => { // listens for "connection" event, which generates a socket object. This is triggered when a user on a browser hits a particular page 

    // console.log((new Date()).getTime())
    console.log(socket.id)

    socket.on("join room", roomID => { // applying a event listener to the socket generated, which listens for "join room", which is a event fired off from the CLIENT side 
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }
        // listens for the join room event. This event is triggered when someone creates a room on the fronend or joins 
        // a room. 
        // the event is emited with the room id which is just grabbed from the url 
        // here it checks to see if the room id exists within the rooms object declared on line 10
        // if it does it pushes the socket.id (the id of the )

        const otherUser = rooms[roomID].find(id => id !== socket.id);

        if (otherUser) {
            socket.emit("other user", otherUser);
            socket.to(otherUser).emit("user joined", socket.id)
        }

       
        // on this event, do this. 
        socket.on("offer", payload => { // caller, makes the call, and supplies a payload 
            io.to(payload.target).emit("offer", payload);
        });

        socket.on("answer", payload => { // receiver, answers the call and responds with a payload 
            io.to(payload.target).emit("answer", payload)
        });

        socket.on("ice-candidate", incoming => { // established a proper connection 
            io.to(incoming.target).emit("ice-candidate", incoming.candidate)
        })

    })
})

// app.get("/", (req, res) => {
//     res.json({msg: "Welcome to Tom's Video Chat App"})
// })

server.listen(8000, console.log("listening on port 8000"))

// the purpose of the server is to allow users to connect 