// The io object (the socket.io client library) is now globally available in the browser
const socket = io('ws://localhost:3001');  // we use ws (WebSocket) here

// We're ready to listen to events
socket.on('message', (message) => {
    const msgElement = document.createElement('li');
    msgElement.innerHTML = message;
    /* console.log(msgElement); */
    document.querySelector('ul').appendChild(msgElement);
}) // we listen to the 'message' event EMITTED BY THE SERVER

setInterval(() => {
    socket.on('cpuUsage', (cpuUsage) => {
        if (document.getElementById(socket.id)) {
            const cpuUsElement = document.getElementById(socket.id);
            cpuUsElement.innerHTML = cpuUsage;
        }
        else {
            const cpuUsElement = document.createElement('li');
            cpuUsElement.id = socket.id;
            cpuUsElement.innerHTML = cpuUsage;
            document.querySelector('ul').appendChild(cpuUsElement);
        }
        
    })
}, 2000);

// We set up the button
const sendBtn = document.querySelector('button');
let inputMsg = '';
sendBtn.addEventListener('click', () => {
    inputMsg = document.querySelector('input').value;
    socket.emit('message', inputMsg);
    /* console.log(inputMsg); */
})

/* TESTING FURTHER FUNCTIONALITY */
setInterval(() => {
    let min = 0;
    let max = 100;
    let value = Math.floor(Math.random() * (max - min + 1) + min);
    /* console.log(value); */ 
    socket.emit('cpuUsage', value);
}, 2000);