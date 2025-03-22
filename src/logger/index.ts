import path from "path";

export const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	underscore: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",
	fgblack: "\x1b[30m",
	fgred: "\x1b[31m",
	fggreen: "\x1b[32m",
	fgyellow: "\x1b[33m",
	fgblue: "\x1b[34m",
	fgmagenta: "\x1b[35m",
	fgcyan: "\x1b[36m",
	fgwhite: "\x1b[37m",
	bgblack: "\x1b[40m",
	bgred: "\x1b[41m",
	bggreen: "\x1b[42m",
	bgyellow: "\x1b[43m",
	bgblue: "\x1b[44m",
	bgmagenta: "\x1b[45m",
	bgcyan: "\x1b[46m",
	bgwhite: "\x1b[47m",
};

export function colorize(
	color: keyof typeof colors,
	text: string,
	reset: boolean = true
) {
	return `${colors[color]}${text}${reset ? colors.reset : ""}`;
}

export function colorizeLog(color: keyof typeof colors, ...args: any) {
	log(colors[color], ...args, colors.reset);
}

export function log(...args: any) {
	const date = new Date();
	const timeParts = [
		date.getHours().toString().padStart(2, "0"),
		date.getMinutes().toString().padStart(2, "0"),
		date.getSeconds().toString().padStart(2, "0"),
		date.getMilliseconds().toString().padStart(3, "0"),
		date.getDate().toString().padStart(2, "0"),
		(date.getMonth() + 1).toString().padStart(2, "0"),
		date.getFullYear().toString().padStart(4, "0"),
	];
	const time = `[${timeParts.slice(4).join("/")} ${timeParts
		.slice(0, 3)
		.join(":")}.${timeParts[3]}]`;

	const stack = new Error().stack?.split("\n");
	if (stack) {
		const details =
			stack[2].match(/(.+) \((.+)\)/) ?? stack[2].match(/(.+) (.+)/);
		if (details) {
			let [, func, location] = details;
			func = func.replace(/^\s+/g, "");
			if (func == "at Object.<anonymous>") {
				func = "at";
			}
			return console.log(
				time,
				...args,
				`\t${func} ${path.relative(process.cwd(), location)}`
			);
		}
	}
	return console.log(time, ...args);
}
