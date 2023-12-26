import { Easing, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { clamp, fps, height, width } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { useMemo } from "react";
import { raw } from "./raw";
import { Svg } from "../common/Svg";
import { translatePath } from "@remotion/paths";

type Brick = {from: [number, number, number], to: [number, number, number], id: number};

const xMin = (brick: Brick) => Math.min(brick.from[0], brick.to[0]);
const xMax = (brick: Brick) => Math.max(brick.from[0], brick.to[0]);
const yMin = (brick: Brick) => Math.min(brick.from[1], brick.to[1]);
const yMax = (brick: Brick) => Math.max(brick.from[1], brick.to[1]);
const zMin = (brick: Brick) => Math.min(brick.from[2], brick.to[2]);
const zMax = (brick: Brick) => Math.max(brick.from[2], brick.to[2]);

const solve = () => {
	const bricks = raw.split("\n").map((line, id) => {
		const [a, b] = line.split("~");
		const from = a.split(",").map(Number);
		const to = b.split(",").map(Number);
		return {from, to, id} as Brick;
	});
	bricks.sort((a, b) => zMin(a) - zMin(b));
	const originalBricks = structuredClone(bricks);

	const doGravity = (bricks: Brick[]) => {
		let changedBricks: Brick[] = [];
		bricks.forEach(brick => {
			let landingZ = 0;
			for (let x = xMin(brick); x <= xMax(brick); x++) {
				for (let y = yMin(brick); y <= yMax(brick); y++) {
					landingZ = Math.max(
						landingZ,
						...bricks.filter(b => x >= xMin(b) && x <= xMax(b) && y >= yMin(b) && y <= yMax(b) && zMax(b) < zMin(brick)).map(zMax),
					);
				}
			}
			const deltaZ = zMin(brick) - landingZ - 1;
			brick.from[2] -= deltaZ;
			brick.to[2] -= deltaZ;
			if (deltaZ > 0) {
				changedBricks.push(brick);
			}
		});
		return changedBricks;
	};
	doGravity(bricks);

	const bricksAbove = (brick: Brick) => bricks.filter(b => (
		(xMax(brick) >= xMin(b) && xMin(brick) <= xMax(b)) &&
			(yMax(brick) >= yMin(b) && yMin(brick) <= yMax(b)) &&
			zMax(brick) + 1 === zMin(b)
	));

	const bricksBelow = (brick: Brick) => bricks.filter(b => (
		(xMax(brick) >= xMin(b) && xMin(brick) <= xMax(b)) &&
			(yMax(brick) >= yMin(b) && yMin(brick) <= yMax(b)) &&
			zMin(brick) - 1 === zMax(b)
	));

	const isDisintegrable = (brick: Brick) => bricksAbove(brick).every(b1 => bricksBelow(b1).some(b2 => b2 !== brick));

	console.log(`Day 22, part 1: ${bricks.filter(isDisintegrable).length}`);

	// let totalPart2 = 0;
	// for (const brick of bricks) {
	// 	const newBricks: Brick[] = structuredClone(bricks.filter(b => b !== brick));
	// 	totalPart2 += doGravity(newBricks).length;
	// 	console.log(`${bricks.indexOf(brick)}/${bricks.length}`);
	// }
	// console.log(`Day 22, part 2: ${totalPart2}`);

	const doGravityStep = (bricks: Brick[]) => {
		bricks = structuredClone(bricks);
		bricks.forEach((brick, i) => {
			let landingZ = 0;
			for (let x = xMin(brick); x <= xMax(brick); x++) {
				for (let y = yMin(brick); y <= yMax(brick); y++) {
					landingZ = Math.max(
						landingZ,
						...bricks.filter(b => x >= xMin(b) && x <= xMax(b) && y >= yMin(b) && y <= yMax(b) && zMax(b) < zMin(brick)).map(zMax),
					);
				}
			}
			const deltaZ = zMin(brick) - landingZ - 1;
			if (deltaZ > 0) {
				brick.from[2]--;
				brick.to[2]--;
			}
		});
		// bricks.sort((a, b) => Math.min(a.from[2], a.to[2]) - Math.min(b.from[2], b.to[2]));
		return bricks;
	};
	let currentBricks = originalBricks
	const history: Cube[][] = [];
	for (let k = 0; k < 65; k++) {
		history.push(currentBricks.flatMap((brick, i) => brickToUnitCubes(brick, isDisintegrable(bricks.find(b => b.id === brick.id)!))).toSorted(compareCubes));
		currentBricks = doGravityStep(currentBricks);
	}
	const distances = Object.fromEntries(history[0].map(cube => {
		const distance = cube.z - history[history.length - 1].find(c => c.id === cube.id)!.z;
		return [cube.id, distance];
	}));

	const initialBricksForPart2 = [77, 101, 146, 175, 247, 341, 401, 424].map(i => bricks[i]);

	const bricksForPart2 =  initialBricksForPart2.map(brick => {
		const newBricks: Brick[] = structuredClone(bricks.filter(b => b.id !== brick.id));
		return [brick, ...doGravity(newBricks)];
	});

	return {bricks, history, distances, isDisintegrable, bricksForPart2};
};

const w = 50/2;
const dx = 39/2;
const dy = 50/3/2;
const getStyle = (side: "right" | "left" | "top", cube: Cube, part2Highlight: number) => {
	const highlightColor = {
		"right": "#F0F0F0",
		"left": "#F8F8F8",
		"top": "#FFFFFF",
	}[side];
	const baseColor = {
		"right": "#888",
		"left": "#CCC",
		"top": "#FFF",
	}[side];
	const finalColor = {
		"right": cube.disintegrable ? "#555" : "#080",
		"left": cube.disintegrable ? "#777" : "#0C0",
		"top": cube.disintegrable ? "#BBB" : "#0F0",
	}[side];
	const movingColor = interpolateColors(cube.moving, [0, 1], [finalColor, baseColor]);
	const color = interpolateColors(part2Highlight, [0, 1], [movingColor, highlightColor]);
	return {
		stroke: color,
		fill: color,
		strokeWidth: 1,
	};
};

const UnitCube = ({cube, part2Highlight}: {cube: Cube, part2Highlight: number}) => {
	const {x, y, z, noLeft, noRight, noTop} = cube;
	const u = width / 2 + (x - y) * dx;
	const v = height + w * 8 - (x + y) * dy - z * w;
	return (
		<>
			{!noRight && <path d={translatePath(`M 0 0 v ${w} l ${dx} ${-dy} v ${-w} z`, u, v)} style={getStyle("right", cube, part2Highlight)}/>}
			{!noLeft && <path d={translatePath(`M 0 0 v ${w} l ${-dx} ${-dy} v ${-w} z`, u, v)} style={getStyle("left", cube, part2Highlight)}/>}
			{!noTop && <path d={translatePath(`M 0 0 l ${-dx} ${-dy} l ${dx} ${-dy} l ${dx} ${dy} z`, u, v)} style={getStyle("top", cube, part2Highlight)}/>}
		</>
	)
};

const range = (from: number, to: number): number[] => {
	if (from > to) {
		return range(to, from).toReversed();
	}
	const result = [];
	for (let k = from; k <= to; k++) {
		result.push(k);
	}
	return result;
};

type Cube = {
	x: number,
	y: number,
	z: number,
	id: string,
	noLeft: boolean,
	noRight: boolean,
	noTop: boolean,
	moving: number,
	disintegrable: boolean,
};

const brickToUnitCubes = (brick: Brick, disintegrable: boolean): Cube[] => {
	const result = [];
	for (const x of range(xMin(brick), xMax(brick))) {
		for (const y of range(yMin(brick), yMax(brick))) {
			for (const z of range(zMin(brick), zMax(brick))) {
				result.push({
					x,
					y,
					z,
					id: `${brick.id}-${x}-${y}-${z - zMin(brick)}`,
					noLeft: x > xMin(brick),
					noRight: y > yMin(brick),
					noTop: z < zMax(brick),
					moving: 0,
					disintegrable,
				});
			}
		}
	}
	return result;
};

const compareCubes = (cube1: Cube, cube2: Cube) => ((cube2.x + cube2.y) - (cube1.x + cube1.y)) || (cube1.z - cube2.z);

export const Day22 = ({dayDuration, from, to}: {dayDuration: number, from: number, to: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {bricks, history, distances, bricksForPart2} = useMemo(solve, []);
	const delta = interpolate(time, [0, 8], [1, 64], {...clamp, easing: Easing.poly(2)});
	const index = Math.floor(delta);
	const t = delta % 1;

	const index2 = Math.floor(time - 8);

	const cubes = history[index].map((cube) => {
		const zFrom = history[index-1].find(c => cube.id === c.id)!.z;
		const touchTime = interpolate(distances[cube.id] + 1, [1, 64], [0, 8], {...clamp, easing: Easing.poly(1/2)});
		return {
			...cube,
			z: interpolate(t, [0, 1], [zFrom, cube.z], clamp),
			moving: interpolate(time, [touchTime, touchTime + 0.15], [1, 0], clamp),
		};
	}).toSorted(compareCubes);

	return (
		<DayWrapper day={22} title="Sand Slabs" dayDuration={dayDuration}>
			<Svg>
				{cubes.map((cube, i) => {
					if (cube.z > 52) {
						return null;
					}
					const part2Index = isPart2 ? bricksForPart2[index2].findIndex(b => `${b.id}` === cube.id.split("-")[0]) : -1;
					const step = isPart2 && 0.5 / bricksForPart2[index2].length; // >= 10 ? 0.01 : 0.1
					const part2Highlight = isPart2 && part2Index !== -1 ? (time % 1 > part2Index * step ? 1 : 0) : 0;
					// const bricksToHighlight = [...range(from, to), ].map(i => bricks[i]);
					// const part2Highlight = bricksToHighlight.some(b => `${b.id}` === cube.id.split("-")[0]) ? 1 : 0;
					return <UnitCube key={i} cube={cube} part2Highlight={part2Highlight}/>
				})}
			</Svg>
		</DayWrapper>
	);
};

// 98, 101, 146, 178, 
