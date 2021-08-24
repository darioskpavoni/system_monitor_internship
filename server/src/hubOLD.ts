import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);

import { fileURLToPath } from "url";
import { dirname } from "path";

import { Server } from "socket.io";

const __filename = process.cwd() + "\\hub.js";
const __dirname = dirname(__filename);

import path from "path";
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

  let data = [];

  socket.on("sysData", (sysData) => {
    console.log(sysData);
    io.emit("sysData", sysData);
  });

  socket.on("disconnect", (sysData: any) => {
    let disconnectedUserId = sysData.id;
    console.log(`User ${disconnectedUserId} disconnected`);
    io.emit("disconnectedUser", disconnectedUserId);
  });
});

// Final part, telling our server to listen on port 3001
server.listen(3001, "0.0.0.0", () => {
  console.log("Listening to port: 3001");
});
