import { Easing, interpolate, useCurrentFrame } from "remotion";
import { fps, height, white, width, clamp } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { useMemo } from "react";
import { raw } from "./raw";
import { Point } from "../common/Point";
import { Rectangle } from "../common/Rectangle";
import { Translate } from "../common/Translate";
import { hike2 } from "./data";

type Hike = {
	maze: string[][],
	pos: Point,
	length: number,
	points: Point[],
};

const baseDirections = {
	".": [[-1, 0], [1, 0], [0, -1], [0, 1]],
	">": [[1, 0]],
	"<": [[-1, 0]],
	"v": [[0, 1]],
	"^": [[0, -1]],
} as const;

const solve = () => {
// 	const raw = `#.#####################
// #.......#########...###
// #######.#########.#.###
// ###.....#.>.>.###.#.###
// ###v#####.#v#.###.#.###
// ###.>...#.#.#.....#...#
// ###v###.#.#.#########.#
// ###...#.#.#.......#...#
// #####.#.#.#######.#.###
// #.....#.#.#.......#...#
// #.#####.#.#.#########v#
// #.#...#...#...###...>.#
// #.#.#v#######v###.###v#
// #...#.>.#...>.>.#.###.#
// #####v#.#.###v#.#.###.#
// #.....#...#...#.#.#...#
// #.#########.###.#.#.###
// #...###...#...#...#.###
// ###.###.#.###v#####v###
// #...#...#.#.>.>.#.>.###
// #.###.###.#.###.#.#v###
// #.....###...###...#...#
// #####################.#`;

	const maze = raw.split("\n").map(line => line.split(""));
	const initialX = maze[0].indexOf(".");
	const rows = maze.length;

	const continueHike = (hike: Hike, slippery = true): Hike[] => {
		const directions = slippery ? baseDirections[hike.maze[hike.pos.y][hike.pos.x]] : [[-1, 0], [1, 0], [0, -1], [0, 1]];
		if (!directions) {
			throw new Error("invalid");
		}
		return directions.flatMap(([dx, dy]) => {
			const x = hike.pos.x + dx;
			const y = hike.pos.y + dy;
			if (y < 0 || y >= rows || hike.maze[y][x] == "#" || hike.maze[y][x] == "X") {
				return [];
			}
			return [{
				maze: hike.maze.with(hike.pos.y, hike.maze[hike.pos.y].with(hike.pos.x, "X")),
				pos: {x, y},
				length: hike.length + 1,
				points: [...hike.points, hike.pos],
			}];
		});
	};

	let hikes: Hike[] = [{
		maze,
		pos: {x: initialX, y: 0},
		length: 0,
		points: [],
	}];
	const doneHikes: Hike[] = [];
	while (hikes.length > 0) {
		hikes = hikes.flatMap(hike => continueHike(hike));
		doneHikes.push(...hikes.filter(hike => hike.pos.y === rows - 1));
		hikes = hikes.filter(hike => hike.pos.y !== rows - 1);
	}

	console.log(`Day 23, part 1: ${Math.max(...doneHikes.map(hike => hike.length))}`);

	type SpecialPoint = {
		x: number,
		y: number,
		nexts: {
			pos: Point,
			distance: number,
			points: Point[],
		}[]
	}
	const specialPoints: SpecialPoint[] = [];
	maze.forEach((line, y) => line.forEach((char, x) => {
		if (char !== ".") {
			return;
		}
		if (y == 0 || y == rows - 1) {
			specialPoints.push({x, y, nexts: []});
		} else if ([[-1, 0], [1, 0], [0, -1], [0, 1]].filter(([dx, dy]) => maze[y + dy][x + dx] !== "#").length > 2) {
			specialPoints.push({x, y, nexts: []});
		}
	}));

	// specialPoints.forEach(point => {
	// 	let hikes: Hike[] = [{
	// 		maze,
	// 		pos: point,
	// 		length: 0,
	// 		points: [],
	// 	}];
	// 	const doneHikes: Hike[] = [];
	// 	while (hikes.length > 0) {
	// 		hikes = hikes.flatMap(hike => continueHike(hike, false));
	// 		doneHikes.push(...hikes.filter(hike => specialPoints.some(p => p.x === hike.pos.x && p.y === hike.pos.y)));
	// 		hikes = hikes.filter(hike => !specialPoints.some(p => p.x === hike.pos.x && p.y === hike.pos.y));
	// 	}
	// 	point.nexts = doneHikes.map(h => ({
	// 		pos: h.pos,
	// 		distance: h.length,
	// 		points: h.points,
	// 	}));
	// });

	// type Points = {
	// 	points: SpecialPoint[],
	// 	distance: number,
	// };

	// const cache = new Map<string, Points>();

	// type Hike2 = {
	// 	points: SpecialPoint[],
	// 	pos: SpecialPoint,
	// 	length: number,
	// 	allowedPositions: SpecialPoint[],
	// };

	// const continueHike2 = (hike: Hike2): Hike2[] => {
	// 	return hike.pos.nexts.flatMap(next => {
	// 		if (!hike.allowedPositions.some(p => p.x == next.pos.x && p.y == next.pos.y)) {
	// 			return [];
	// 		} else {
	// 			const sp = specialPoints.find(p => p.x === next.pos.x && p.y == next.pos.y)!;
	// 			return [{
	// 				points: [...hike.points, sp],
	// 				pos: sp,
	// 				length: hike.length + next.distance,
	// 				allowedPositions: hike.allowedPositions.filter(p => p.x !== sp.x || p.y !== sp.y),
	// 			}]
	// 		}
	// 	});
	// };

	// const findBestRemainingHike = (hike: Hike2): Points => {
	// 	if (hike.pos.y == rows - 1) {
	// 		return {points: [hike.pos], distance: 0};
	// 	}
	// 	const key = `${hike.pos.x}/${hike.pos.y}-${hike.allowedPositions.map(({x, y}) => `${x}/${y}`).join("-")}`;
	// 	if (cache.has(key)) {
	// 		return cache.get(key)!;
	// 	} else {
	// 		const nexts = continueHike2(hike);
	// 		const hikes = nexts.flatMap(h => {
	// 			const hs = findBestRemainingHike(h);
	// 			if (!hs) {
	// 				return [];
	// 			} else {
	// 				return [{distance: h.length + hs.distance - hike.length, points: [hike.pos, ...hs.points]}];
	// 			}
	// 		});
	// 		hikes.sort((h1, h2) => h2.distance - h1.distance);
	// 		const result = hikes[0];
	// 		cache.set(key, result);
	// 		return result;
	// 	}
	// };

	// const hike2 = findBestRemainingHike({
	// 	points: [specialPoints[0]],
	// 	pos: specialPoints[0],
	// 	length: 0,
	// 	allowedPositions: specialPoints.slice(1),
	// })!;
	// console.log(`Day 23, part 2: ${hike2.distance}`);

	// const trueHike2 = hike2.points.flatMap((p, i) => {
	// 	if (i == hike2.points.length - 1) {
	// 		return [p];
	// 	} else {
	// 		return p.nexts.find(k => k.pos.x === hike2.points[i+1].x && k.pos.y === hike2.points[i+1].y).points;
	// 	}
	// });

	// console.log(JSON.stringify(trueHike2.map(p => ({x: p.x, y: p.y})), null, 2));

	// debugger;
	const hike1 = doneHikes.find(hike => hike.length === Math.max(...doneHikes.map(hike => hike.length)))!;
	return {maze, hike1, specialPoints};
};

