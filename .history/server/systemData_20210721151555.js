var io = require('socket.io-client');
var socket = io.connect("http://localhost:3001/", {
    reconnection: true
});

socket.on('connect', function () {
    console.log('connected to localhost:3000');
    socket.on('clientEvent', function (data) {
        console.log('message from the server:', data);
        socket.emit('serverEvent', "thanks server! for sending '" + data + "'");
    });
});
