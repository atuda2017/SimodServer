import http from "http";
import { Server } from "socket.io";

export const httpServer = http.createServer();

export const ioServer = new Server(httpServer, {
	allowUpgrades: false,
	cors: {
		origin: "*",
	},
});
