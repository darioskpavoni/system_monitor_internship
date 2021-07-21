const io = require('socket.io-client');
const socket = io("ws://example.com/my-namespace", {
    reconnectionDelayMax: 10000,
    auth: {
      token: "123"
    },
    query: {
      "my-key": "my-value"
    }
  });

io.on('connect',() => {
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100);
})