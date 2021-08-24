"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var path_1 = require("path");
var socket_io_1 = require("socket.io");
var path_2 = __importDefault(require("path"));
/* Creating an Express application */
// app is a request handler function that has properties. It can be passed as an argument for the http server 
var app = express_1.default();
// creating an http server
var server = http_1.default.createServer(app);
// getting hub.js file path
var __filename = process.cwd() + "\\hub.ts";
// hub.js parent folder
var __dirname = path_1.dirname(__filename);
var publicPath = path_2.default.join(__dirname, "../static/views");
console.log(publicPath);
app.use("/static", express_1.default.static("../static"));
app.get("/", function (req, res) {
    res.sendFile(path_2.default.join(publicPath, "/index.html"));
});
var io = new socket_io_1.Server(server, {
    cors: { origin: "*" },
});
io.on('connection', function (socket) {
    console.log("SERVER: User connected");
    // EVENTS
    socket.on("sysData", function (sysData) {
        /* console.log(sysData); */
        io.emit("sysData", sysData);
    });
    socket.on("disconnect", function (sysData) {
        console.log("SERVER: User " + sysData.id + " disconnected");
        io.emit("disconnectedUser", sysData.id);
    });
});
server.listen(3001, "0.0.0.0", function () {
    console.log("Listening to port: 3001");
});
