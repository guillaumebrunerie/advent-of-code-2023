import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Point } from "../common/Point";
import { raw } from "./raw";
import { fps, height, width, clamp } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { memo, useMemo } from "react";
import { Rectangle } from "../common/Rectangle";
import { Translate } from "../common/Translate";

const solve = (cropRows = -1) => {
	const roundBlocks: Point[] = [];
	const squareBlocks: Point[] = [];
	let data = raw.split("\n").map(line => line.split(""));
	if (cropRows !== -1) {
		data = data.slice(0, cropRows);
	}
	const rows = data.length;
	const columns = data[0].length;
	data.forEach((line, y) => line.forEach((char, x) => {
		if (char === "O") {
			roundBlocks.push({x, y});
		} else if (char === "#") {
			squareBlocks.push({x, y});
		}
	}));

	const isFree = (x: number, y: number) =>
		x >= 0 && x < columns && y >= 0 && y < rows && data[y][x] === ".";

	const history = [[...roundBlocks.map(({x, y}) => ({x, y}))]];

	const tiltUp = () => {
		let didSomething = true;
		while (didSomething) {
			didSomething = false;
			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < columns; x++) {
					if (data[y][x] === "O" && isFree(x, y - 1)) {
						data[y][x] = ".";
						data[y - 1][x] = "O";
						roundBlocks.find(b => b.x === x && b.y === y)!.y--;
						didSomething = true;
					}
				}
			}
		}
		history.push([...roundBlocks.map(({x, y}) => ({x, y}))]);
	};

	const tiltLeft = () => {
		let didSomething = true;
		while (didSomething) {
			didSomething = false;
			for (let x = 0; x < columns; x++) {
				for (let y = 0; y < rows; y++) {
					if (data[y][x] === "O" && isFree(x - 1, y)) {
						data[y][x] = ".";
						data[y][x - 1] = "O";
						roundBlocks.find(b => b.x === x && b.y === y)!.x--;
						didSomething = true;
					}
				}
			}
		}
		history.push([...roundBlocks.map(({x, y}) => ({x, y}))]);
	};

	const tiltDown = () => {
		let didSomething = true;
		while (didSomething) {
			didSomething = false;
			for (let y = rows - 1; y >= 0; y--) {
				for (let x = 0; x < columns; x++) {
					if (data[y][x] === "O" && isFree(x, y + 1)) {
						data[y][x] = ".";
						data[y + 1][x] = "O";
						roundBlocks.find(b => b.x === x && b.y === y)!.y++;
						didSomething = true;
					}
				}
			}
		}
		history.push([...roundBlocks.map(({x, y}) => ({x, y}))]);
	};

	const tiltRight = () => {
		let didSomething = true;
		while (didSomething) {
			didSomething = false;
			for (let x = columns - 1; x >= 0; x--) {
				for (let y = 0; y < rows; y++) {
					if (data[y][x] === "O" && isFree(x + 1, y)) {
						data[y][x] = ".";
						data[y][x + 1] = "O";
						roundBlocks.find(b => b.x === x && b.y === y)!.x++;
						didSomething = true;
					}
				}
			}
		}
		history.push([...roundBlocks.map(({x, y}) => ({x, y}))]);
	};

	const cycle = () => {
		tiltDown();
		tiltRight();
		tiltUp();
		tiltLeft();
	};

	const score = () => {
		let total = 0;
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < columns; x++) {
				if (data[y][x] === "O") {
					total += rows - y;
				}
			}
		}
		return total;
	};

	tiltDown();
	console.log(`Day 14, part 1: ${score()}`);

	const toString = () => data.map(line => line.join("")).join("\n");

	// const cache: {key: string, i: number, score: number}[] = [];
	// cycle();
	// let i = 1;
	// for (;;) {
	// 	const key = toString();
	// 	const cached = cache.find(c => c.key === key);
	// 	if (cached) {
	// 		const period = i - cached.i;
	// 		const phase = 1000000000 % period;
	// 		const result = cache.find(c => c.i >= cached.i && c.i % period === phase);
	// 		if (!result) {
	// 			throw new Error("Not found")
	// 		}
	// 		console.log(`Day 14, part 2: ${result.score}`);
	// 		break;
	// 	}
	// 	cache.push({key, i, score: score()});
	// 	cycle();
	// 	i++;
	// }

	cycle(); cycle(); cycle(); cycle();
	cycle(); cycle(); cycle(); cycle();
	cycle(); cycle(); cycle(); cycle();
	cycle(); cycle(); cycle(); cycle();
	history.splice(2, 1);
	return {columns, rows, squareBlocks, history};
};

