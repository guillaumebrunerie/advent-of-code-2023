import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Point } from "../common/Point";
import { raw } from "./raw";
import { clamp, fps, height, white, width } from "../constants";
import { useMemo } from "react";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Svg } from "../common/Svg";
import { Dot } from "../common/Dot";

const solve = () => {
	const maze = raw.split("\n").map(line => line.split(""));
	const y = maze.findIndex(line => line.includes("S"));
	const x = maze[y].indexOf("S");
	maze[y] = maze[y].map(c => c === "S" ? "|" : c);

	const dirs = {
		"|": [{dx: 0, dy: 1}, {dx: 0, dy: -1}],
		"-": [{dx: -1, dy: 0}, {dx: 1, dy: 0}],
		"L": [{dx: 0, dy: -1}, {dx: 1, dy: 0}],
		"J": [{dx: 0, dy: -1}, {dx: -1, dy: 0}],
		"7": [{dx: 0, dy: 1}, {dx: -1, dy: 0}],
		"F": [{dx: 0, dy: 1}, {dx: 1, dy: 0}],
	};

	const distances = maze.map(line => line.map(() => 0))
	distances[y][x] = 1;
	distances[y-1][x] = 2;
	distances[y+1][x] = 2;
	let steps = 2;
	let pos1 = {x, y: y-1};
	const positions1 = [{x, y}, pos1];
	let pos2 = {x, y: y+1};
	const positions2 = [{x, y}, pos2];
	while (pos1.x !== pos2.x || pos1.y !== pos2.y) {
		steps++;
		const findNewPos = (pos: Point) => {
			for (const dir of dirs[maze[pos.y][pos.x]]) {
				const newPos = {
					x: pos.x + dir.dx,
					y: pos.y + dir.dy,
				};
				const d = distances[newPos.y][newPos.x];
				if (d === 0 || d === steps) {
					distances[newPos.y][newPos.x] = steps;
					return newPos;
				}
			}
			throw new Error("error");
		}
		pos1 = findNewPos(pos1);
		positions1.push(pos1);
		pos2 = findNewPos(pos2);
		positions2.push(pos2);
	}
	console.log(`Day 10, part 1: ${steps - 1}`);

	const insides = maze.map(line => line.map(() => [[0, 0], [0, 0]]));
	let insideCount = 0;
	maze.forEach((line, y) => {
		line.forEach((_, x) => {
			const countInsides = (top: boolean, left: boolean) => line.filter((c, x2) =>
				(x2 > x || (left && x2 === x))
					&& distances[y][x2] > 0
					&& (top ? "|LJ" : "|F7").includes(c)
			).length;
			insides[y][x] = [
				[countInsides(true, true) % 2 === 1 ? 0 : Infinity, countInsides(true, false) % 2 === 1 ? 0 : Infinity],
				[countInsides(false, true) % 2 === 1 ? 0 : Infinity, countInsides(false, false) % 2 === 1 ? 0 : Infinity],
			]
			if (distances[y][x] === 0 && insides[y][x][0][0]) {
				insideCount++;
			}
		});
	});
	console.log(`Day 10, part 2: ${insideCount}`);

	type Pos = {x: number, y: number, top: boolean, left: boolean};
	const get = ({x, y, top, left}: Pos) => insides[y][x][top ? 0 : 1][left ? 0 : 1];
	const set = ({x, y, top, left}: Pos, v: number) => {
		insides[y][x][top ? 0 : 1][left ? 0 : 1] = v;
	}
	const neighbours = ({x, y, top, left}: Pos) => ([
		{
			x: left ? x - 1 : x,
			y,
			top,
			left: !left,
		},
		{
			x: left ? x : x + 1,
			y,
			top,
			left: !left,
		},
		{
			x,
			y: top ? y - 1 : y,
			top: !top,
			left,
		},
		{
			x,
			y: top ? y : y + 1,
			top: !top,
			left,
		},
	]);
	let toVisit = [{...positions1[positions1.length - 1], top: true, left: false}];
	let dist = 1;
	while (toVisit.length > 0) {
		const nextToVisit: Pos[] = [];
		const add = (p: Pos) => {
			if (!nextToVisit.some(q => q.x === p.x && q.y === p.y && q.top === p.top && q.left === p.left)) {
				nextToVisit.push(p);
			}
		}
		for (const p of toVisit) {
			set(p, dist);
			for (const n of neighbours(p)) {
				if (get(n) === 0) {
					add(n);
				}
			}
		}
		toVisit = nextToVisit;
		dist++;
	}

	return {maze, distances, maxDistance: steps, insides, maxInsideDistance: dist, positions1, positions2};
}

const insidePiece = (
	x: number,
	y: number,
	insides: number[][],
	center: Point,
	size: number,
	index: number,
) => {
	const factor = height / size;
	const convertX = (x: number) => (x - center.x) * factor + width / 2;
	const convertY = (y: number) => (y - center.y) * factor + height / 2;

	const n = {x: convertX(x), y: convertY(y - 0.5)};
	const s = {x: convertX(x), y: convertY(y + 0.5)};
	const w = {x: convertX(x - 0.5), y: convertY(y)};
	const e = {x: convertX(x + 0.5), y: convertY(y)};
	const m = {x: convertX(x), y: convertY(y)};
	const sizeX = convertX(0.5) - convertX(0);
	const sizeY = convertY(0.5) - convertY(0);
	return [
		(insides[0][0] < index) && <rect x={w.x} y={n.y} width={sizeX} height={sizeY}/>,
		(insides[0][1] < index) && <rect x={n.x} y={n.y} width={sizeX} height={sizeY}/>,
		(insides[1][0] < index) && <rect x={w.x} y={w.y} width={sizeX} height={sizeY}/>,
		(insides[1][1] < index) && <rect x={m.x} y={m.y} width={sizeX} height={sizeY}/>,
	];
};

