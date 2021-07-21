const httpServer = require("http").createServer();
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

io.on("connection", (socket) => { 
    setInterval(() => {
        io.emit('test',`TEST`);
    }, 100); 
});

httpServer.listen(3001);