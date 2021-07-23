const io = require('socket.io-client');
const socket = io("http://localhost:3001");

// For Disk Info command
const execSync = require('child_process').execSync;

const os = require('os-utils');

const random0_100 = () => {
    return Math.floor(Math.random() * (100 - 0 + 1) + 0);
}

/* DISK INFO DATA RETRIEVAL */
const output = execSync('wmic logicaldisk', {encoding: 'utf-8'});

const parsedOutput = output.split(/\r?\n/);
let temp = [];
/* console.log(parsedOutput); */
let diskData = [] // Final array

// Removes lots of whitespaces and replaces them with a single space
for (let i = 1; i<parsedOutput.length-2; i++) {
    temp.push(parsedOutput[i].replace(/\s+/g, ' '))
}
// Splits strings into array elements by space
for (let j = 0; j<temp.length; j++) {
    temp[j] = temp[j].split(" ");
    diskData.push( 
        [
        `${temp[j][1]}`, 
        `${temp[j][19]}`, 
        `${(temp[j][10]/Math.pow(1024, 3)).toFixed(1)}`,
        `${(temp[j][14]/Math.pow(1024, 3)).toFixed(1)}`
        ]
        );
}
/* --------------------------------------------- */



const parsedOutput = output.split(/\r?\n/);
let temp = [];
/* console.log(parsedOutput); */
let diskData = [] // Final object

// Sample object for system data
let sysData = {
    'id': Date.now(),
    'CPU_usage': `${random0_100()}%`,
    'RAM_usage': `${random0_100()}%`,
    'RAM_free': `${random0_100()*0.08}GB` // random numbers
}

// Function to refresh system data except ID
const sysDataRefresh = (sysData) => {
    let value;
    os.cpuUsage( (v) => {
        sysData.CPU_usage = `${(v*100).toFixed(1)}%`;
    })
    /* console.log(sysData.CPU_usage); */
    sysData.RAM_usage = `${(((os.totalmem()-os.freemem())*100)/os.totalmem()).toFixed(1)}%`;
    sysData.RAM_free = `${(os.freemem()/1000).toFixed(2)}GB`;
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