const MazeInside = ({insides, center, size, index}: {insides: number[][][][], center: Point, size: number, index: number}) => {
	return insides.map((line, y) => line.map((insides, x) => (
		insidePiece(x, y, insides, center, size, index)
	)));
};

const mazePath = (x: number, y: number, c: string, mazeSize: number, size: number, center: Point) => {
	const factor = height / size;
	const convertX = (x: number) => (x - center.x) * factor + width / 2;
	const convertY = (y: number) => (y - center.y) * factor + height / 2;

	const n = {x: convertX(x), y: convertY(y - 0.5)};
	const s = {x: convertX(x), y: convertY(y + 0.5)};
	const w = {x: convertX(x - 0.5), y: convertY(y)};
	const e = {x: convertX(x + 0.5), y: convertY(y)};
	const m = {x: convertX(x), y: convertY(y)};
	const path = (from: Point, to: Point) => `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
	switch (c) {
	case "|":
		return [path(n, s)];
	case "-":
		return [path(w, e)];
	case "L":
		return [path(n, m), path(m, e)];
	case "J":
		return [path(n, m), path(m, w)];
	case "7":
		return [path(s, m), path(m, w)];
	case "F":
		return [path(s, m), path(m, e)];
	case ".":
		return [];
	default:
		throw new Error("Invalid");
	}
};

export const Maze = ({maze, distances, index, size, center, isPart1}: {
	maze: string[][],
	distances: number[][],
	index: number,
	size: number,
	center: Point,
	isPart1: boolean,
}) => {
	const d = maze.map((line, y) => line.map((c, x) => mazePath(x, y, c, maze.length, size, center)).join(" ")).join(" ");
	const dGreen = maze.map((line, y) => line.map((c, x) => (distances[y][x] > 0 && distances[y][x] <= index) ? mazePath(x, y, c, maze.length, size, center) : "").join(" ")).join(" ");
	return (
		<Svg style={{strokeWidth: 200 / size, strokeLinecap: "round"}}>
			<path style={{stroke: white}} d={d}/>
			<path style={{stroke: isPart1 ? "#008800" : "#CCCCCC"}} d={dGreen}/>
		</Svg>
	)
};

const interpolation = (time: number, n2: number) => {
	const t0 = 2 - 0.15;
	const t1 = 4 - 0.15;
	const t2 = 8 - 0.25;
	const n0 = 120;

	const t = time - 0.15;

	if (t <= 0) {
		return 0;
	}
	if (t <= t0) {
		return t * n0 / t0;
	}
	const a = (n2 - t2 * n0 / t0 - (t2 - t1) * n0 / t0) / ((t1 - t0) ** 2 + (t2 - t1) * 2 * (t1 - t0))
	if (t <= t1) {
		return t * n0 / t0 + a * (t - t0) * (t - t0); // Derivative: n0 / t0 + 2 * a * (t - t0)
	}
	if (t <= t2) {
		return t * n0 / t0 + a * (t1 - t0) * (t1 - t0) + (t - t1) * (n0 / t0 + 2 * a * (t1 - t0));
	}
	return n2;
}

export const Day10 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const {maze, distances, maxDistance, insides, maxInsideDistance, positions1, positions2} = useMemo(solve, []);
	const index = Math.floor(interpolation(time, maxDistance - 1))
	// const index = Math.floor(interpolate(
	// 	time,
	// 	[0, 2.5, 4, 8],
	// 	[0, 150, 1000, maxDistance - 1],
	// 	{...clamp},
	// ));
	const pos1 = positions1[index];
	const pos2 = positions2[index];

	const size = interpolate(time, [2, 4], [28, 140], {...clamp, easing: Easing.ease});
	const center = {
		x: interpolate(time, [2, 4], [positions1[0].x, maze.length / 2], {...clamp, easing: Easing.ease}),
		y: interpolate(time, [2, 4], [positions1[0].y + 2, maze.length / 2], {...clamp, easing: Easing.ease}),
	};
	const factor = height / size;
	const convertX = (x: number) => (x - center.x) * factor + width / 2;
	const convertY = (y: number) => (y - center.y) * factor + height / 2;

	const insideIndex = Math.floor(interpolate(time, [8, 15.85], [0, maxInsideDistance], clamp));

	return (
		<DayWrapper day={10} title="Pipe Maze" dayDuration={dayDuration}>
			{!isPart1 && (
				<Svg style={{fill: "#006600"}}>
					<MazeInside insides={insides} center={center} size={size} index={insideIndex}/>
				</Svg>
			)}
			<Maze maze={maze} distances={distances} index={index} size={size} center={center} isPart1={isPart1}/>
			{isPart1 && <Dot c={{x: convertX(pos1.x), y: convertY(pos1.y)}} r={height / size / 2} style={{backgroundColor: "#00BB00"}}/>}
			{isPart1 && <Dot c={{x: convertX(pos2.x), y: convertY(pos2.y)}} r={height / size / 2} style={{backgroundColor: "#00BB00"}}/>}
		</DayWrapper>
	)
};
