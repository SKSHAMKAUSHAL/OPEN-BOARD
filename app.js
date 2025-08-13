const express = require("express");
const socket = require("socket.io");
const cors = require("cors");

const app = express();

// Allow CORS for frontend
app.use(cors({
    origin: "*", // In production, replace "*" with your frontend URL
    methods: ["GET", "POST"]
}));

// Serve public folder
app.use(express.static("public"));

let port = process.env.PORT || 5000;
let server = app.listen(port, () => {
    console.log("Listening to port " + port);
});

// Enable CORS for Socket.IO
let io = socket(server, {
    cors: {
        origin: "*", // Or "http://127.0.0.1:5501"
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Made socket connection");

    socket.on("beginPath", (data) => {
        io.sockets.emit("beginPath", data);
    });

    socket.on("drawStroke", (data) => {
        io.sockets.emit("drawStroke", data);
    });

    socket.on("redoUndo", (data) => {
        io.sockets.emit("redoUndo", data);
    });
});
