import { interpolate, useCurrentFrame } from "remotion";
import { raw } from "./raw";
import { fps, grey, height, white, width } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Fragment, useMemo } from "react";
import { Point } from "../common/Point";
import { Dot } from "../common/Dot";
import { Line } from "../common/Line";

const solve = () => {
	const [instructions, data] = raw.split("\n\n");
	const graph: {[node: string]: {
		left: string,
		right: string,
		from: string[],
		reachCycle: {
			left: number,
			right: number,
		},
		distance: number,
		distanceI: number,
	}} = {};
	data.split("\n").forEach(line => {
		const from = line.slice(0, 3);
		const left = line.slice(7, 10);
		const right = line.slice(12, 15);
		graph[from] = {left, right, from: [], reachCycle: {left: 0, right: 0}, distance: Infinity, distanceI: 0};
	});

	for (const node of Object.keys(graph)) {
		const r = graph[node];
		graph[r.left].from.push(node);
		graph[r.right].from.push(node);
	}

	let node = "AAA";
	let i = 0;
	const part1Steps = [];
	while (node !== "ZZZ") {
		part1Steps.push(node);
		const dir = instructions[i % instructions.length];
		node = dir === "L" ? graph[node].left : graph[node].right;
		i++;
	}
	console.log("Day 8, part 1:", i);

	const stuff = [];
	for (const initialNode of Object.keys(graph).filter(node => node.endsWith("A"))) {
		let j = 0;
		let node = initialNode;
		while (j < 1000000) {
			const dir = instructions[j % instructions.length];
			node = dir === "L" ? graph[node].left : graph[node].right;
			j++;
			if (node.endsWith("Z")) {
				if (j % instructions.length !== 0) {
					throw new Error("assumption failed")
				}
				stuff.push(j);
				break;
			}
		}
	}
	console.log("Day 8, part 2:", stuff);

	const part2Steps = Object.keys(graph).filter(node => node.endsWith("A")).map(node => {
		let i = 0;
		const steps = [];
		while (i < 700) {
			steps.push(node);
			const dir = instructions[i % instructions.length];
			node = dir === "L" ? graph[node].left : graph[node].right;
			i++;
		}
		return steps;
	});

	const cycles: {
		left: string[][],
		right: string[][],
	} = {
		left: [],
		right: [],
	}
	const recordCycle = (node: string, side: "left" | "right") => {
		if (cycles[side].some(cycle => cycle.includes(node))) {
			return;
		}
		const cycle = [];
		let currentNode = node;
		do {
			cycle.push(currentNode);
			currentNode = graph[currentNode][side];
			if (cycle.length > 1000) {
				throw new Error("Infinite loop?");
			}
		} while (currentNode !== node)
		cycles[side].push(cycle);
	}
	const reach = (node: string, side: "left" | "right", k: number) => {
		if (graph[node].reachCycle[side] === k) {
			recordCycle(node, side);
		} else {
			graph[node].reachCycle[side] = k;
			reach(graph[node][side], side, k);
		}
	}
	let k = 0;
	for (const node of Object.keys(graph)) {
		if (!graph[node].reachCycle.left) {
			reach(node, "left", k);
		}
		if (!graph[node].reachCycle.right) {
			reach(node, "right", k);
		}
		k++
	}

	// Looks like the left/right cycles are pretty similar. Let’s check.
	if (cycles.left.length !== cycles.right.length) {
		throw new Error("Different cycles");
	}
	const offsets: number[] = [];
	cycles.left.forEach((cycleL, i) => {
		cycles.right.forEach((cycleR, j) => {
			if (i === j) {
				if (cycleL.length !== cycleR.length) {
					throw new Error("Different cycles");
				}
				const stuff = cycleR.flatMap((node, i) =>
					cycleL.indexOf(node) === -1
						? []
						: [(cycleL.length + cycleL.indexOf(node) - i) % cycleL.length]
				);
				if (stuff.some(c => c !== stuff[0])) {
					throw new Error("Irregular offsets");
				}
				offsets[i] = stuff[0];
			} else if (cycleL.some(c => cycleR.includes(c)) || cycleR.some(c => cycleL.includes(c))) {
				throw new Error("Overlapping cycles");
			}
		})
	});

	cycles.right.forEach((cycleR, j) => {
		cycles.right[j] = cycleR.map((_, k) => cycleR[(k - offsets[j] + cycleR.length) % cycleR.length])
	});

	for (const startNode of Object.keys(graph).filter(node => node.endsWith("A"))) {
		let nextNodes = [startNode];
		let i = 0;
		while (nextNodes.length > 0) {
			const newNodes: string[] = [];
			let k = 0;
			for (const node of nextNodes) {
				graph[node].distance = i;
				graph[node].distanceI = k;
				k++;
				for (const newNode of [graph[node].left, graph[node].right].filter(n => graph[n].distance === Infinity)) {
					if (!newNodes.includes(newNode)) {
						newNodes.push(newNode);
					}
				}
			}
			nextNodes = newNodes;
			i++;
			if (i > 1000) {
				throw new Error("Infinite loop");
			}
		}
	}

	return {cycles, graph, part1Steps, part2Steps};
};

