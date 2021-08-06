const socket = io("ws://192.168.0.231:3001"); // we use ws (WebSocket) here
// The io object (the socket.io client library) is now globally available in the browser

// We're ready to listen to events
socket.on("message", (message) => {
  const msgElement = document.createElement("li");
  msgElement.innerHTML = message;
  /* console.log(msgElement); */
  document.getElementById("messages").appendChild(msgElement);
}); // we listen to the 'message' event EMITTED BY THE SERVER

let timers = {}; // Object to contain all timers for deleting not updated data on page

socket.on("sysData", (sysData) => {
  if (!timers[sysData.id]) {
    timers[sysData.id] = []; // Creating an array which will contain up to 2 timers at a time for every user. Look down for info
  }

  timers[sysData.id].push(
    setTimeout(() => {
      document.getElementById(sysData.id).remove();
      console.log(`Deleting node ${sysData.id}`);
    }, 4000)
  );

  if (timers[sysData.id].length > 1) {
    // Idea is that for every user I have an array of timers. At the beginning I have 0 timers, one is created. Then another one is created. Array length is now 2, I delete the first timer from the array and clear the timer. Then another timer is created and the first one gets deleted and cleared, and so on.
    const t = timers[sysData.id].shift();
    clearTimeout(t);
    /* console.log(`Clearing timer for ${sysData.id}`); */
  }

  /* console.log(timers); */
  // CPUchart configuration
  const CPUchart_option = {
    title: {
      text: "CPU Usage [%]",
      left: "center",
    },
    xAxis: {
      type: "category",
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
    },
    series: [
      {
        data: sysData.CPU_usage,
        type: "line",
      },
    ],
  };

  // RAMchart configuration
  const RAMchart_option = {
    title: {
      text: "RAM Usage [%]",
      left: "center",
      textStyle: {
        fontSize: 12,
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
        name: "RAM usage",
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
            name: `Used`,
          },
          {
            value: sysData.RAM_free[1],
            name: `Free`,
          },
        ],
      },
    ],
  };

  // Display data in a table
  if (!document.getElementById(sysData.id)) {
    let container = document.createElement("div");
    container.classList.add("client");
    document.body.appendChild(container);
    container.id = sysData.id;

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

    /* Disk Data Formatting */
    // Used disk
    let usedDisk = "";
    for (let i = 0; i < sysData.DISK_used.length; i++) {
      usedDisk += `${sysData.DISK_used[i][0]} ${sysData.DISK_used[i][1]}%<br>`; // this is actually the free space
    }
    // Free disk
    let freeDisk = "";
    for (let i = 0; i < sysData.DISK_free.length; i++) {
      freeDisk += `${sysData.DISK_free[i][0]} ${sysData.DISK_free[i][1]}<br>`;
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
    const CPUchart = echarts.init(
      document.querySelector(`[id="${sysData.id}"] .CPUgraph`)
    );

    // use configuration item and data specified to show chart
    CPUchart.setOption(CPUchart_option);
    /* ------------------------------------------ */
    /* RAM CHART */
    let newChart2 = document.createElement("div");
    newChart2.style.width = "300px";
    newChart2.style.height = "200px";
    newChart2.classList.add("RAMgraph");
    graphsContainer.appendChild(newChart2);

    const RAMchart = echarts.init(
      document.querySelector(`[id="${sysData.id}"] .RAMgraph`)
    );

    RAMchart.setOption(RAMchart_option);
  } else if (document.getElementById(sysData.id)) {
    let row = document.querySelector(
      `[id="${sysData.id}"] > table > tbody > tr`
    );

    /* Disk Data Formatting */

    // Used disk
    let usedDisk = "";
    for (let i = 0; i < sysData.DISK_used.length; i++) {
      usedDisk += `${sysData.DISK_used[i][0]} ${sysData.DISK_used[i][1]}%<br>`;
    }
    // Free disk
    let freeDisk = "";
    for (let i = 0; i < sysData.DISK_free.length; i++) {
      freeDisk += `${sysData.DISK_free[i][0]} ${sysData.DISK_free[i][1]}<br>`;
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
    const CPUchart = echarts.init(
      document.querySelector(`[id="${sysData.id}"] .graphsContainer .CPUgraph`)
    );

    CPUchart.setOption(CPUchart_option);
    // RAM CHART
    const RAMchart = echarts.init(
      document.querySelector(`[id="${sysData.id}"] .graphsContainer .RAMgraph`)
    );

    RAMchart.setOption(RAMchart_option);
  }
});
