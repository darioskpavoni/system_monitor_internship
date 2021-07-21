const io = require("socket.io")(3001, {
    path: ".",
    serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  });

io.on('connection', (socket) => {
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100);
}) 