const cellSize = 7.5;

export const Day23 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {maze, hike1, specialPoints} = useMemo(solve, []);

	const points = isPart1 ? [...hike1.points, hike1.pos] : hike2.points;
	const index = interpolate(time % 8, [0.15, 7.8], [0, points.length], {...clamp});

	const isSpecial = (x: number, y: number) => specialPoints.some(p => x == p.x && y == p.y && p.y !== maze.length - 1);
	const toColor = (x: number, y: number) => {
		if (isSpecial(x, y)) {
			return true;
		}
		if (isPart2) {
			return false;
		}
		if ("<>^v".includes(maze[y][x])) {
			const [[dx, dy]] = baseDirections[maze[y][x]];
			return isSpecial(x - dx, y - dy);
		}
	}

	return (
		<DayWrapper day={23} title="A Long Walk" dayDuration={dayDuration}>
			<Translate dx={(width - maze[0].length * cellSize) / 2} dy={(height - maze.length * cellSize) / 2}>
				{maze.map((line, i) => line.map((char, j) => {
					let color = white;
					if (toColor(j, i)) {
						color = "#CC0";
					} else if (char !== "#") {
						return null;
					}
					return <Rectangle key={`${i}-${j}`} x={j * cellSize} y={i * cellSize} w={cellSize} h={cellSize} style={{backgroundColor: color}} />
				}))}
				{points.slice(0, index).map((pos, i) => {
					return toColor(pos.x, pos.y) || <Rectangle key={i} x={pos.x * cellSize} y={pos.y * cellSize} w={cellSize} h={cellSize} style={{backgroundColor: "#0A0"}} />
				})}
			</Translate>
		</DayWrapper>
	);
};
