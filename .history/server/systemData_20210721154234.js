const io = require("socket.io")({
    path: "/test",
    serveClient: false,
  });

io.attach(3001, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

io.on('connection', (socket) => {
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100);
})