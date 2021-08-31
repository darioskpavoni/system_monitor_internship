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

    /* CHART CONFIGURATION */
    // CPU CHART
    const CPUchart_option = {
        title: {
          text: "CPU Usage [%]",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
            },
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 100,
        },
        series: [
          {
            name: "CPU Usage",
            type: "line",
            label: {
              show: true,
              position: "top",
            },
            areaStyle: {
              color: "#A3D8EC",
            },
            data: sysData.CPU_usage,
          },
        ],
    };
    // RAM CHART
    const RAMchart_option = {
        title: {
          text: "RAM Usage [%]",
          padding: 0,
          left: "center",
          textStyle: {
            fontSize: 15,
          },
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          top: "5%",
          left: "center",
        },
        series: [
          {
            name: "RAM Usage",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "20",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              {
                value: sysData.RAM_usage[1],
                name: `Used`, // If I change this to sysData.RAM_usage[0] to see the actual GBs, the charts starts behaving strangely
              },
              {
                value: sysData.RAM_free[1],
                name: `Free`,
              },
            ],
          },
        ],
    };
    // DISK CHART
    const DISKchart_option = {
        title: {
          text: "Partition Usage [GB]",
          padding: 0,
          left: "center",
          textStyle: {
            fontSize: 15,
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // Use axis to trigger tooltip
            type: "shadow", // 'shadow' as default; can also be 'line' or 'shadow'
          },
        },
        legend: {
          data: ["Used Space", "Free Space"],
          top: "5%",
          left: "center",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
          data: [] as string[], // !! DONE
        },
        series: [
          {
            name: "Used Space",
            type: "bar",
            stack: "total",
            label: {
              show: true,
            },
            emphasis: {
              focus: "series",
            },
            data: [], // !!
          },
          {
            name: "Free Space",
            type: "bar",
            stack: "total",
            label: {
              show: true,
            },
            emphasis: {
              focus: "series",
            },
            data: [], // !!
          },
        ],
    };
    // Pushing sysData.DISK_used partitions in the disk chart
    for (let i = 0; i < sysData.DISK_used.length; i++) {
        DISKchart_option.yAxis.data.push(sysData.DISK_used[i][0]);
    }
    
})