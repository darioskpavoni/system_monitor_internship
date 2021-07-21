const io = require('socket.io-client');
const socket = io('ws://localhost:3001');

io.on('connect',() => {
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100);
})