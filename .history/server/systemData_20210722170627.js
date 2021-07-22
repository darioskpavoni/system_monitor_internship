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

/* --------------- CPU LOAD --------------- */
var _  = require("underscore");
var interval = 1;
var old = _.map(os.cpus(),function(cpu){ return cpu.times;})
setInterval(function() {
    var result = [];
    var current = _.map(os.cpus(),function(cpu){ return cpu.times; })
    _.each(current, function(item,cpuKey){
        result[cpuKey]={}

        var oldVal = old[cpuKey];
        _.each(_.keys(item),function(timeKey){
            var diff = (  parseFloat((item[timeKey]) - parseFloat(oldVal[timeKey])) / parseFloat((interval*100)));
            var name = timeKey;
            if(timeKey == "idle"){
                name = "CPU"        
                diff = 100 - diff;
            }
            //console.log(timeKey + ":\t" + oldVal[timeKey] + "\t\t" + item[timeKey] + "\t\t" + diff);  
            result[cpuKey][name]=diff.toFixed(0);
        });
    });
    console.log(result);
    old=current;
}, (interval * 1000));
/* --------------- -------- --------------- */


// Function to refresh system data except ID
const sysDataRefresh = (sysData) => {
    sysData.CPU_usage = `${random0_100()}%`;
    sysData.RAM_usage = `${(((os.totalmem()-os.freemem())*100)/os.totalmem()).toFixed(1)}%`;
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

