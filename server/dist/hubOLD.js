"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(app);
const path_1 = require("path");
const socket_io_1 = require("socket.io");
const __filename = process.cwd() + "\\hub.js";
const __dirname = path_1.dirname(__filename);
const path_2 = __importDefault(require("path"));
const publicPath = path_2.default.join(__dirname, "../static/views");
app.use("/static", express_1.default.static("../static"));
app.get("/", (req, res) => {
    res.sendFile(path_2.default.join(publicPath, "/index.html"));
});
// Import socket.io with function which takes our http server as an argument
const io = new socket_io_1.Server(server, {
    cors: { origin: "*" },
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
