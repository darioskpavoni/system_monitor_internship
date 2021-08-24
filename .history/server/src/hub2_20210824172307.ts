import express from 'express';
import http from "http";
import { dirname } from "path";
import { Server } from "socket.io";
import path from "path";

const app = express();
const server = http.createServer(app);