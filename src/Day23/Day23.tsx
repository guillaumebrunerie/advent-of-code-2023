import { Easing, interpolate, useCurrentFrame } from "remotion";
import { fps, height, white, width, clamp } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { useMemo } from "react";
import { raw } from "./raw";
import { Point } from "../common/Point";
import { Rectangle } from "../common/Rectangle";
import { Translate } from "../common/Translate";

type Hike = {
	maze: string[][],
	pos: Point,
	length: number,
	points: Point[],
};

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
		const directions = slippery ? {
			".": [[-1, 0], [1, 0], [0, -1], [0, 1]],
			">": [[1, 0]],
			"<": [[-1, 0]],
			"v": [[0, 1]],
			"^": [[0, -1]],
		}[hike.maze[hike.pos.y][hike.pos.x]] : [[-1, 0], [1, 0], [0, -1], [0, 1]];
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
		}[]
	}
	const specialPoints: SpecialPoint[] = [];
	maze.forEach((line, y) => line.forEach((char, x) => {
		if (char == "." && (y == 0 || y == rows - 1)) {
			specialPoints.push({x, y, nexts: []});
		} else if (y > 0 && y < rows - 1 && char == "." && [[-1, 0], [1, 0], [0, -1], [0, 1]].filter(([dx, dy]) => maze[y + dy][x + dx] !== "#").length > 2) {
			specialPoints.push({x, y, nexts: []});
		}
	}));

	specialPoints.forEach(point => {
		let hikes: Hike[] = [{
			maze,
			pos: point,
			length: 0,
			points: [],
		}];
		const doneHikes: Hike[] = [];
		while (hikes.length > 0) {
			hikes = hikes.flatMap(hike => continueHike(hike, false));
			doneHikes.push(...hikes.filter(hike => specialPoints.some(p => p.x === hike.pos.x && p.y === hike.pos.y)));
			hikes = hikes.filter(hike => !specialPoints.some(p => p.x === hike.pos.x && p.y === hike.pos.y));
		}
		point.nexts = doneHikes.map(h => ({
			pos: h.pos,
			distance: h.length,
		}));
	});

	// const cache = new Map<string, number>();

	// type Hike2 = {
	// 	points: Point[],
	// 	pos: SpecialPoint,
	// 	length: number,
	// };

	// const findBestHike = (hike: Hike2): number => {
	// 	if (hike.pos.y == rows - 1) {
	// 		return hike.length;
	// 	}
	// 	const key = `${hike.pos.x}/${hike.pos.y}-${hike.points.map(({x, y}) => `${x}/${y}`).toSorted().join("-")}-${hike.length}`;
	// 	if (cache.has(key)) {
	// 		return cache.get(key)!;
	// 	} else {
	// 		const nexts = continueHike2(hike);
	// 		const result = Math.max(...nexts.map(h => findBestHike(h)));
	// 		cache.set(key, result);
	// 		return result;
	// 	}
	// };

	// const continueHike2 = (hike: Hike2): Hike2[] => {
	// 	return hike.pos.nexts.flatMap(next => {
	// 		if (hike.points.some(p => p.x == next.pos.x && p.y == next.pos.y)) {
	// 			return [];
	// 		} else {
	// 			const sp = specialPoints.find(p => p.x === next.pos.x && p.y == next.pos.y)!;
	// 			return [{
	// 				points: [...hike.points, hike.pos],
	// 				pos: sp,
	// 				length: hike.length + next.distance,
	// 			}]
	// 		}
	// 	});
	// }

	// let hikes2: Hike2[] = [{
	// 	points: [],
	// 	pos: specialPoints[0],
	// 	length: 0,
	// }];
	// // const doneHikes2: Hike2[] = [];
	// // while (hikes2.length > 0) {
	// // 	hikes2 = hikes2.flatMap(hike => continueHike2(hike));
	// // 	doneHikes2.push(...hikes2.filter(hike => hike.pos == specialPoints[specialPoints.length - 1]));
	// // 	hikes2 = hikes2.filter(hike => hike.pos != specialPoints[specialPoints.length - 1]);
	// // }
	// console.log(`Day 23, part 2: ${findBestHike(hikes2[0])}`);
	// // debugger;

	// // console.log(`Day 23, part 2: ${Math.max(...doneHikes2.map(hike => hike.length)) - 1}`);

	// let hikes2: Hike[] = [{
	// 	maze,
	// 	pos: {x: initialX, y: 0},
	// 	length: 0,
	// 	points: [],
	// }];
	// const doneHikes2: Hike[] = [];
	// while (hikes2.length > 0) {
	// 	hikes2 = hikes2.flatMap(hike => continueHike(hike, false));
	// 	doneHikes2.push(...hikes2.filter(hike => hike.pos.y === rows - 1));
	// 	if (doneHikes2.length > 0) {
	// 		break;
	// 	}
	// 	hikes2 = hikes2.filter(hike => hike.pos.y !== rows - 1);
	// }
	// const hike2 = doneHikes2[0];

	// const maze2 = raw2.split("\n").map(line => line.split(""));

	// let hikes2: Hike[] = [{
	// 	maze: maze2,
	// 	pos: {x: initialX, y: 0},
	// 	length: 0,
	// 	points: [],
	// }];
	// const doneHikes2: Hike[] = [];
	// while (hikes2.length > 0) {
	// 	hikes2 = hikes2.flatMap(hike => continueHike(hike));
	// 	doneHikes2.push(...hikes2.filter(hike => hike.pos.y === rows - 1));
	// 	hikes2 = hikes2.filter(hike => hike.pos.y !== rows - 1);
	// }

	const hike1 = doneHikes.find(hike => hike.length === Math.max(...doneHikes.map(hike => hike.length)))!;
	const hike2 = hike1;
	return {maze, hike1, hike2};
}

const cellSize = 7.5;

export const Day23 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {maze, hike1, hike2} = useMemo(solve, []);
	const hike = isPart1 ? hike1 : hike2;
	const index = interpolate(time % 8, [0.15, 7.85], [0, hike.points.length - 1], {...clamp, easing: Easing.ease});

	return (
		<DayWrapper day={23} title="A Long Walk" dayDuration={dayDuration}>
			<Translate dx={(width - maze[0].length * cellSize) / 2} dy={(height - maze.length * cellSize) / 2}>
				{maze.map((line, i) => line.map((char, j) => {
					if (char === ".") {
						return null;
					}
					return <Rectangle x={j * cellSize} y={i * cellSize} w={cellSize} h={cellSize} style={{backgroundColor: char === "#" ? white : "#C00"}} />
				}))}
				{hike.points.slice(0, index).map(pos => {
					return <Rectangle x={pos.x * cellSize} y={pos.y * cellSize} w={cellSize} h={cellSize} style={{backgroundColor: "#0A0"}} />
				})}
			</Translate>
		</DayWrapper>
	);
};
