const io = require('socket.io-client');
const socket = io("ws://localhost:3001");

const random0_100 = () => {
    return Math.floor(Math.random() * (100 - 0 + 1) + 0);
}

let sysData = {
    'id': Date.now(),
    'CPU_usage': `${random0_100()}%`,
    'RAM_usage': `${random0_100()}%`,
    'RAM_free': `${random0_100()*0.08}GB` // random numbers
}

socket.on('connect',() => {
    setInterval(() => {
        socket.emit('test', sysData);
        /* socket.emit('sysData', sysData); */
    }, 2500);
})