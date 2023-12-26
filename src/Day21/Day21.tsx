import { interpolate, useCurrentFrame, Img, staticFile, Easing } from "remotion";
import { clamp, fps, height, white, width } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { memo, useMemo } from "react";
import { raw } from "./raw";
import { Point } from "../common/Point";
import { Translate } from "../common/Translate";
import { Svg } from "../common/Svg";

const solve = () => {
	const start = {x: -1, y: -1};
	const garden = raw.split("\n").map((line, y) => {
		if (line.includes("S")) {
			start.x = line.indexOf("S");
			start.y = y;
			return line.replace("S", ".").split("");
		}
		return line.split("");
	});
	const rows = garden.length;
	const cols = garden[0].length;
	if (rows !== cols) {
		throw new Error("not supported");
	}
	const s = rows;

	let positions = [start];
	for (let k = 0; k < 64; k++) {
		const newPositions: Point[] = [];
		for (const pos of positions) {
			for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
				const x = pos.x + dx;
				const y = pos.y + dy;
				if (x >= 0 && x < cols && y >= 0 && y < rows && garden[y][x] === "." && newPositions.every(p => p.x !== x || p.y !== y)) {
					newPositions.push({x, y});
				}
			}
		}
		positions = newPositions;
	}

	console.log(`Day 21, part 1: ${positions.length}`);

	// const data: number[][][] = [-1, 0, 1].map(() => [-1, 0, 1].map(() => []));
	// for (const epsX of [-1, 0, 1]) {
	// 	for (const epsY of [-1, 0, 1]) {
	// 		const d = data[epsY + 1][epsX + 1];
	// 		const start = {
	// 			x: (epsX + 1) * (s - 1) / 2,
	// 			y: (epsY + 1) * (s - 1) / 2,
	// 		}
	// 		let positions = [start];
	// 		d.push(1);
	// 		while (d.length <= 3 || d.at(-1) !== d.at(-3)) {
	// 			const newPositions: Point[] = [];
	// 			const newPositionsMask: boolean[][] = garden.map(line => line.split("").map(() => false));
	// 			const seen: boolean[][] = garden.map(line => line.split("").map(() => false));
	// 			for (const pos of positions) {
	// 				seen[pos.y][pos.x] = true;
	// 				for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
	// 					const x = pos.x + dx;
	// 					const y = pos.y + dy;
	// 					if (x >= 0 && x < cols && y >= 0 && y < rows && garden[y][x] === "." && !seen[y][x] && !newPositionsMask[y][x]) {
	// 						newPositions.push({x, y});
	// 						newPositionsMask[y][x] = true;
	// 					}
	// 				}
	// 			}
	// 			positions = newPositions;
	// 			d.push(positions.length);
	// 		}
	// 	}
	// }

	// const phase = (epsX: number, epsY: number) => {
	// 	return data[epsY + 1][epsX + 1].length - 1;
	// };
	// const getRepeatingCellCount = (epsX: number, epsY: number, isEven: boolean) => {
	// 	const d = data[epsY + 1][epsX + 1];
	// 	if (((d.length - 1) % 2 === 0) === isEven) {
	// 		return d[d.length - 1];
	// 	} else {
	// 		return d[d.length - 2];
	// 	}
	// }
	// const getCellCount = (epsX: number, epsY: number, steps: number) => {
	// 	// Given that we start on epsX/epsY (both are either -1, 0, or 1, and
	// 	// represent sides/center) at 0 and then do the given amount of steps,
	// 	// return how many squares are reachable.
	// 	if (steps >= phase(epsX, epsY)) {
	// 		return getRepeatingCellCount(epsX, epsY, steps % 2 === 0)
	// 	} else {
	// 		return data[epsY + 1][epsX + 1][steps];
	// 	}
	// };

	// const countCellsForSteps = (steps: number) => {
	// 	let cellCount = 0;

	// 	// Center cell
	// 	cellCount += getCellCount(0, 0, steps);

	// 	// Side cells
	// 	const countSideCells = (epsX: number, epsY: number) => {
	// 		// We reach a side cell after (s + 1) / 2 + k * s  (k > 0)
	// 		const repeatingCells = Math.floor((steps - (s + 1) / 2 - phase(epsX, epsY)) / s) + 1;
	// 		cellCount += Math.ceil(repeatingCells / 2) * getRepeatingCellCount(epsX, epsY, (steps - (s + 1) / 2) % 2 === 0);
	// 		cellCount += Math.floor(repeatingCells / 2) * getRepeatingCellCount(epsX, epsY, (steps - (s + 1) / 2) % 2 !== 0);
	// 		for (let k = repeatingCells; (s + 1) / 2 + k * s <= steps; k++) {
	// 			cellCount += getCellCount(epsX, epsY, steps - (s + 1) / 2 - k * s);
	// 		}
	// 	};
	// 	countSideCells(-1, 0);
	// 	countSideCells(1, 0);
	// 	countSideCells(0, -1);
	// 	countSideCells(0, 1);

	// 	// Corner cells
	// 	const countCornerCells = (epsX: number, epsY: number) => {
	// 		// We reach k corner cells after k * s steps
	// 		const repeatingCells = Math.floor((steps - (s + 1) - phase(epsX, epsY)) / s) + 1;
	// 		cellCount += Math.ceil(repeatingCells / 2) ** 2 * getRepeatingCellCount(epsX, epsY, (steps - (s + 1)) % 2 === 0);
	// 		cellCount += Math.floor(repeatingCells / 2) * (Math.floor(repeatingCells / 2) + 1) * getRepeatingCellCount(epsX, epsY, (steps - (s + 1)) % 2 !== 0);
	// 		for (let k = repeatingCells; (s + 1) + k * s <= steps; k++) {
	// 			cellCount += (k + 1) * getCellCount(epsX, epsY, steps - (s + 1) - k * s);
	// 		}
	// 	}
	// 	countCornerCells(-1, -1);
	// 	countCornerCells(1, -1);
	// 	countCornerCells(-1, 1);
	// 	countCornerCells(1, 1);

	// 	return cellCount;
	// }

	// console.log(`Day 21, part 2: ${countCellsForSteps(26501365)}`);

	const makeHistory = (garden: string[][], start: Point, steps: number) => {
		const history: string[][][] = [];
		let positions = [start];
		garden[start.y][start.x] = "N";
		for (let k = 0; k < steps; k++) {
			history.push(garden);
			const newPositions: Point[] = [];
			const newGarden = garden.map(line => line.map(char => char === "N" ? "X" : char));
			for (const pos of positions) {
				for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
					const x = pos.x + dx;
					const y = pos.y + dy;
					if (x >= 0 && x < garden[0].length && y >= 0 && y < garden.length && newGarden[y][x] === ".") {
						newPositions.push({x, y});
						newGarden[y][x] = "N";
					}
				}
			}
			positions = newPositions;
			garden = newGarden;
		}
		return history;
	}

	const garden2 = [...garden, ...garden, ...garden, ...garden, ...garden].map(line => [...line, ...line, ...line, ...line, ...line]);

	return {
		garden: structuredClone(garden),
		history: makeHistory(garden, start, 65),
		history2: makeHistory(garden2, {x: start.x + 131 * 2, y: start.y + 131 * 2}, 65 + 131*2 + 1),
	};
};

