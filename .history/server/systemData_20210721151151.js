
const socket = io('ws://localhost:3001');

const io = require('socket.io')(server, {
    cors: { origin: '*' } // basically allowing any URL to access our back-end URL
});

socket.on('connection', () => {
    console.log('User connected');
    setInterval(() => {
        io.emit('test',`Test message`);
    }, 100);
})