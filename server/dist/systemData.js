"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_client_1 = __importDefault(require("socket.io-client"));
var socket = socket_io_client_1.default("http://192.168.0.231:3001");
// For Disk Info command
var child_process_1 = require("child_process");
var os_utils_1 = require("os-utils");
/* IDENTIFY CURRENT OS */
var isWin = process.platform === "win32";
var isLinux = process.platform === "linux";
/* ------------------- */
/* DISK INFO DATA FIRST CALCULATION */
var diskUsed = [];
var diskFree = [];
// WINDOWS
if (isWin) {
    var output = child_process_1.execSync("wmic logicaldisk", { encoding: "utf-8" });
    var parsedOutput = output.split(/\r?\n/);
    var temp = [];
    /* console.log(parsedOutput); */
    var diskData = []; // Final array
    // Removes lots of whitespaces and replaces them with a single space
    for (var i = 1; i < parsedOutput.length - 2; i++) {
        temp.push(parsedOutput[i].replace(/\s+/g, " "));
    }
    // Splits strings into array elements by space
    for (var j = 0; j < temp.length; j++) {
        temp[j] = temp[j].split(" ");
        var partitionName = temp[j][19];
        temp[j][14] = parseFloat(temp[j][14]);
        temp[j][14] = parseFloat(temp[j][10]);
        if (partitionName != undefined) {
            diskData.push([
                "" + temp[j][1],
                "" + temp[j][19],
                "" + (temp[j][10] / Math.pow(1024, 3)).toFixed(1),
                "" + (temp[j][14] / Math.pow(1024, 3)).toFixed(1),
                "" + ((temp[j][14] / Math.pow(1024, 3)).toFixed(1) -
                    (temp[j][10] / Math.pow(1024, 3)).toFixed(1)).toFixed(1),
                "" + ((((temp[j][14] / Math.pow(1024, 3)).toFixed(1) -
                    (temp[j][10] / Math.pow(1024, 3)).toFixed(1)).toFixed(1) /
                    (temp[j][14] / Math.pow(1024, 3)).toFixed(1)) *
                    100).toFixed(1),
            ]);
        }
    }
    // Selecting disk used data
    for (var i = 0; i < diskData.length; i++) {
        if (!isNaN(parseFloat(diskData[i][5]))) {
            diskUsed.push(["" + diskData[i][0], parseFloat(diskData[i][4])]);
        }
    }
    /* console.log(diskUsed); */
    // Selecting disk free data
    for (var i = 0; i < diskData.length; i++) {
        if (!isNaN(parseFloat(diskData[i][2])) && parseFloat(diskData[i][2]) !== 0) {
            diskFree.push(["" + diskData[i][0], parseFloat(diskData[i][2])]);
        }
    }
}
// END OF WINDOWS
// LINUX
else if (isLinux) {
    var output = child_process_1.execSync("df -h | grep ^/dev", { encoding: "utf-8" });
    var parsedOutput = output.split(/\n/);
    var temp = [];
    var temp2 = [];
    var diskData = [];
    // Splitting in different elements based on whitespaces
    for (var j = 0; j < parsedOutput.length - 1; j++) {
        temp[j] = parsedOutput[j].split(" ");
    }
    // Deleting empty elements
    for (var i = 0; i < temp.length; i++) {
        temp2.push([]);
        for (var j = 0; j < temp[i].length; j++) {
            if (temp[i][j] !== "") {
                temp2[i].push(temp[i][j]);
            }
        }
    }
    // Selecting elements of interest from temp2
    for (var i = 0; i < temp2.length; i++) {
        var partitionName = temp2[i][0];
        var partitionSizeGB = temp2[i][1];
        var partitionUsedGB = temp2[i][2];
        var partitionFreeGB = temp2[i][3];
        var partitionUsedPercent = temp2[i][4];
        var partitionFreePercent = 100 - parseFloat(partitionUsedPercent);
        if (partitionSizeGB.includes("G")) {
            diskData[i] = [];
            diskData[i].push(partitionName);
            diskData[i].push(partitionSizeGB.slice(0, -1));
            diskData[i].push(partitionUsedGB.slice(0, -1));
            diskData[i].push(partitionFreeGB.slice(0, -1));
            diskData[i].push(partitionUsedPercent.slice(0, -1));
            diskData[i].push(partitionFreePercent);
        }
    }
    // console.log(diskData);
    // Selecting disk used data
    for (var i = 0; i < diskData.length; i++) {
        if (!isNaN(parseFloat(diskData[i][2])) && parseFloat(diskData[i][2]) !== 0) {
            diskUsed.push(["" + diskData[i][0], parseFloat(diskData[i][2])]);
        }
    }
    /* console.log(diskUsed); */
    // Selecting disk free data
    for (var i = 0; i < diskData.length; i++) {
        if (!isNaN(parseFloat(diskData[i][3])) && parseFloat(diskData[i][3]) !== 0) {
            diskUsed.push(["" + diskData[i][0], parseFloat(diskData[i][3])]);
        }
    }
}
var sysData = {
    id: Date.now(),
    CPU_usage: [0],
    RAM_usage: [0, 0],
    RAM_free: [0, 0],
    DISK_used: diskUsed,
    DISK_free: diskFree,
};
console.log(sysData);
// Function to refresh system data except ID
var sysDataRefresh = function (sysData) {
    if (isWin) {
        // CPU USAGE
        os_utils_1.cpuUsage(function (v) {
            if (sysData.CPU_usage.length < 5) {
                sysData.CPU_usage.push(parseFloat((v * 100).toFixed(1))); // Outputing CPU usage as a float rather than a string
            }
            else if ((sysData.CPU_usage.length = 5)) {
                sysData.CPU_usage.shift();
                sysData.CPU_usage.push(parseFloat((v * 100).toFixed(1)));
            }
        });
        // RAM USAGE (used)
        sysData.RAM_usage[0] = parseFloat(((os_utils_1.totalmem() - os_utils_1.freemem()) / 1000).toFixed(2));
        sysData.RAM_usage[1] = parseFloat((((os_utils_1.totalmem() - os_utils_1.freemem()) * 100) / os_utils_1.totalmem()).toFixed(1));
        // RAM USAGE (free)
        sysData.RAM_free[0] = parseFloat((os_utils_1.freemem() / 1000).toFixed(2));
        sysData.RAM_free[1] = parseFloat((100 - sysData.RAM_usage[1]).toFixed(1));
        // DISK DATA
        var output = child_process_1.execSync("wmic logicaldisk", { encoding: "utf-8" });
        var parsedOutput = output.split(/\r?\n/);
        var temp = [];
        /* console.log(parsedOutput); */
        var diskData = []; // Final array
        // Removes lots of whitespaces and replaces them with a single space
        for (var i = 1; i < parsedOutput.length - 2; i++) {
            temp.push(parsedOutput[i].replace(/\s+/g, " "));
        }
        // Splits strings into array elements by space
        for (var j = 0; j < temp.length; j++) {
            temp[j] = temp[j].split(" ");
            var partitionName = temp[j][19];
            if (partitionName != undefined) {
                diskData.push([
                    "" + temp[j][1],
                    "" + temp[j][19],
                    "" + (temp[j][10] / Math.pow(1024, 3)).toFixed(1),
                    "" + (temp[j][14] / Math.pow(1024, 3)).toFixed(1),
                    "" + ((temp[j][14] / Math.pow(1024, 3)).toFixed(1) -
                        (temp[j][10] / Math.pow(1024, 3)).toFixed(1)).toFixed(1),
                    "" + ((((temp[j][14] / Math.pow(1024, 3)).toFixed(1) -
                        (temp[j][10] / Math.pow(1024, 3)).toFixed(1)).toFixed(1) /
                        (temp[j][14] / Math.pow(1024, 3)).toFixed(1)) *
                        100).toFixed(1),
                ]);
            }
        }
        // DISK USED
        diskUsed = []; // Emptying the array otherwise we get duplicated data
        for (var i = 0; i < diskData.length; i++) {
            if (!isNaN(parseFloat(diskData[i][4])) && parseFloat(diskData[i][4]) !== 0) {
                diskUsed.push(["" + diskData[i][0], parseFloat(diskData[i][4])]);
            }
        }
        /* console.log(diskUsed); */
        sysData.DISK_used = diskUsed;
        // DISK FREE
        diskFree = [];
        for (var i = 0; i < diskData.length; i++) {
            if (!isNaN(parseFloat(diskData[i][2])) && parseFloat(diskData[i][2]) !== 0) {
                diskFree.push(["" + diskData[i][0], parseFloat(diskData[i][2])]);
            }
        }
        sysData.DISK_free = diskFree;
    }
    else if (isLinux) {
        // CPU USAGE
        os_utils_1.cpuUsage(function (v) {
            if (sysData.CPU_usage.length < 5) {
                sysData.CPU_usage.push(parseFloat((v * 100).toFixed(1))); // Outputing CPU usage as a float rather than a string
            }
            else if ((sysData.CPU_usage.length = 5)) {
                sysData.CPU_usage.shift();
                sysData.CPU_usage.push(parseFloat((v * 100).toFixed(1)));
            }
        });
        // RAM USAGE (used)
        sysData.RAM_usage[0] = parseFloat(((os_utils_1.totalmem() - os_utils_1.freemem()) / 1000).toFixed(2));
        sysData.RAM_usage[1] = parseFloat((((os_utils_1.totalmem() - os_utils_1.freemem()) * 100) / os_utils_1.totalmem()).toFixed(1));
        // RAM USAGE (free)
        sysData.RAM_free[0] = parseFloat((os_utils_1.freemem() / 1000).toFixed(2));
        sysData.RAM_free[1] = parseFloat((100 - sysData.RAM_usage[1]).toFixed(1));
        // DISK DATA
        var output = child_process_1.execSync("df -h | grep ^/dev", { encoding: "utf-8" });
        var parsedOutput = output.split(/\n/);
        var temp = [];
        var temp2 = [];
        var diskData = [];
        // Splitting in different elements based on whitespaces
        for (var j = 0; j < parsedOutput.length - 1; j++) {
            temp[j] = parsedOutput[j].split(" ");
        }
        // Deleting empty elements
        for (var i = 0; i < temp.length; i++) {
            temp2.push([]);
            for (var j = 0; j < temp[i].length; j++) {
                if (temp[i][j] !== "") {
                    temp2[i].push(temp[i][j]);
                }
            }
        }
        // Selecting elements of interest from temp2
        for (var i = 0; i < temp2.length; i++) {
            var partitionName = temp2[i][0];
            var partitionSizeGB = temp2[i][1];
            var partitionUsedGB = temp2[i][2];
            var partitionFreeGB = temp2[i][3];
            var partitionUsedPercent = temp2[i][4];
            var partitionFreePercent = 100 - parseFloat(partitionUsedPercent);
            if (partitionSizeGB.includes("G")) {
                diskData[i] = [];
                diskData[i].push(partitionName);
                diskData[i].push(partitionSizeGB.slice(0, -1));
                diskData[i].push(partitionUsedGB.slice(0, -1));
                diskData[i].push(partitionFreeGB.slice(0, -1));
                diskData[i].push(partitionUsedPercent.slice(0, -1));
                diskData[i].push(partitionFreePercent);
            }
        }
        // console.log(diskData);
        // Selecting disk used data
        diskUsed = [];
        for (var i = 0; i < diskData.length; i++) {
            if (!isNaN(parseFloat(diskData[i][2])) && parseFloat(diskData[i][2]) !== 0) {
                diskUsed.push(["" + diskData[i][0], parseFloat(diskData[i][2])]);
            }
        }
        /* console.log(diskUsed); */
        sysData.DISK_used = diskUsed;
        // Selecting disk free data
        diskFree = [];
        for (var i = 0; i < diskData.length; i++) {
            if (!isNaN(parseFloat(diskData[i][3])) && parseFloat(diskData[i][3]) !== 0) {
                diskFree.push(["" + diskData[i][0], parseFloat(diskData[i][3])]);
            }
        }
        sysData.DISK_free = diskFree;
    }
};
socket.on("connect", function () {
    setInterval(function () {
        // Refresh system data
        sysDataRefresh(sysData);
        // Emit data
        socket.emit("sysData", sysData);
        console.log(sysData);
        console.log(new Date() + " - Sending system data...");
    }, 2500);
});
