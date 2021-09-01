import { io } from "../node_modules/socket.io-client";
import * as echarts from 'echarts';
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
            data: [] as number[], // !!
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
            data: [] as number[], // !!
          },
        ],
    };
    // Pushing sysData.DISK_used partitions in the disk chart
    for (let i = 0; i < sysData.DISK_used.length; i++) {
        DISKchart_option.yAxis.data.push(sysData.DISK_used[i][0]);
    }
    for (let i = 0; i < DISKchart_option.series.length; i++) {
        for (let j = 0; j < sysData.DISK_used.length; j++) {
          if (i == 0) {
            DISKchart_option.series[i].data.push(sysData.DISK_used[j][1]);
          } else if (i == 1) {
            DISKchart_option.series[i].data.push(sysData.DISK_free[j][1]);
          }
        }
    }

    /* CREATING HTML ELEMENTS */
    if (!document.getElementById(`${sysData.id}`)) {
        let container = document.createElement("div");
        container.classList.add("client");
        document.body.appendChild(container);
        container.id = String(sysData.id);
    
        let table = document.createElement("table");
        table.classList.add("sysDataTable");
        container.appendChild(table);
    
        let tableHead = document.createElement("thead");
        table.appendChild(tableHead);
        tableHead.innerHTML = `<tr>
        <th scope="col">User ID</th>
        <th scope="col">CPU Usage</th>
        <th scope="col">RAM Usage</th>
        <th scope="col">RAM Free</th>
        <th scope="col">DISK Usage</th>
        <th scope="col">DISK Free</th>
        </tr>`;
    
        /* DISK DATA FORMATTING */
        // Used disk space
        let usedDisk = "";
        for (let i = 0; i < sysData.DISK_used.length; i++) {
          usedDisk += `${sysData.DISK_used[i][0]} ${sysData.DISK_used[i][1]}GB<br>`; // this is actually the free space
        }
        // Free disk space
        let freeDisk = "";
        for (let i = 0; i < sysData.DISK_free.length; i++) {
          freeDisk += `${sysData.DISK_free[i][0]} ${sysData.DISK_free[i][1]}GB<br>`;
        }
    
        let tableBody = document.createElement("tbody");
        table.appendChild(tableBody);
    
        let row = document.createElement("tr");
        row.innerHTML = `<th scope="row">${sysData.id}</th>
            <td class='CPU'>${sysData.CPU_usage.slice(-1).pop()}%</td>
            <td class='RAMused'>${sysData.RAM_usage[1]}%</td>
            <td class='RAMfree'>${sysData.RAM_free[0]}GB</td>
            <td class='DISKused-container'>${usedDisk}</td>
            <td class='DISKfree-container'>${freeDisk}</td>`;
    
        tableBody.appendChild(row);
    
        /* CREATING GRAPH */
        // Creating container for charts
        let graphsContainer = document.createElement("div");
        graphsContainer.classList.add("graphsContainer");
    
        /* CPU CHART */
        let newChart = document.createElement("div");
        newChart.style.width = "600px";
        newChart.style.height = "400px";
        newChart.classList.add("CPUgraph");
        graphsContainer.appendChild(newChart);
        container.appendChild(graphsContainer);
    
        // based on prepared DOM, initialize echarts instance
        const htmlCPUchart = document.querySelector(`[id="${sysData.id}"] .CPUgraph`)! as HTMLElement;
        const CPUchart = echarts.init(htmlCPUchart);
    
        // use configuration item and data specified to show chart
        CPUchart.setOption(CPUchart_option);
        /* ------------------------------------------ */
        /* RAM CHART */
        let newChart2 = document.createElement("div");
        newChart2.style.width = "300px";
        newChart2.style.height = "300px";
        newChart2.classList.add("RAMgraph");
        let RAM_DISK_container = document.createElement("div");
        RAM_DISK_container.classList.add("RAMDISKContainer");
        RAM_DISK_container.appendChild(newChart2);
        graphsContainer.appendChild(RAM_DISK_container);
    
        const htmlRAMchart = document.querySelector(`[id="${sysData.id}"] .RAMgraph`)! as HTMLElement;
        const RAMchart = echarts.init(htmlRAMchart);
        /* ------------------------------------------ */
        /* DISK CHART */
        let newChart3 = document.createElement("div");
        newChart3.style.width = "300px";
        newChart3.style.height = "300px";
        newChart3.classList.add("DISKgraph");
        RAM_DISK_container.appendChild(newChart3);
    
        const htmlDISKchart = document.querySelector(`[id="${sysData.id}"] .DISKgraph`)! as HTMLElement;
        const DISKchart = echarts.init(htmlDISKchart);
    
        DISKchart_option.yAxis.data = [];
        for (let i = 0; i < sysData.DISK_used.length; i++) {
          DISKchart_option.yAxis.data.push(sysData.DISK_used[i][0]);
        }
    
        for (let i = 0; i < DISKchart_option.series.length; i++) {
          DISKchart_option.series[i].data = [];
          for (let j = 0; j < sysData.DISK_used.length; j++) {
            if (i == 0) {
              DISKchart_option.series[i].data.push(sysData.DISK_used[j][1]);
            } else if (i == 1) {
              DISKchart_option.series[i].data.push(sysData.DISK_free[j][1]);
            }
          }
        }
    
        DISKchart.setOption(DISKchart_option);
      } else if (document.getElementById(`${sysData.id}`)) {
        let row = document.querySelector(
          `[id="${sysData.id}"] > table > tbody > tr`
        )! as HTMLElement;
    
        /* Disk Data Formatting */
    
        // Used disk
        let usedDisk = "";
        for (let i = 0; i < sysData.DISK_used.length; i++) {
          usedDisk += `${sysData.DISK_used[i][0]} ${sysData.DISK_used[i][1]}GB<br>`;
        }
        // Free disk
        let freeDisk = "";
        for (let i = 0; i < sysData.DISK_free.length; i++) {
          freeDisk += `${sysData.DISK_free[i][0]} ${sysData.DISK_free[i][1]}GB<br>`;
        }
        /*  */
    
        /* console.log(sysData.CPU_usage.slice(-1).pop()); */ // This is to get only the last element in the array of values for CPU and so on
    
        row.innerHTML = `<th scope="row">${sysData.id}</th>
            <td class='CPUload'>${sysData.CPU_usage.slice(-1).pop()}%</td>
            <td class='RAMused'>${sysData.RAM_usage[1]}%</td>
            <td class='RAMfree'>${sysData.RAM_free[0]}GB</td>
            <td class='DISKused-container'>${usedDisk}</td>
            <td class='DISKfree-container'>${freeDisk}</td>`;
    
        // UPDATING DATA IN GRAPHS
        // CPU CHART
        const htmlCPUchart = document.querySelector(`[id="${sysData.id}"] .graphsContainer .CPUgraph`)! as HTMLElement;
        const CPUchart = echarts.init(htmlCPUchart);
    
        CPUchart.setOption(CPUchart_option);
        // RAM CHART
        const htmlRAMchart =  document.querySelector(`[id="${sysData.id}"] .graphsContainer .RAMgraph`)! as HTMLElement;
        const RAMchart = echarts.init(htmlRAMchart);
        RAMchart.setOption(RAMchart_option);
        // DISK CHART
        const htmlDISKchart = document.querySelector(`[id="${sysData.id}"] .graphsContainer .DISKgraph`)! as HTMLElement;
        const DISKchart = echarts.init(htmlDISKchart);
    
        DISKchart_option.yAxis.data = [];
        for (let i = 0; i < sysData.DISK_used.length; i++) {
          DISKchart_option.yAxis.data.push(sysData.DISK_used[i][0]);
        }
    
        for (let i = 0; i < DISKchart_option.series.length; i++) {
          DISKchart_option.series[i].data = [];
          for (let j = 0; j < sysData.DISK_used.length; j++) {
            if (i == 0) {
              DISKchart_option.series[i].data.push(sysData.DISK_used[j][1]);
            } else if (i == 1) {
              DISKchart_option.series[i].data.push(sysData.DISK_free[j][1]);
            }
          }
        }
    
        DISKchart.setOption(DISKchart_option);
      }
})