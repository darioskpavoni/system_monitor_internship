const io = require('socket.io');
io(http://localhost:3001);

io.on('connect',() => {
    io.emit('test',`TEST`);
})