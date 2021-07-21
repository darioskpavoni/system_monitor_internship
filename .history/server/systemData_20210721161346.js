const io = require('socket.io');
io.connect();

io.on("connection", (socket) => { 
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100); 
});

httpServer.listen(3001);