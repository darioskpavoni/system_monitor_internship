// The io object (the socket.io client library) is now globally available in the browser
const socket = io('ws://192.168.0.158:3001');  // we use ws (WebSocket) here



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

        let newRow = document.createElement('tr');
        newRow.id = sysData.id;
        newRow.innerHTML = `<th scope="row">${sysData.id}</th>
        <td class='CPU'>${sysData.CPU_usage}</td>
        <td class='RAMused'>${sysData.RAM_usage}</td>
        <td class='RAMfree'>${sysData.RAM_free}</td>`;

        for (let i = 0; i<sysData.DISK)

        tableRows.appendChild(newRow);
    }
    else if (document.getElementById(sysData.id)) {
        let row = document.getElementById(sysData.id);
        row.innerHTML = `<th scope="row">${sysData.id}</th>
        <td class='CPU'>${sysData.CPU_usage}</td>
        <td class='RAMused'>${sysData.RAM_usage}</td>
        <td class='RAMfree'>${sysData.RAM_free}</td>`;
    }
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