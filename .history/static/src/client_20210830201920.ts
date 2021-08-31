import { io } from "socket.io-client";
const socket = io("ws://192.168.0.231:3001"); 

// Creating object to contain all timers used to delete not updated data on page
let timers = {}; 