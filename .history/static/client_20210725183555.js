// The io object (the socket.io client library) is now globally available in the browser
const socket = io('ws://192.168.0.231:3001');  // we use ws (WebSocket) here



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

socket.on('sysData', (sysData) => {
    if(!document.getElementById(sysData.id)) {
        let tableRows = document.querySelector('.sysDataTableRows');

        /* Disk Data Formatting */
        let diskData = '';
        for (let i = 0; i<sysData.DISK_info.length; i++) {
            diskData += `${sysData.DISK_info[i][0]} ${sysData.DISK_info[i][2]}GB<br>`;
        }
        /*  */

        let newRow = document.createElement('tr');
        newRow.id = sysData.id;
        newRow.innerHTML = `<th scope="row">${sysData.id}</th>
        <td class='CPU'>${sysData.CPU_usage}</td>
        <td class='RAMused'>${sysData.RAM_usage}</td>
        <td class='RAMfree'>${sysData.RAM_free}</td>
        <td class='DISKused-container'>${diskData}</td>`;

        tableRows.appendChild(newRow);
    }
    else if (document.getElementById(sysData.id)) {
        let row = document.getElementById(sysData.id);

        /* Disk Data Formatting */
        let diskData = '';
        for (let i = 0; i<sysData.DISK_info.length; i++) {
            diskData += `${sysData.DISK_info[i][0]} ${sysData.DISK_info[i][2]}<br>`;
            // I want to have this line sent from systemData rather than formatting it here
        }
        /*  */
        
        row.innerHTML = `<th scope="row">${sysData.id}</th>
        <td class='CPUload'>${sysData.CPU_usage}</td>
        <td class='RAMused'>${sysData.RAM_usage}</td>
        <td class='RAMfree'>${sysData.RAM_free}</td>
        <td class='DISKused-container'>${diskData}</td>`;
    }
    /* let diskDataContainer = document.querySelector('.DISKused-container');
    for (let i = 0; i<sysData.DISK_info.length; i++) {
        diskDataContainer.innerHTML += `1 `;
    } */

})

// Deleting row with CPU usage on disconnection
socket.on('disconnectedUser', (disconnectedUserId) => {
    let el = document.getElementById(disconnectedUserId);
    el.remove();
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