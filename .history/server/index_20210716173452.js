// This code is the BACK-END!

// HTTP server with built-in library -> ALTERNATIVE: EXPRESS
const http = require('http').createServer();

// Import socket.io with function which takes our http server as an argument
const io = require('socket.io')(http, {
    cors: { origin: '*' } // basically allowing any URL to access our back-end URL
});

// Logic for socket.io -> we have an EVENT-BASED system

console.log('TEST');

io.on('connection', (socket) => {
    console.log('User connected ' + socket.id);
    
    // we can listen to any custom event we want. For simplicity, we call it the 'message' event
    socket.on('message', (message) => {
        console.log(message);
        // we have multiple clients listening to the message event so we re-emit it
        io.emit(message, `${socket.id.substr(0,2)} said ${message}`);
    })
})

// Final part, telling our server to listen on port 8080
http.listen(3001, () => {
    console.log('Listening on http://localhost:3001');
})