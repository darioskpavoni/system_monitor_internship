// The io object (the socket.io client library) is now globally available in the browser
const socket = io('ws://localhost:3001');  // we use ws (WebSocket) here

// We're ready to listen to events
socket.on('message', (message) => {
    const msgElement = document.createElement('li');
    msgElement.innerHTML = message;
    console.log(msgElement)
    document.querySelector('ul').appendChild(msgElement);
}) // we listen to the 'message' event EMITTED BY THE SERVER

// We set up the button
const sendBtn = document.querySelector('button');
const inputMsg = document.querySelector('input');
sendBtn.addEventListener('click', () => {
    socket.emit('message', inputMsg);
    /* console.log('message'); */
})