const styles = {
	"#": {fill: white},
	"N": {fill: "#0F0"},
	"X": {fill: "#0A0"},
	"Y": {fill: "#0C0"},
};

const Garden = memo(({
	garden,
	helper,
	boring,
}: {garden: string[][], boring?: boolean, helper?: boolean}) => {
	const time = useCurrentFrame() / fps;
	const cellSizeInv = interpolate(time, [0.15, 7.85, 8.15, 15.85], [1/40, 1/8.3, 1/8.3, 1/8.3], clamp);
	const cellSize = helper ? 8 : (1 / cellSizeInv);
	const x0 = helper ? 0 : (width - cellSize * garden[0].length) / 2;
	const y0 = helper ? 0 : (height - cellSize * garden.length) / 2;

	return (
		<Svg w={helper ? 131*8 : undefined} h={helper ? 131*8 : undefined} style={{opacity: boring ? 0.3 : 1}}>
			{garden.flatMap((line, y) => line.map((char, x) => {
				if (char === "X" && (x + y) % 2 === 0) {
					char = "Y";
				}
				return (char !== "." && (!(boring) || char === "#") &&
					<rect
						x={x * cellSize + x0 - 0.5}
						y={y * cellSize + y0 - 0.5}
						width={cellSize + 1}
						height={cellSize + 1}
						style={styles[char]}
					/>
				);
			}))}
		</Svg>
	)
});

