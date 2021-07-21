// This code is the BACK-END!

// HTTP server with EXPRESS
const { Socket } = require('dgram');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);


const path = require('path');
const publicPath = path.join(__dirname, '../views');

/* app.use("/static", express.static('../static/'));

app.get('/', (req,res) => {
    res.sendFile(path.join(publicPath,'/index.html'));
})
 */
// Import socket.io with function which takes our http server as an argument
const io = require('socket.io')(server, {
    cors: { origin: '*' } // basically allowing any URL to access our back-end URL
});

// Logic for socket.io -> we have an EVENT-BASED system
io.on('connection', (socket) => {
    console.log('TEST');

    io.emit('test',`TEST`);

});

// Final part, telling our server to listen on port 3001
server.listen(3001, () => {
    console.log('Listening on http://localhost:3001');
})