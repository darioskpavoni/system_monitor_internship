const io = require('socket.io-client');
const socket = io("http://localhost:3001");

// For Disk Info command
const execSync = require('child_process').execSync;

const os = require('os-utils');

const random0_100 = () => {
    return Math.floor(Math.random() * (100 - 0 + 1) + 0);
}

/* DISK INFO DATA FIRST CALCULATION */

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
    // Selecting disk used data
    let diskUsed = [];
    for (let i = 0; i<diskData.length; i++) {
        diskUsed.push(
            [
                `${diskData[0]}`,
                `${diskData[2]}`
            ]
        )
    }

    // Selecting disk free data
    let diskFree = [];
    for (let i = 0; i<diskData.length; i++) {
        diskFree.push(
            [
                `${diskData[0]}`,
                `${diskData[2]}`
            ]
        )
    }
/* --------------------------------------------- */

// Sample object for system data
let sysData = {
    'id': Date.now(),
    'CPU_usage': `${random0_100()}%`,
    'RAM_usage': `${random0_100()}%`,
    'RAM_free': `${random0_100()*0.08}GB`, // random numbers
    'DISK_used': diskUsed,
    'DISK_free': diskFree
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

    // DISK data refresh
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
        let partitionName = temp[j][19];
        if (partitionName != undefined) {
            diskData.push( 
                [
                `${temp[j][1]}`, // Partition letter
                `${temp[j][19]}`,  // Partition name
                `${(temp[j][10]/Math.pow(1024, 3)).toFixed(1)}GB`, // Partition used space
                `${(temp[j][14]/Math.pow(1024, 3)).toFixed(1)}GB`  // Partition free space
                ]
            );
        }
        
    }
    // Refreshing disk used data
    for (let i = 0; i<diskData.length; i++) {
        diskUsed.push(
            [
                `${diskData[i][0]}`,
                `${diskData[i][2]}`
            ]
        )
    }
    sysData.DISK_used = diskUsed;

    // Refreshing disk free data
    let diskFree = [];
    for (let i = 0; i<diskData.length; i++) {
        diskFree.push(
            [
                `${diskData[i][0]}`, // TO FIX. DO TOTAL SPACE - USED
                `${diskData[i][3]}`
            ]
        )
    }
    sysData.DISK_free = diskFree;

}

socket.on('connect',() => {
    setInterval(() => {
        // Refresh system data
        sysDataRefresh(sysData);
        // Emit data
        socket.emit('sysData', sysData);
        /* socket.emit('test', sysData); */ 
        console.log(sysData);
        
    }, 2500);
})

