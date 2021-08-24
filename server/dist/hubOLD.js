"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var app = express_1.default();
var http_1 = __importDefault(require("http"));
var server = http_1.default.createServer(app);
var path_1 = require("path");
var socket_io_1 = require("socket.io");
var __filename = process.cwd() + "\\hub.js";
var __dirname = path_1.dirname(__filename);
var path_2 = __importDefault(require("path"));
var publicPath = path_2.default.join(__dirname, "../static/views");
app.use("/static", express_1.default.static("../static"));
app.get("/", function (req, res) {
    res.sendFile(path_2.default.join(publicPath, "/index.html"));
});
// Import socket.io with function which takes our http server as an argument
var io = new socket_io_1.Server(server, {
    cors: { origin: "*" }, // basically allowing any URL to access our back-end URL
});
// Logic for socket.io -> we have an EVENT-BASED system
io.on("connection", function (socket) {
    console.log("User connected");
    // we can listen to any custom event we want. For simplicity, we call it the 'message' event
    socket.on("message", function (message) {
        console.log(message);
        // we have multiple clients listening to the message event so we re-emit it
        io.emit("message", socket.id.substr(0, 2) + " said " + message);
    });
    var data = [];
    socket.on("sysData", function (sysData) {
        console.log(sysData);
        io.emit("sysData", sysData);
    });
    socket.on("disconnect", function (sysData) {
        var disconnectedUserId = sysData.id;
        console.log("User " + disconnectedUserId + " disconnected");
        io.emit("disconnectedUser", disconnectedUserId);
    });
});
// Final part, telling our server to listen on port 3001
server.listen(3001, "0.0.0.0", function () {
    console.log("Listening to port: 3001");
});
