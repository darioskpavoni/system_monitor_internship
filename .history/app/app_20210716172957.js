
// The io object (the socket.io client library) is now globally available in the browser
const socket = io('ws://localhost:3001');  // we use ws (WebSocket) here

// We're ready to listen to events
socket.on('message', (message) => {
    const msgElement = document.createElement('li');
    msgElement.innerHTML(message);

    document.querySelector('ul').append(msgElement);
}) // we listen to the 'message' event EMITTED BY THE SERVER