const io = require('socket.io')(3001);

io.on('connection',() => {
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100);
})

