const io = require('socket.io');
const socket = io('ws://localhost:3001');

io.on('connection',() => {
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100);
})

