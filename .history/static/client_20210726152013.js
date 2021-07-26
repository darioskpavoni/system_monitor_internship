const socket = io('ws://192.168.0.158:3001');  // we use ws (WebSocket) here
// The io object (the socket.io client library) is now globally available in the browser



// We're ready to listen to events
socket.on('message', (message) => {
    const msgElement = document.createElement('li');
    msgElement.innerHTML = message;
    /* console.log(msgElement); */
    document.getElementById('messages').appendChild(msgElement);
}) // we listen to the 'message' event EMITTED BY THE SERVER


// Displaying CPU usage on client side
socket.on('cpuUsage', (package) => {

    if (document.getElementById(package.id)) {
        let el = document.getElementById(package.id);
        el.innerHTML = package.cpuUsage;
    }
    else if (!document.getElementById(package.id)) {
        let newEl = document.createElement('li');
        newEl.id = package.id;
        newEl.innerHTML = package.cpuUsage;
        document.getElementById('system').appendChild(newEl);
    }
})



let nodeId = []; // Array to contain all user IDs
let timers = {}; // Object to contain all timers for deleting not updated data on page



socket.on('sysData', (sysData) => {
    if (!nodeId.includes(sysData.id)) { // Creating a list of the users by their IDs
        nodeId.push(sysData.id);
    }

    forEach.nodeId( id => {
        timers[id] = setTimeout(() => {
            document.getElementById(id).remove();
        }, 4000);
    })

    clearTimeout(timers[sysData.id]);

    console.log('Active users: ' + nodeId);

    console.log(timers);
    /* console.log(nodeId); */

    if(!document.getElementById(sysData.id)) {
        let tableRows = document.querySelector('.sysDataTableRows');

        /* Disk Data Formatting */
        // Used disk
        let usedDisk = '';
        for (let i = 0; i<sysData.DISK_used.length; i++) {
            usedDisk += `${sysData.DISK_used[i][0]} ${sysData.DISK_used[i][1]}%<br>`; // this is actually the free space
        }
        // Free disk
        let freeDisk = '';
        for (let i = 0; i<sysData.DISK_free.length; i++) {
            freeDisk += `${sysData.DISK_free[i][0]} ${sysData.DISK_free[i][1]}<br>`;
        }

        let newRow = document.createElement('tr');
        newRow.id = sysData.id;
        newRow.innerHTML = `<th scope="row">${sysData.id}</th>
        <td class='CPU'>${sysData.CPU_usage}</td>
        <td class='RAMused'>${sysData.RAM_usage}</td>
        <td class='RAMfree'>${sysData.RAM_free}</td>
        <td class='DISKused-container'>${usedDisk}</td>
        <td class='DISKfree-container'>${freeDisk}</td>`;

        tableRows.appendChild(newRow);
    }
    else if (document.getElementById(sysData.id)) {
        let row = document.getElementById(sysData.id);

        /* Disk Data Formatting */

        // Used disk
        let usedDisk = '';
        for (let i = 0; i<sysData.DISK_used.length; i++) {
            usedDisk += `${sysData.DISK_used[i][0]} ${sysData.DISK_used[i][1]}%<br>`;
        }
        // Free disk
        let freeDisk = '';
        for (let i = 0; i<sysData.DISK_free.length; i++) {
            freeDisk += `${sysData.DISK_free[i][0]} ${sysData.DISK_free[i][1]}<br>`;
        }
        /*  */
        
        row.innerHTML = `<th scope="row">${sysData.id}</th>
        <td class='CPUload'>${sysData.CPU_usage}</td>
        <td class='RAMused'>${sysData.RAM_usage}</td>
        <td class='RAMfree'>${sysData.RAM_free}</td>
        <td class='DISKused-container'>${usedDisk}</td>
        <td class='DISKfree-container'>${freeDisk}</td>`;
    }
})







// We set up the button
/* const sendBtn = document.querySelector('button');
let inputMsg = '';
sendBtn.addEventListener('click', () => {
    inputMsg = document.querySelector('input').value;
    socket.emit('message', inputMsg);
    
}) */

/* Sending CPU usage to server */
/* setInterval(() => {
    let min = 0;
    let max = 100;
    let value = Math.floor(Math.random() * (max - min + 1) + min);
    
    let package = {
        'cpuUsage': value,
        'id': socket.id
    };
    
    socket.emit('cpuUsage', package);
    console.log(`${package.id} has ${package.cpuUsage}%`);
    
}, 2000); */