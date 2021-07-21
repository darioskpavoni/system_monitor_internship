const io = require('socket.io');
const socket = io('ws://localhost:3001');

socket.on('connection',() => {
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100);
})

