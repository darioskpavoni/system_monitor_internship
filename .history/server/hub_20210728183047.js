import express from "express";
import http from "http";
import { fileURLToPath } from "url"; /* When using Node.js, __dirname doesn't exist. I need to use this code to define it */
import { dirname } from "path";
import path from "path";
import { Server } from "socket.io";

// This code is the BACK-END!

// HTTP server with EXPRESS

const app = express();

const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = path.join(__dirname, "../static/views");

app.use("/static", express.static("../static"));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "/index.html"));
});

// Import socket.io with function which takes our http server as an argument

const io = new Server(server, {
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