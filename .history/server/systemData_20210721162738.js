const io = require('socket.io-client');
const socket = io("ws://localhost:3001");

socket.on('connect',() => {
    setInterval(() => {
        socket.emit('test',`TEST`);
    }, 100);
})