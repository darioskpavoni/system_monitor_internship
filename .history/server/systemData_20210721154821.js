const socket = io('ws://localhost:3001');

socket.on('connection', (socket) => {
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100);
})

