import io from "socket.io-client";
import { execSync } from "child_process";
import { cpuUsage, totalmem, freemem } from "os-utils";

const socket = io("http://192.168.0.231:3001");

/* IDENTIFY CURRENT OS */
const isWin= process.platform === "win32";
const isLinux = process.platform === "linux";

/* DISK INFO */
let diskUsed = [] as any[];
let diskFree = [] as any[];
// Windows
if (isWin) {
    // Command for partition info
    const output = execSync("wmic logicaldisk", { encoding: "utf-8" });
    /* PARSING THE OUTPUT FROM THE COMMAND */
    // Splitting text on new lines
    const output0 = output.split(/\r?\n/);
    // Removing excessive whitespaces and replacing them with a single space. Array output1 contains data for each partition
    const output1 = [] as any[];
    for (let i = 1; i < output0.length - 2; i++) {
        output1.push(output0[i].replace(/\s+/g, " "));
    }
    console.log(output1);
    

}