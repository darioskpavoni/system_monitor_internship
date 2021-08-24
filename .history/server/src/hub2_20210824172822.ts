import express from 'express';
import http from "http";
import { dirname } from "path";
import { Server } from "socket.io";
import path from "path";

const app = express();
const server = http.createServer(app);

const __filename = process.cwd() + "\\hub.js";
const __dirname = dirname(__filename);
const publicPath = path.join(__dirname, "../static/views");

app.use("/static", express.static("../static"));
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "/index.html"));
});

const io = new Server(server, {
    cors: { origin: "*" },
  });

io.on('connection', (socket) => {
    console.log(`SERVER: User connected`)
    // EVENTS
    socket.on("sysData", (sysData) => {
        console.log(sysData);
        io.emit("sysData", sysData);
    });
    socket.on("disconnect", (sysData: any) => { // FIX
        console.log(`SERVER: User ${sysData.id} disconnected`);
        io.emit("disconnectedUser", sysData.id);
      });
})

