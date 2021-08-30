"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const child_process_1 = require("child_process");
const os_utils_1 = require("os-utils");
const socket = socket_io_client_1.default("http://192.168.0.231:3001");
/* IDENTIFY CURRENT OS */
const isWin = process.platform === "win32";
const isLinux = process.platform === "linux";
// Initialization of the sysData object
let sysData = {
    id: Date.now(),
    CPU_usage: [],
    RAM_usage: [],
    RAM_free: [],
    DISK_used: [],
    DISK_free: []
};
/* DISK INFO */
let diskUsed = [];
let diskFree = [];
// Calculation of disk info for Windows
const calculateDiskWin = () => {
    // Command for partition info
    const output = child_process_1.execSync("wmic logicaldisk", { encoding: "utf-8" });
    /* PARSING THE OUTPUT FROM THE COMMAND */
    // Splitting text on new lines
    const output0 = output.split(/\r?\n/);
    // Removing excessive whitespaces and replacing them with a single space. Array output1 contains data for each partition
    const output1 = [];
    for (let i = 1; i < output0.length - 2; i++) {
        output1.push(output0[i].replace(/\s+/g, " "));
    }
    // Splitting strings in output1 by space. The result is an array of arrays (any[]?)
    const output2 = [];
    // Emptying the two arrays to avoid redundancy
    diskUsed = [];
    diskFree = [];
    // Pushing in the two arrays the data I need, namely arrays of [partLetter, partUsedSpaceGB/partFreeSpaceGB]
    for (let i = 0; i < output1.length; i++) {
        output2[i] = output1[i].split(" ");
        // Picking out/elaborating what we need from output2[i]
        let partName = output2[i][19];
        let partLetter = output2[i][1];
        let partFreeSpaceGB = parseFloat((output2[i][10] / Math.pow(1024, 3)).toFixed(1));
        let partTotalSpaceGB = parseFloat((output2[i][14] / Math.pow(1024, 3)).toFixed(1));
        let partUsedSpaceGB = partTotalSpaceGB - partFreeSpaceGB;
        let partUsedSpacePercent = (partUsedSpaceGB / partTotalSpaceGB) / 100;
        if (partLetter !== undefined && partUsedSpacePercent !== 0) {
            diskUsed.push([partLetter, partUsedSpaceGB]);
            diskFree.push([partLetter, partFreeSpaceGB]);
        }
    }
};
// Calculation of disk info for Linux
// ...
/* REFRESHING PARAMETERS */
const refreshData = (sysData) => {
    /* CPU USAGE */
    os_utils_1.cpuUsage((value) => {
        let currentCpuUsage = parseFloat((value * 100).toFixed(1));
        if (sysData.CPU_usage.length < 5) {
            sysData.CPU_usage.push(currentCpuUsage);
        }
        else if (sysData.CPU_usage.length = 5) {
            sysData.CPU_usage.shift();
            sysData.CPU_usage.push(currentCpuUsage);
        }
    });
    /* RAM */
    // Used
    let usedRAMGB = parseFloat(((os_utils_1.totalmem() - os_utils_1.freemem()) / 1000).toFixed(2));
    let usedRAMpercent = parseFloat((((os_utils_1.totalmem() - os_utils_1.freemem()) * 100) / os_utils_1.totalmem()).toFixed(1));
    // Emptying array to avoid redundancy
    sysData.RAM_usage = [];
    sysData.RAM_usage.push(usedRAMGB, usedRAMpercent);
    // Free
    let freeRAMGB = parseFloat((os_utils_1.freemem() / 1000).toFixed(2));
    let freeRAMpercent = parseFloat((100 - sysData.RAM_usage[1]).toFixed(1));
    // Emptying array to avoid redundancy
    sysData.RAM_free = [];
    sysData.RAM_free.push(freeRAMGB, freeRAMpercent);
    /* DISK */
    if (isWin) {
        calculateDiskWin();
    }
    else if (isLinux) {
        // calculateDiskLinux();
    }
    sysData.DISK_used = diskUsed;
    sysData.DISK_free = diskFree;
};
// socket.io logic
socket.on("connect", () => {
    setInterval(() => {
        // Calling function for system data refresh
        refreshData(sysData);
        // Emitting collected data
        socket.emit("sysData", sysData);
        console.log(sysData);
    }, 2500);
});
