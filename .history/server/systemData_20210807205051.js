import io from "socket.io-client";
const socket = io("http://192.168.0.157:3001");

// For Disk Info command
import { execSync } from "child_process";

import { cpuUsage, totalmem, freemem } from "os-utils";

const random0_100 = () => {
  return Math.floor(Math.random() * (100 - 0 + 1) + 0);
};

/* DISK INFO DATA FIRST CALCULATION */

const output = execSync("wmic logicaldisk", { encoding: "utf-8" });

const parsedOutput = output.split(/\r?\n/);
let temp = [];
/* console.log(parsedOutput); */
let diskData = []; // Final array

// Removes lots of whitespaces and replaces them with a single space
for (let i = 1; i < parsedOutput.length - 2; i++) {
  temp.push(parsedOutput[i].replace(/\s+/g, " "));
}
// Splits strings into array elements by space
for (let j = 0; j < temp.length; j++) {
  temp[j] = temp[j].split(" ");
  let partitionName = temp[j][19];
  if (partitionName != undefined) {
    diskData.push([
      `${temp[j][1]}`, // Partition letter
      `${temp[j][19]}`, // Partition name
      `${(temp[j][10] / Math.pow(1024, 3)).toFixed(1)}`, // Partition free space GB
      `${(temp[j][14] / Math.pow(1024, 3)).toFixed(1)}`, // Partition total space GB
      `${(
        (temp[j][14] / Math.pow(1024, 3)).toFixed(1) -
        (temp[j][10] / Math.pow(1024, 3)).toFixed(1)
      ).toFixed(1)}`, // Partition used space GB
      `${(
        ((
          (temp[j][14] / Math.pow(1024, 3)).toFixed(1) -
          (temp[j][10] / Math.pow(1024, 3)).toFixed(1)
        ).toFixed(1) /
          (temp[j][14] / Math.pow(1024, 3)).toFixed(1)) *
        100
      ).toFixed(1)}`, // Calculation of used space in %: ((used in GB)/(total in GB))*100)
    ]);
  }
}
// Selecting disk used data
let diskUsed = [];
for (let i = 0; i < diskData.length; i++) {
  diskUsed.push([`${diskData[i][0]}`, parseFloat(diskData[i][5])]);
}
/* console.log(diskUsed); */

// Selecting disk free data
let diskFree = [];
for (let i = 0; i < diskData.length; i++) {
  diskFree.push([`${diskData[i][0]}`, parseFloat(diskData[i][2])]);
}
/* console.log(diskFree); */
/* --------------------------------------------- */

// Object for system data
let sysData = {
  id: Date.now(),
  CPU_usage: [0],
  RAM_usage: [0, 0], // first value is GB, second is %
  RAM_free: [0, 0], // random numbers
  DISK_used: diskUsed,
  DISK_free: diskFree,
};

// Function to refresh system data except ID
const sysDataRefresh = (sysData) => {
  // CPU USAGE
  cpuUsage((v) => {
    if (sysData.CPU_usage.length < 5) {
      sysData.CPU_usage.push(parseFloat((v * 100).toFixed(1))); // Outputing CPU usage as a float rather than a string
    } else if ((sysData.CPU_usage.length = 5)) {
      sysData.CPU_usage.shift();
      sysData.CPU_usage.push(parseFloat((v * 100).toFixed(1)));
    }
  });

  // RAM USAGE (used)
  sysData.RAM_usage[0] = parseFloat(
    ((totalmem() - freemem()) / 1000).toFixed(2)
  );
  sysData.RAM_usage[1] = parseFloat(
    (((totalmem() - freemem()) * 100) / totalmem()).toFixed(1)
  );
  // RAM USAGE (free)
  sysData.RAM_free[0] = parseFloat((freemem() / 1000).toFixed(2));
  sysData.RAM_free[1] = 100 - sysData.RAM_usage[1];

  // DISK DATA
  const output = execSync("wmic logicaldisk", { encoding: "utf-8" });

  const parsedOutput = output.split(/\r?\n/);
  let temp = [];
  /* console.log(parsedOutput); */
  let diskData = []; // Final array

  // Removes lots of whitespaces and replaces them with a single space
  for (let i = 1; i < parsedOutput.length - 2; i++) {
    temp.push(parsedOutput[i].replace(/\s+/g, " "));
  }

  // Splits strings into array elements by space
  for (let j = 0; j < temp.length; j++) {
    temp[j] = temp[j].split(" ");
    let partitionName = temp[j][19];
    if (partitionName != undefined) {
      diskData.push([
        `${temp[j][1]}`, // Partition letter
        `${temp[j][19]}`, // Partition name
        `${(temp[j][10] / Math.pow(1024, 3)).toFixed(1)}`, // Partition free space GB
        `${(temp[j][14] / Math.pow(1024, 3)).toFixed(1)}`, // Partition total space GB
        `${(
          (temp[j][14] / Math.pow(1024, 3)).toFixed(1) -
          (temp[j][10] / Math.pow(1024, 3)).toFixed(1)
        ).toFixed(1)}`, // Partition used space GB
        `${(
          ((
            (temp[j][14] / Math.pow(1024, 3)).toFixed(1) -
            (temp[j][10] / Math.pow(1024, 3)).toFixed(1)
          ).toFixed(1) /
            (temp[j][14] / Math.pow(1024, 3)).toFixed(1)) *
          100
        ).toFixed(1)}`, // Calculation of used space in %: ((used in GB)/(total in GB))*100)
      ]);
    }
  }
  // DISK USED
  diskUsed = []; // Emptying the array otherwise we get duplicated data
  for (let i = 0; i < diskData.length; i++) {
    diskUsed.push([`${diskData[i][0]}`, parseFloat(diskData[i][5])]);
  }
  /* console.log(diskUsed); */
  sysData.DISK_used = diskUsed;

  // DISK FREE
  diskFree = [];
  for (let i = 0; i < diskData.length; i++) {
    diskFree.push([`${diskData[i][0]}`, parseFloat(diskData[i][2])]);
  }
  sysData.DISK_free = diskFree;
};

socket.on("connect", () => {
  setInterval(() => {
    // Refresh system data
    sysDataRefresh(sysData);
    // Emit data
    socket.emit("sysData", sysData);
    /* socket.emit('test', sysData); */
    console.log(sysData);
    console.log(`${new Date()} - Sending system data...`);
  }, 2500);
});
