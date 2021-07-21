const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  // ...
});

io.on("connection", (socket) => {
  io.emit('test',`TEST`);
});

httpServer.listen(3001);