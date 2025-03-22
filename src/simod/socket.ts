import { Socket } from "socket.io";

declare global {
	namespace Modem {
		interface ServerEmitEvents {
			/**
			 * Triggered to notify a modem that it has received a message from other modems.
			 * @param data The raw data received.
			 */
			receiveRawData: (data: number[]) => void;
			/**
			 * Triggered to notify a modem that it has received a message from a simod
			 * 		  or to notify a simod that it has received a message from a modem.
			 * @param message The message received.
			 */
			receiveMessage: (message: string) => void;

			/**
			 * Triggered to clear the modem internal state.
			 */
			clear(): void;
		}
		interface ServerListenEvents {
			/**
			 * Triggered when a modem sends raw data to other modems.
			 * @param data The raw data to send.
			 */
			sendRawData: (message: { sourceID: number; data: Buffer }) => void;
			/**
			 * Triggered when a modem sends a message to a simod
			 * 		  or when a simod sends a message to a modem.
			 */
			sendMessage: (message: string) => void;
		}
	}

	namespace Simod {
		interface ServerEmitEvents {
			/**
			 * Triggered to notify a simod that it has been connected successfully to a modem.
			 */
			connected: () => void;
			/**
			 * Triggered to notify a simod that it has been disconnected from a modem.
			 */
			disconnected: () => void;
			/**
			 * Triggered when a simod tries to pair with a modem but no modems are available.
			 */
			unavailable: () => void;
			/**
			 * Triggered to notify a modem that it has received a message from a simod
			 * 		  or to notify a simod that it has received a message from a modem.
			 * @param message The message received.
			 */
			receiveMessage: (message: string) => void;
		}
		interface ServerListenEvents {
			/**
			 * Triggered when a modem sends a message to a simod
			 * 		  or when a simod sends a message to a modem.
			 */
			sendMessage: (message: string) => void;
		}
	}
}

export class Simod extends Socket<Simod.ServerListenEvents, Simod.ServerEmitEvents> {}
export class Modem extends Socket<Modem.ServerListenEvents, Modem.ServerEmitEvents> {}
