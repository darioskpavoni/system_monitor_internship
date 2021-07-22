const io = require('socket.io-client');
const socket = io("ws://localhost:3001");

const os = require('os');

const random0_100 = () => {
    return Math.floor(Math.random() * (100 - 0 + 1) + 0);
}

// Sample object for system data
let sysData = {
    'id': Date.now(),
    'CPU_usage': `${random0_100()}%`,
    'RAM_usage': `${random0_100()}%`,
    'RAM_free': `${random0_100()*0.08}GB` // random numbers
}

// Function to refresh system data except ID
const sysDataRefresh = (sysData) => {
    sysData.CPU_usage = `${random0_100()}%`;
    sysData.RAM_usage = `${(((os.totalmem()-os.freemem())*100)/os.totalmem()).toFixed(2)}%`;
    sysData.RAM_free = `${(os.freemem()/1000000000).toFixed(2)}GB`;
}

socket.on('connect',() => {
    setInterval(() => {
        // Refresh system data
        sysDataRefresh(sysData);
        // Emit data
        socket.emit('sysData', sysData);
        
        /* socket.emit('test', sysData); */ 
        
    }, 2500);
})