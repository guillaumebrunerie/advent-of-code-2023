import { interpolate, useCurrentFrame } from "remotion";
import { black, clamp, fps, height, width } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { CSSProperties, Fragment, useMemo } from "react";
import { raw } from "./raw";
import { poissonDiskSampling } from "../common/poissonDiskSampling";
import { Dot } from "../common/Dot";
import { Line } from "../common/Line";
import { Point } from "../common/Point";

type Module = {
	type: string,
	outputs: string[],
	state: boolean,
	inputs: string[],
	inputMemory: boolean[];
};

type Pulse = {
	high: boolean,
	src: string,
	dest: string,
};

const solve = () => {
	const modules: Record<string, Module> = {};
	raw.split("\n").forEach(line => {
		const [input, output] = line.split(" -> ");
		const type = input === "broadcaster" ? input : input[0];
		const name = input === "broadcaster" ? input : input.slice(1);
		const outputs = output.split(", ");
		modules[name] = {type, outputs, state: false, inputs: [], inputMemory: []};
	});

	Object.entries(modules).forEach(([name, {outputs}]) => {
		for (const output of outputs) {
			if (!modules[output]) {
				modules[output] = {type: "", outputs: [], state: false, inputs: [], inputMemory: []};
			}
			modules[output].inputs.push(name);
			modules[output].inputMemory.push(false);
		}
	});

	const processPulse = (pulse: Pulse) => {
		const mod = modules[pulse.dest];
		switch (mod.type) {
		case "broadcaster":
			return mod.outputs.map(dest => ({src: pulse.dest, high: pulse.high, dest}));
		case "%":
			if (pulse.high) {
				return [];
			}
			mod.state = !mod.state;
			return mod.outputs.map(dest => ({src: pulse.dest, high: mod.state, dest}));
		case "&": {
			const i = mod.inputs.indexOf(pulse.src);
			mod.inputMemory[i] = pulse.high;
			const allHigh = mod.inputMemory.every(p => p);
			return mod.outputs.map(dest => ({src: pulse.dest, high: !allHigh, dest}));
		}
		case "": {
			return [];
		}
		default:
			throw new Error("unsupported");
		}
	};

	const processPulses = (pulses: Pulse[]) => {
		return pulses.flatMap(pulse => processPulse(pulse));
	};

	const pressButton = () => {
		let highs = 0;
		let lows = 0;
		let activated = false;
		let pulses: Pulse[] = [{src: "", high: false, dest: "broadcaster"}];
		const pulseHistory = [{pulses, state: JSON.parse(JSON.stringify(modules)) as typeof modules}];
		while (pulses.length > 0) {
			highs += pulses.filter(pulse => pulse.high).length;
			lows += pulses.filter(pulse => !pulse.high).length;
			if (pulses.some(pulse => !pulse.high && pulse.dest === "rx")) {
				activated = true;
			}
			pulses = processPulses(pulses);
			pulseHistory.push({pulses, state: JSON.parse(JSON.stringify(modules)) as typeof modules});
		}
		return {highs, lows, activated, pulseHistory};
	};

	const solve1 = (presses = 1000) => {
		let highs = 0;
		let lows = 0;
		const pulseHistories = [];
		for (let k = 0; k < presses; k++) {
			const result = pressButton();
			highs += result.highs;
			lows += result.lows;
			pulseHistories.push(result.pulseHistory);
		}
		return {value: highs * lows, pulseHistories};
	};

	const {value, pulseHistories} = solve1();
	console.log(`Day 20, part 1: ${value}`);

	// Did it by hand
	console.log(`Day 20, part 2: 224602011344203`);

	Object.values(modules).forEach(mod => {
		mod.state = false;
		mod.inputMemory = mod.inputs.map(() => false);
	});

	// To see the end of part 2, but it takes too long
	// for (const name of [
	// 	"pt", "hv", "hj", "ch", "vr", "xq", "rr", "tr",
	// 	"gv", "kq", "qg", "nk", "vk", "mp", "nn", "cv",
	// 	"tp", "zc", "lq", "gr", "qh", "nm", "js",
	// 	"bv", "vq", "gm", "km", "fc", "vv", "vn",
	// ]) {
	// 	modules[name].state = true;
	// }
	// for (const name of ["qq", "fj", "vm", "jc"]) {
	// 	modules[name].inputMemory = modules[name].inputs.map(i => modules[i].state);
	// }

	return {pulseHistories};
};

const distribution = poissonDiskSampling(width, height, 150, 50, "day20");

const styles = {
	"%": {
		backgroundColor: black,
		border: "5px solid #0C0",
	},
	"%on": {
		backgroundColor: "#0C0",
	},
	"&": {
		backgroundColor: "#CC0",
	},
	"": {
		backgroundColor: "#C00",
	},
	"broadcaster": {
		backgroundColor: "#C00",
	},
};

const getStyle = (mod: Module) => {
	if (mod.type === "%" && mod.state) {
		return styles["%on"];
	}
	return styles[mod.type as never];
};

const deltaX = 470;
const mainY = 400;
const y2 = 700;
const delta = 80;

