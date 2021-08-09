import io from "socket.io-client";
const socket = io("http://192.168.0.167:3001");

// For Disk Info command
import { execSync } from "child_process";

import { cpuUsage, totalmem, freemem } from "os-utils";
import os from "os";
import { parse } from "path";

/* IDENTIFY CURRENT OS */
const isWin = process.platform === "win32";
const isLinux = process.platform === "linux";
/* ------------------- */

/* DISK INFO DATA FIRST CALCULATION */
let diskUsed = [];
let diskFree = [];
// WINDOWS
if (isWin) {
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
  for (let i = 0; i < diskData.length; i++) {
    if (!isNaN(parseFloat(diskData[i][5]))) {
      diskUsed.push([`${diskData[i][0]}`, parseFloat(diskData[i][5])]);
    }
  }
  /* console.log(diskUsed); */

  // Selecting disk free data
  for (let i = 0; i < diskData.length; i++) {
    diskFree.push([`${diskData[i][0]}`, parseFloat(diskData[i][2])]);
  }
}
// END OF WINDOWS
// LINUX
else if (isLinux) {
  const output = execSync("df -h | grep ^/dev", { encoding: "utf-8" });
  let parsedOutput = output.split(/\n/);

  let temp = [];
  let temp2 = [];
  let diskData = [];

  // Splitting in different elements based on whitespaces
  for (let j = 0; j < parsedOutput.length - 1; j++) {
    temp[j] = parsedOutput[j].split(" ");
  }
  // Deleting empty elements
  for (let i = 0; i < temp.length; i++) {
    temp2.push([]);
    for (let j = 0; j < temp[i].length; j++) {
      if (temp[i][j] !== "") {
        temp2[i].push(temp[i][j]);
      }
    }
  }
  // Selecting elements of interest from temp2
  for (let i = 0; i < temp2.length; i++) {
    let partitionName = temp2[i][0];
    let partitionSizeGB = temp2[i][1];
    let partitionUsedGB = temp2[i][2];
    let partitionFreeGB = temp2[i][3];
    let partitionUsedPercent = temp2[i][4];
    let partitionFreePercent = 100 - parseFloat(partitionUsedPercent);

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
  for (let i = 0; i < diskData.length; i++) {
    if (!isNaN(parseFloat(diskData[i][4]))) {
      diskUsed.push([`${diskData[i][0]}`, parseFloat(diskData[i][2])]);
    }
  }
  /* console.log(diskUsed); */

  // Selecting disk free data
  for (let i = 0; i < diskData.length; i++) {
    diskFree.push([`${diskData[i][0]}`, parseFloat(diskData[i][3])]);
  }
}
// END OF LINUX

// Object for system data
let sysData = {
  id: Date.now(),
  CPU_usage: [0],
  RAM_usage: [0, 0], // first value is GB, second is %
  RAM_free: [0, 0],
  DISK_used: diskUsed,
  DISK_free: diskFree,
};

console.log(sysData);

// Function to refresh system data except ID
const sysDataRefresh = (sysData) => {
  if (isWin) {
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
    sysData.RAM_free[1] = parseFloat((100 - sysData.RAM_usage[1]).toFixed(1));

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
      diskUsed.push([`${diskData[i][0]}`, parseFloat(diskData[i][4])]);
    }
    /* console.log(diskUsed); */
    sysData.DISK_used = diskUsed;

    // DISK FREE
    diskFree = [];
    for (let i = 0; i < diskData.length; i++) {
      diskFree.push([`${diskData[i][0]}`, parseFloat(diskData[i][2])]);
    }
    sysData.DISK_free = diskFree;
  } else if (isLinux) {
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
    sysData.RAM_free[1] = parseFloat((100 - sysData.RAM_usage[1]).toFixed(1));
    // DISK DATA
    const output = execSync("df -h | grep ^/dev", { encoding: "utf-8" });
    let parsedOutput = output.split(/\n/);

    let temp = [];
    let temp2 = [];
    let diskData = [];

    // Splitting in different elements based on whitespaces
    for (let j = 0; j < parsedOutput.length - 1; j++) {
      temp[j] = parsedOutput[j].split(" ");
    }
    // Deleting empty elements
    for (let i = 0; i < temp.length; i++) {
      temp2.push([]);
      for (let j = 0; j < temp[i].length; j++) {
        if (temp[i][j] !== "") {
          temp2[i].push(temp[i][j]);
        }
      }
    }
    // Selecting elements of interest from temp2
    for (let i = 0; i < temp2.length; i++) {
      let partitionName = temp2[i][0];
      let partitionSizeGB = temp2[i][1];
      let partitionUsedGB = temp2[i][2];
      let partitionFreeGB = temp2[i][3];
      let partitionUsedPercent = temp2[i][4];
      let partitionFreePercent = 100 - parseFloat(partitionUsedPercent);

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
    for (let i = 0; i < diskData.length; i++) {
      if (!isNaN(parseFloat(diskData[i][2]))) {
        diskUsed.push([`${diskData[i][0]}`, parseFloat(diskData[i][2])]);
      }
    }
    /* console.log(diskUsed); */
    sysData.DISK_used = diskUsed;

    // Selecting disk free data
    diskFree = [];
    for (let i = 0; i < diskData.length; i++) {
      diskFree.push([`${diskData[i][0]}`, parseFloat(diskData[i][3])]);
    }
    sysData.DISK_free = diskFree;
  }
};

socket.on("connect", () => {
  setInterval(() => {
    // Refresh system data
    sysDataRefresh(sysData);
    // Emit data
    /* socket.emit("sysData", sysData); */
    console.log(sysData);
    console.log(`${new Date()} - Sending system data...`);
  }, 2500);
});