const cellSize = 19;
const styles = {
	bg: {
		background: "#222",
		outline: "3px solid #FFF",
		opacity: 0.5,
	},
	squareBlock: {
		background: "#CCC",
	},
	roundBlock: {
		borderRadius: "50%",
		background: "#00CC00",
		scale: "90%",
	},
};

const Background = memo(({columns, rows, squareBlocks}: {columns: number, rows: number, squareBlocks: Point[]}) => {
	return (
		<>
			<Rectangle w={columns * cellSize} h={rows * cellSize} style={styles.bg}/>
			{squareBlocks.map(({x, y}, i) => (
				<Rectangle key={i} x={x * cellSize} y={y * cellSize} w={cellSize} h={cellSize} style={styles.squareBlock}/>
			))}
		</>
	)
});

const RoundBlocks = ({roundBlocksFrom, roundBlocksTo, delta, reverseEasing}: {
	roundBlocksFrom: Point[],
	roundBlocksTo: Point[],
	delta: (x: number) => number,
	reverseEasing: (delta: number, x: number) => number,
}) => {
	const maxDistance = Math.max(...roundBlocksFrom.map((b, i) => {
		const b2 = roundBlocksTo[i];
		return Math.abs(b.x - b2.x) + Math.abs(b.y - b2.y);
	}));
	const deltaPos = (x: number) => interpolate(delta(x), [0, 1], [0, maxDistance]);
	const applyDeltaMax = (zF: number, zT: number, x: number) => {
		if (zF < zT) {
			return Math.min(zF + deltaPos(x), zT);
		}
		return Math.max(zF - deltaPos(x), zT);
	};
	const arrivalDelta = (from: Point, to: Point) => {
		if (from.x !== to.x) {
			return Math.abs(from.x - to.x) / maxDistance;
		}
		return Math.abs(from.y - to.y) / maxDistance;
	}
	const time = useCurrentFrame() / fps;
	return roundBlocksFrom.map(({x, y}, i) => {
		const newX = applyDeltaMax(x, roundBlocksTo[i].x, x);
		const newY = applyDeltaMax(y, roundBlocksTo[i].y, x);
		const d = arrivalDelta({x, y}, roundBlocksTo[i]);
		return <Rectangle key={i} x={newX * cellSize} y={newY * cellSize} w={cellSize} h={cellSize} style={{
			...styles.roundBlock,
			opacity: interpolate(time, [reverseEasing(d, x), reverseEasing(d, x) + 0.15], [1, 0.5], clamp),
		}}/>
	});
};

const colDelay = 0.075;
const rows = 50;

export const Day14 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const {columns, squareBlocks, history} = useMemo(() => solve(rows), []);
	const index = isPart1 ? 0 : Math.floor(time - 7);
	const delta = (x: number) => isPart1
		? interpolate(time, [x * colDelay, x * colDelay + 1], [0, 1], {...clamp, easing: Easing.quad})
		: interpolate(time % 1, [0, 0.85], [0, 1], {...clamp, easing: Easing.quad});
	const reverseEasing = (delta: number, x: number) => isPart1
		? interpolate(delta, [0, 1], [x * colDelay, x * colDelay + 1], {...clamp, easing: Easing.poly(1/2)})
		: interpolate(delta, [0, 1], [0, 0.85], {...clamp, easing: Easing.poly(1/2)}) + Math.floor(time);

	return (
		<DayWrapper day={14} title="Parabolic Reflector Dish" dayDuration={dayDuration}>
			<Translate dx={(width  - columns * cellSize) / 2} dy={(height  - rows * cellSize) / 2}>
				<Background columns={columns} rows={rows} squareBlocks={squareBlocks}/>
				<RoundBlocks roundBlocksFrom={history[index]} roundBlocksTo={history[index + 1]} delta={delta} reverseEasing={reverseEasing}/>
			</Translate>
		</DayWrapper>
	);
};
