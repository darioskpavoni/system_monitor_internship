// The io object (the socket.io client library) is now globally available in the browser
const socket = io('ws://localhost:3001');  // we use ws (WebSocket) here

// We're ready to listen to events
socket.on('message', (message) => {
    const msgElement = document.createElement('li');
    msgElement.innerHTML = message;
    /* console.log(msgElement); */
    document.querySelector('ul').appendChild(msgElement);
}) // we listen to the 'message' event EMITTED BY THE SERVER


// Displaying CPU usage on client side
socket.on('cpuUsage', (package) => {
    
    if (document.getElementById(socket.id) === package.id) {
        let el = document.getElementById(socket.id);
        el.innerHTML = package.value;
    }
    else {
        let newEl = document.createElement('li');
        newEl.innerHTML = package.value;
        newEl.id = package.id;
        document.querySelector('ul').appendChild(newEl);
    }
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
        value,
        'socket-id': socket.id
    };
    socket.emit('cpuUsage', package);
    console.log(`${socket.id} has ${value}%`);
}, 2000);