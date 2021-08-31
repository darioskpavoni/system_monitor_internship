import { io } from "socket.io-client";
const socket = io("ws://192.168.0.231:3001"); 

// Creating object to contain all timers used to delete not updated data on page
let timers: any[] = []; 

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

socket.on("sysData", (sysData: IsysData) => {
    if (!timers[sysData.id]) {
        timers[sysData.id] = []; // Creating an array which will contain up to 2 timers at a time for every user. Look down for info
    }
    timers[sysData.id].push(
        setTimeout(() => {
          let e = document.getElementById(`${sysData.id}`);
          if (e !== null) {
              e.remove();
          }
          console.log(`Deleting node ${sysData.id}`);
        }, 4000)
    );
    if (timers[sysData.id].length > 1) {
        // Idea is that for every user I have an array of timers. At the beginning I have 0 timers, one is created. Then another one is created. Array length is now 2, I delete the first timer from the array and clear the timer. Then another timer is created and the first one (which was the second originally) gets deleted and cleared, and so on.
        const t = timers[sysData.id].shift();
        clearTimeout(t);
    }
    
})