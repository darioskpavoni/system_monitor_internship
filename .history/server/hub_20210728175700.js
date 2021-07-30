// This code is the BACK-END!

// HTTP server with EXPRESS
import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);

/* When using Node.js, __dirname doesn't exist. I need to use this code to define it */
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/*  */

import path from "path";
const publicPath = path.join(__dirname, "../static/views");

app.use("/static", express.static("../static"));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "/index.html"));
});

// Import socket.io with function which takes our http server as an argument
import socketio from "socket.io";
const io = socketio(server, {
  cors: { origin: "*" }, // basically allowing any URL to access our back-end URL
});

// Logic for socket.io -> we have an EVENT-BASED system
io.on("connection", (socket) => {
  console.log("User connected");

  // we can listen to any custom event we want. For simplicity, we call it the 'message' event
  socket.on("message", (message) => {
    console.log(message);
    // we have multiple clients listening to the message event so we re-emit it
    io.emit("message", `${socket.id.substr(0, 2)} said ${message}`);
  });

  // getting cpuUsage from client side
  /* socket.on('cpuUsage', (package) => {
        console.log(`${package.id} said ${package.cpuUsage}`);
        io.emit('cpuUsage', package);
    }) */

  /* socket.on('test', (message) => {
        console.log(message);
    }) */

  socket.on("sysData", (sysData) => {
    console.log(sysData);
    io.emit("sysData", sysData);
  });

  socket.on("disconnect", (sysData) => {
    let disconnectedUserId = sysData.id;
    console.log(`User ${disconnectedUserId} disconnected`);
    io.emit("disconnectedUser", disconnectedUserId);
  });
});

// Final part, telling our server to listen on port 3001
server.listen(3001, "0.0.0.0", () => {
  console.log("Listening to port: 3001");
});
