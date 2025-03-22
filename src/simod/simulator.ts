import { Modem, Simod } from "./socket";

export class Simulator {
	private _connections = new Map<Modem, Simod | null>();
	private _unpairedSimods = new Set<Simod>();

	pairSimod(simod: Simod, newModem?: Modem): void {
		const modem = newModem ?? this._getUnpairedModem();
		if (!modem) {
			simod.emit("unavailable");
			this._unpairedSimods.add(simod);
			return;
		}

		this._connections.set(modem, simod);
		simod.emit("connected");
		modem.emit("clear");

		simod.on("sendMessage", (message: string) => {
			const modem = this._getPairedModem(simod);
			if (!modem) {
				simod.emit("disconnected");
				simod.removeAllListeners("sendMessage");
				return;
			}

			modem.emit("receiveMessage", message);
		});

		modem.on("sendMessage", (message: string) => {
			const simod = this._connections.get(modem);
			if (!simod) {
				return;
			}

			simod.emit("receiveMessage", message);
		});
	}

	unpairSimod(simod: Simod): void {
		if (this._unpairedSimods.has(simod)) {
			this._unpairedSimods.delete(simod);
			return;
		}

		const modem = this._getPairedModem(simod);
		if (!modem) {
			return;
		}

		this._connections.set(modem, null);

		modem.removeAllListeners("sendMessage");
		modem.removeAllListeners("sendRawData");
		simod.removeAllListeners("sendMessage");

		// Check if there is another unpaired simod
		const newSimod = this._unpairedSimods.values().next().value;
		if (newSimod) {
			this._unpairedSimods.delete(newSimod);
			this.pairSimod(newSimod, modem);
		}
	}

	joinModem(modem: Modem): void {
		if (this._connections.has(modem)) {
			return;
		}

		this._connections.set(modem, null);

		modem.on("sendRawData", ({ data }) => {
			for (const [otherModem, otherSimod] of this._connections) {
				if (otherModem === modem || !otherSimod) {
					continue;
				}

				otherModem.emit("receiveRawData", Array.from(data));
			}
		});

		const simod = this._unpairedSimods.values().next().value;
		if (simod) {
			this._unpairedSimods.delete(simod);
			this.pairSimod(simod, modem);
		}
	}

	kickModem(modem: Modem): void {
		const simod = this._connections.get(modem);
		this._connections.delete(modem);

		modem.removeAllListeners("sendMessage");
		modem.removeAllListeners("sendRawData");

		if (!simod) {
			return;
		}

		simod.removeAllListeners("sendMessage");
		simod.emit("disconnected");

		const newModem = this._getUnpairedModem();
		if (newModem) {
			this.pairSimod(simod, newModem);
		} else {
			this._unpairedSimods.add(simod);
		}
	}

	private _getUnpairedModem(): Modem | null {
		const unpairedModems = Array.from(this._connections.keys()).filter(modem => this._connections.get(modem) === null);

		if (unpairedModems.length === 0) {
			return null;
		}

		return unpairedModems[Math.floor(Math.random() * unpairedModems.length)];
	}

	private _getPairedModem(simod: Simod): Modem | null {
		return Array.from(this._connections.keys()).find(modem => this._connections.get(modem) === simod) || null;
	}
}
