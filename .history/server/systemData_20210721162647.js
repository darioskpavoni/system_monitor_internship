const io = require('socket.io-client');
const socket = io("ws://localhost:3001", {
    reconnectionDelayMax: 10000,
    auth: {
      token: "123"
    },
    query: {
      "my-key": "my-value"
    }
  });

socket.on('connect',() => {
    setInterval(() => {
        socket.emit('test',`TEST`);
    }, 100);
})