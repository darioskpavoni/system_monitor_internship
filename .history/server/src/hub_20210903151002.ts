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

// getting to views folder (publicPath) from hub.ts file path
/* IDENTIFY CURRENT OS */
const isWin= process.platform === "win32";
const isLinux = process.platform === "linux";

const filename = process.cwd() + "\\hub.ts";;
let dirname_string = dirname(filename);
let publicPath = "";

if (isWin) {

} else if (isLinux) {
  filename = 
  dirname_string = ;
  publicPath = path.join(dirname_string, "./static/views");
}


// express.static() is used to manage static files (js, CSS, HTML) so that we can load them directly (eg. http://localhost:3000/static/css/style.css)
// the first argument is the mount path for the static directory
app.use("/static", express.static("../static"));
// app.get() lets me define a route handler for GET requests to a given URL
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "/index.html"));
});

/* Creating a socket.io server instance */
const io = new Server(server, {
    cors: { origin: "*" },
  });

// Handling socket.io events
io.on('connection', (socket) => {
    console.log(`SERVER: User connected`)
    // Most important event which triggers the creation of the client-side HTML
    socket.on("sysData", (sysData) => {
        /* console.log(sysData); */
        io.emit("sysData", sysData);
    });
    socket.on("disconnect", (sysData: any) => { // FIX
        console.log(`SERVER: User ${sysData.id} disconnected`);
        io.emit("disconnectedUser", sysData.id);
    });
})

// Telling the server to listen to port 3001
// 0.0.0.0 -> server will run on all available interfaces
server.listen(3001, "0.0.0.0", () => {
    console.log("Listening to port: 3001");
  });
