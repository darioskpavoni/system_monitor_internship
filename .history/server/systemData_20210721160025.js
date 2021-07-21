const io = require('socket.io');
io.connect('http://localhost:3001');

io.on('connection',() => {
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100);
})

