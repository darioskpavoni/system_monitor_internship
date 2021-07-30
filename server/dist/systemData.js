"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_client_1 = __importDefault(require("socket.io-client"));
// For Disk Info command
var child_process_1 = require("child_process");
var os_utils_1 = require("os-utils");
var socket = socket_io_client_1.default("http://192.168.0.231:3001");
var random0_100 = function () {
    return Math.floor(Math.random() * (100 - 0 + 1) + 0);
};
/* DISK INFO DATA FIRST CALCULATION */
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
            (temp[j][10] / Math.pow(1024, 3)).toFixed(1) + "GB",
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
var diskUsed = [];
for (var i = 0; i < diskData.length; i++) {
    diskUsed.push(["" + diskData[i][0], "" + diskData[i][5]]);
}
/* console.log(diskUsed); */
// Selecting disk free data
var diskFree = [];
for (var i = 0; i < diskData.length; i++) {
    diskFree.push(["" + diskData[i][0], "" + diskData[i][2]]);
}
/* console.log(diskFree); */
/* --------------------------------------------- */
// Sample object for system data
var sysData = {
    id: Date.now(),
    CPU_usage: random0_100() + "%",
    RAM_usage: random0_100() + "%",
    RAM_free: random0_100() * 0.08 + "GB",
    DISK_used: diskUsed,
    DISK_free: diskFree,
};
// Function to refresh system data except ID
var sysDataRefresh = function (sysData) {
    var value;
    os_utils_1.cpuUsage(function (v) {
        sysData.CPU_usage = (v * 100).toFixed(1) + "%";
    });
    /* console.log(sysData.CPU_usage); */
    sysData.RAM_usage = (((os_utils_1.totalmem() - os_utils_1.freemem()) * 100) /
        os_utils_1.totalmem()).toFixed(1) + "%";
    sysData.RAM_free = (os_utils_1.freemem() / 1000).toFixed(2) + "GB";
    // DISK data refresh
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
                (temp[j][10] / Math.pow(1024, 3)).toFixed(1) + "GB",
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
    // Refreshing disk used data
    diskUsed = []; // Emptying the array otherwise we get duplicated data
    for (var i = 0; i < diskData.length; i++) {
        diskUsed.push(["" + diskData[i][0], "" + diskData[i][5]]);
    }
    /* console.log(diskUsed); */
    sysData.DISK_used = diskUsed;
    // Refreshing disk free data
    diskFree = [];
    for (var i = 0; i < diskData.length; i++) {
        diskFree.push(["" + diskData[i][0], "" + diskData[i][2]]);
    }
    sysData.DISK_free = diskFree;
};
socket.on("connect", function () {
    setInterval(function () {
        // Refresh system data
        sysDataRefresh(sysData);
        // Emit data
        socket.emit("sysData", sysData);
        /* socket.emit('test', sysData); */
        /* console.log(sysData); */
        console.log(new Date() + " - Sending system data...");
    }, 2500);
});
