// This code is the BACK-END!

// HTTP server with EXPRESS
const { Socket } = require('dgram');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const path = require('path');
const publicPath = path.join(__dirname, '../views');

app.use("/static", express.static('../static/'));

app.get('/', (req,res) => {
    res.sendFile(path.join(publicPath,'/index.html'));
})

// Import socket.io with function which takes our http server as an argument
const io = require('socket.io')(server, {
    cors: { origin: '*' } // basically allowing any URL to access our back-end URL
});

// Logic for socket.io -> we have an EVENT-BASED system
io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
    
    // we can listen to any custom event we want. For simplicity, we call it the 'message' event
    socket.on('message', (message) => {
        console.log(message);
        // we have multiple clients listening to the message event so we re-emit it
        io.emit('message', `${socket.id.substr(0,2)} said ${message}`);
    });

    socket.on('cpuUsage', (cpuUsage) => {
        console.log(`${socket.id.substr(0,2)} said ${cpuUsage}`);
        io.emit('cpuUsage', cpuUsage);
        })

});

// Final part, telling our server to listen on port 3001
server.listen(3001, () => {
    console.log('Listening on http://localhost:3001');
})