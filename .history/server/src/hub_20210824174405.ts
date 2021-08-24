import express from 'express';
import http from "http";
import { dirname } from "path";
import { Server } from "socket.io";
import path from "path";

/* Creating an Express application */
// app is a request handler function that has properties. It can be passed as an argument for the http server 
const app = express();
// creating an http server
const server = http.createServer(app); 

const __filename = process.cwd() + "\\hub.js";
console.log(__filename);
const __dirname = dirname(__filename);
console.log(__dirname);
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
        /* console.log(sysData); */
        io.emit("sysData", sysData);
    });
    socket.on("disconnect", (sysData: any) => { // FIX
        console.log(`SERVER: User ${sysData.id} disconnected`);
        io.emit("disconnectedUser", sysData.id);
    });
})

server.listen(3001, "0.0.0.0", () => {
    console.log("Listening to port: 3001");
  });