const centerPart1 = {
	x: width / 2,
	y: height / 2,
};

const centersPart2 = [{
	x: width / 6,
	y: height / 4,
}, {
	x: 3 * width / 6,
	y: height / 4,
}, {
	x: 5 * width / 6,
	y: height / 4,
}, {
	x: width / 6,
	y: 3 * height / 4,
}, {
	x: 3 * width / 6,
	y: 3 * height / 4,
}, {
	x: 5 * width / 6,
	y: 3 * height / 4,
}];

const radius = height / 5;
const radiusDelta = radius * 0.3;
const part1Factor = 2;

const cycleIndex = (cycles: {
	left: string[][],
	right: string[][],
}, graph: {[node: string]: {
	left: string,
	right: string,
}}, node: string) => {
	const leftI = cycles.left.findIndex(cycle => cycle.includes(node));
	const rightI = cycles.right.findIndex(cycle => cycle.includes(node));
	if (leftI === -1 && rightI === -1) {
		const newNode = graph[node].left;
		const leftI2 = cycles.left.findIndex(cycle => cycle.includes(newNode));
		if (leftI2 !== -1) {
			return leftI2;
		}
		const rightI2 = cycles.right.findIndex(cycle => cycle.includes(newNode));
		if (rightI2 !== -1) {
			return rightI2;
		}
		throw new Error("Did not find cycle");
	}
	if (leftI !== -1 && rightI !== -1 && leftI !== rightI) {
		throw new Error("Invalid");
	}
	if (leftI !== -1) {
		return leftI;
	}
	if (rightI !== -1) {
		return rightI;
	}
	throw new Error("Invalid");
};

const positionNode = (cycles: {
	left: string[][],
	right: string[][],
}, graph: {[node: string]: {
	left: string,
	right: string,
}}, node: string, isPart1: boolean) => {
	const cycleI = cycleIndex(cycles, graph, node);
	if (isPart1 && cycleI !== 2) {
		return null;
	}

	const center = isPart1 ? centerPart1 : centersPart2[cycleI];
	const r = (isPart1 ? part1Factor : 1) * (radius - radiusDelta * graph[node].distanceI);

	if (node.endsWith("A")) {
		return {
			x: center.x,
			y: center.y,
		};
	}

	const angle = ((graph[node].distance - 1) / cycles.left[cycleI].length) * 2 * Math.PI;
	return {
		x: center.x + r * Math.cos(angle),
		y: center.y + r * Math.sin(angle),
	};
};

const positionNodes = (cycles: {
	left: string[][],
	right: string[][],
}, graph: {[node: string]: {
	left: string,
	right: string,
}}, isPart1: boolean) => {
	const result: {[node: string]: Point} = {};
	for (const node of Object.keys(graph)) {
		const pos = positionNode(cycles, graph, node, isPart1);
		if (pos) {
			result[node] = pos;
		}
	}
	return result;
};

const getNonNull = (...ps: (number | null)[]) => {
	for (const p of ps) {
		if (p !== null) {
			return p;
		}
	}
	return null;
}

export const Day8 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const frame = 120 + (isPart1 ? Math.floor(time * 30) : Math.floor((time - dayDuration / 2) * 60));
	const {cycles, graph, part1Steps, part2Steps} = useMemo(solve, []);
	const positions = useMemo(() => positionNodes(cycles, graph, isPart1), [cycles, graph, isPart1]);
	return (
		<DayWrapper day={8} title="Haunted Wasteland" dayDuration={dayDuration}>
			{Object.entries(graph).map(([node, {left, right}], i) => {
				return (
					<Fragment key={i}>
						{positions[node] && positions[left] && <Line from={positions[node]} to={positions[left]} color="#FFFFFF" width={2}/>}
						{positions[node] && positions[right] && <Line from={positions[node]} to={positions[right]} color="#00CC00" width={2}/>}
					</Fragment>
				)
			})}
			{Object.entries(positions).map(([node, pos], i) => {
				const isStart = node.endsWith("A");
				const isEnd = node.endsWith("Z");
				const history = isPart1 ? 30 : 30;
				const getDelta = (steps: string[]) => {
					const delta = steps.slice(frame - history, frame).toReversed().indexOf(node);
					if (delta === -1) {
						return null;
					}
					return delta;
				};
				const delta = isPart1 ? getDelta(part1Steps) : getNonNull(...part2Steps.map(getDelta));
				const r = (isStart || isEnd) ? 10 : delta ? interpolate(delta, [0, history], [15, 5]) : 5;
				const backgroundColor = isStart ? "red" : isEnd ? "red" : "#FFFF66";
				return <Dot key={i} c={pos} r={isPart1 ? r : r / 1.5} style={{backgroundColor}}/>
			})}
		</DayWrapper>
	);
};
