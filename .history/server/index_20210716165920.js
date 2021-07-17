// This code is the BACK-END!

// HTTP server with built-in library -> ALTERNATIVE: EXPRESS
const http = require('http').createServer();

// Import socket.io with function which takes our http server as an argument
const io = require('socket.io')(http, {
    cors: { origin: '*' } // basically allowing any URL to access our back-end URL
});

// Logic for socket.io -> we have an EVENT-BASED system

io.on('connection', (socket) => {
    console.log('User connected ' + socket.id);
    
})