const range = (from: number, to: number) => {
	const result = [];
	for (let k = from; k <= to; k++) {
		result.push(k);
	}
	return result;
};

const Part2 = () => {
	const time = useCurrentFrame() / fps;
	const wInv = interpolate(time % 8, [0.15, 7.85], [1/1085, 1/50], clamp);
	const w = 1 / wInv;
	const k = Math.floor(height / w / 2 - 1/4);
	const t = 20;
	return (
		<Translate dx={-w/2 + width / 2} dy={-w/2 + height / 2}>
			{range(-t, t).map(y => range(-t, t).map(x => {
				let file = "Empty";
				if (Math.abs(x) + Math.abs(y) < k) {
					file = "Full";
				} else if (Math.abs(x) + Math.abs(y) == k) {
					if (x == 0 && y == 0) {
						file = "Single";
					} else if (x == 0 && y > 0) {
						file = "SideS";
					} else if (x == 0 && y < 0) {
						file = "SideN";
					} else if (x > 0 && y == 0) {
						file = "SideE";
					} else if (x < 0 && y == 0) {
						file = "SideW";
					} else if (x > 0 && y > 0) {
						file = "MissingSE"
					} else if (x > 0 && y < 0) {
						file = "MissingNE"
					} else if (x < 0 && y > 0) {
						file = "MissingSW"
					} else if (x < 0 && y < 0) {
						file = "MissingNW"
					}
				} else if (Math.abs(x) + Math.abs(y) == k + 1) {
					if (x > 0 && y > 0) {
						file = "CornerNW";
					} else if (x > 0 && y < 0) {
						file = "CornerSW";
					} else if (x < 0 && y > 0) {
						file = "CornerNE";
					} else if (x < 0 && y < 0) {
						file = "CornerSE";
					}
				}
				return (
					<Translate dx={x * (w - 1)} dy={y * (w - 1)}>
						<Img placeholder="" width={w} src={staticFile(`Day21${file}.png`)} style={{position: "absolute"}} />
					</Translate>
				)
			}))}
		</Translate>
	);
};

export const Day21 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {garden, history, history2} = useMemo(solve, []);
	const index = Math.floor(interpolate(time, [0.15, 7.85], [0, history.length - 1], clamp));
	const index2 = Math.floor(interpolate(time, [8.15, 15.85], [history.length, history2.length - 1], clamp));
	const cellSizeInv = interpolate(time, [0.15, 7.85, 8.15, 16], [1/40, 1/8.3, 1/8.3, 1/8.3], clamp);
	const cellSize = 1 / cellSizeInv;

	return (
		<DayWrapper day={21} title="Step Counter" dayDuration={dayDuration}>
			{isPart1 && range(0, 0).map(y => range(-1, 1).map(x => (
				<Translate dx={cellSize * garden.length * x} dy={cellSize * garden.length * y}>
					<Garden garden={history[index]} boring={x !== 0}/>
				</Translate>
			)))}
			{isPart2 && (
				<Part2/>
			)}
		</DayWrapper>
	);
};

export const Day21Helper = ({epsX, epsY, single}: {epsX: number, epsY: number, single?: boolean}) => {
	const {history2} = useMemo(solve, []);
	const garden2 = useMemo(() => history2[single ? 65 : 65 + 131 + 131].slice(
		epsY * 131,
		(epsY + 1) * 131,
	).map(line => line.slice(
		epsX * 131,
		(epsX + 1) * 131),
	), [history2, epsX, epsY])

	return (
		<DayWrapper day={21} title="Step Counter" dayDuration={16} titleOpacity={0}>
			<Garden garden={garden2} helper/>
		</DayWrapper>
	);
};
