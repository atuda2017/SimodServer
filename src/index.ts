import { log } from "./logger";
import { httpServer, ioServer } from "./server/socket";
import { simulator } from "./simod";

httpServer.listen(8080, function () {
	log(`Listen on http://localhost:8080`);
});

interface Handshake {
	auth: { simulator: "network" | "simod" };
}

ioServer.on("connection", function (socket) {
	const { auth } = socket.handshake as any as Handshake;

	log(`Socket connected:`, socket.id, auth);

	socket.on("disconnect", function () {
		log(`Socket disconnected:`, socket.id, auth);

		if (auth.simulator === "network") {
			simulator.kickModem(socket);
		} else if (auth.simulator === "simod") {
			simulator.unpairSimod(socket);
		}
	});

	if (auth.simulator === "network") {
		simulator.joinModem(socket);
	} else if (auth.simulator === "simod") {
		simulator.pairSimod(socket);
	}
});
