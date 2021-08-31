import { io } from "socket.io-client";
const socket = io("ws://192.168.0.231:3001"); 

// Creating object to contain all timers used to delete not updated data on page
let timers = {}; 

// Interface + type. Better to include this in a separate file
type diskInfo = [string, number];
interface IsysData {
    id: number;
    CPU_usage: number[];
    RAM_usage: number[];
    RAM_free: number[];
    DISK_used: diskInfo[];
    DISK_free: diskInfo[];
}

socket.on("sysData", (sysData) => {
    if (!timers[sysData.id]) {
        timers[sysData.id] = []; // Creating an array which will contain up to 2 timers at a time for every user. Look down for info
      }
})