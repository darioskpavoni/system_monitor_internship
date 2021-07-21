
const io = require('socket.io');
const socket = io('http://localhost:3001');

io.on('connection',() => {
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100);
})