const x0 = (width - 3 * deltaX) / 2;
const centers = [
	{x: x0, y: mainY},
	{x: x0 + deltaX, y: mainY},
	{x: x0 + 2 * deltaX, y: mainY},
	{x: x0 + 3 * deltaX, y: mainY},
];
const special = {
	broadcaster: {x: 1750, y: 50},

	qq: {x: x0, y: mainY},
	fj: {x: x0 + deltaX, y: mainY},
	vm: {x: x0 + 2 * deltaX, y: mainY},
	jc: {x: x0 + 3 * deltaX, y: mainY},

	ft: {x: x0 + delta, y: y2},
	jz: {x: x0 + delta + deltaX, y: y2},
	ng: {x: x0 - delta + 2 * deltaX, y: y2},
	sv: {x: x0 - delta + 3 * deltaX, y: y2},

	xm: {x: width / 2, y: 850},

	rx: {x: width / 2, y: 1030},
};
const radius = 160;

const part2Position = (name: string, i: number) => {
	if (name in special) {
		return special[name];
	}

	const cycles = [
		["pt", "pf", "hv", "hj", "ch", "xt", "lh", "sr", "vr", "xq", "rr", "tr"],
		["tp", "bj", "zc", "qv", "kf", "mr", "lq", "ql", "gr", "qh", "nm", "js"],
		["gv", "kq", "nv", "mb", "qg", "sn", "nk", "vk", "hz", "mp", "nn", "cv"],
		["bv", "mf", "pk", "vq", "jd", "gm", "rl", "nc", "km", "fc", "vv", "vn"],
	];
	const testCycle = (i: number) => {
		const k = cycles[i].indexOf(name);
		if (k !== -1) {
			return {
				x: centers[i].x + radius * Math.cos(k * Math.PI / 6),
				y: centers[i].y + radius * Math.sin(k * Math.PI / 6),
			};
		}
	};
	return testCycle(0) || testCycle(1) || testCycle(2) || testCycle(3) || distribution[i];
};

const arrowAngle = 25 * Math.PI / 180;
const arrowDistance = 15;
const Arrow = ({
	from,
	to,
	color,
	width,
	style,
}: {
	from: Point;
	to: Point;
	color: string;
	width: number;
	style?: CSSProperties;
}) => {
	const padding = 20;
	const alpha = Math.PI + Math.atan2(to.y - from.y, to.x - from.x);
	const newTo = {
		x: to.x + padding * Math.cos(alpha),
		y: to.y + padding * Math.sin(alpha),
	}
	const pt1 = {
		x: newTo.x + arrowDistance * Math.cos(alpha + arrowAngle),
		y: newTo.y + arrowDistance * Math.sin(alpha + arrowAngle),
	};
	const pt2 = {
		x: newTo.x + arrowDistance * Math.cos(alpha - arrowAngle),
		y: newTo.y + arrowDistance * Math.sin(alpha - arrowAngle),
	};
	return (
		<>
			<Line from={from} to={newTo} color={color} width={width} style={style}/>
			<Line from={pt1} to={newTo} color={color} width={width} style={style}/>
			<Line from={pt2} to={newTo} color={color} width={width} style={style}/>
		</>
	)
};

export const Day20 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const {pulseHistories} = useMemo(solve, []);
	const pulsesHistory = pulseHistories.slice(0, 20).flat().filter(({pulses}) => pulses.length > 1);
	const pulseIndex = interpolate(time % 8, [0.15, 7.85], [0, isPart1 ? 25 : 40], clamp) + (isPart1 ? 0 : 25);
	const pulses = pulsesHistory[Math.floor(pulseIndex)]
	const modules = pulses.state;
	const keys = Object.keys(modules);
	const pulseT = pulseIndex % 1;

	const positionShift = interpolate(time, [8.15, 9], [0, 1], clamp);

	const position = (i: number) => {
		const pos1 = distribution[i];
		const pos2 = part2Position(keys[i], i);
		return {
			x: interpolate(positionShift, [0, 1], [pos1.x, pos2.x]),
			y: interpolate(positionShift, [0, 1], [pos1.y, pos2.y]),
		};
	};

	return (
		<DayWrapper day={20} title="Pulse Propagation" dayDuration={dayDuration}>
			{keys.map((key, i) => {
				const mod = modules[key];
				return (
					<Fragment key={key}>
						{mod.outputs.map(output => {
							const j = keys.indexOf(output);
							return <Arrow key={output} from={position(i)} to={position(j)} color="#AAA" width={3}/>
						})}
					</Fragment>
				);
			})}
			{pulses.pulses.map((pulse, i) => {
				const j = keys.indexOf(pulse.src);
				const k = keys.indexOf(pulse.dest);
				const p = {
					x: interpolate(pulseT, [0, 1], [position(j).x, position(k).x], clamp),
					y: interpolate(pulseT, [0, 1], [position(j).y, position(k).y], clamp),
				};
				return (
					<Dot key={i} c={p} r={pulse.high ? 8 : 15} style={{backgroundColor: "white"}}/>
				)
			})}
			{keys.map((key, i) => {
				const mod = modules[key];
				return (
					<Dot key={key} c={position(i)} r={20} style={getStyle(mod)}/>
				);
			})}
		</DayWrapper>
	);
};
