import { io } from "socket.io-client";
const socket = io("ws://192.168.0.231:3001"); 

let timers = {}; // Object to contain all timers for deleting not updated data on page