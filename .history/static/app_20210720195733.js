// The io object (the socket.io client library) is now globally available in the browser
const socket = io('ws://localhost:3001');  // we use ws (WebSocket) here

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

// Deleting row with CPU usage on disconnection
socket.on('disconnection', () => {
    let el = document.getElementById(socket.id);
    delete el;
})

// We set up the button
const sendBtn = document.querySelector('button');
let inputMsg = '';
sendBtn.addEventListener('click', () => {
    inputMsg = document.querySelector('input').value;
    socket.emit('message', inputMsg);
    /* console.log(inputMsg); */
})

/* Sending CPU usage to server */
setInterval(() => {
    let min = 0;
    let max = 100;
    let value = Math.floor(Math.random() * (max - min + 1) + min);
    /* console.log(value); */ 
    let package = {
        'cpuUsage': value,
        'id': socket.id
    };
    
    socket.emit('cpuUsage', package);
    console.log(`${package.id} has ${package.cpuUsage}%`);
}, 2000);