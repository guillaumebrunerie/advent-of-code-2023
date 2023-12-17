import { Easing, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { clamp, fps, height, width } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { memo, useMemo } from "react";
import { raw } from "./raw";
import { Rectangle } from "../common/Rectangle";
import { Translate } from "../common/Translate";
import { Point } from "../common/Point";

const solve = () => {
	const grid = raw.split("\n").map(line => line.split("").map(Number));
	const rows = grid.length;
	const cols = grid[0].length;

	type Dir = "left" | "right" | "up" | "down";
	type Position = {
		x: number,
		y: number,
		dir: Dir,
		steps: number,
		cost: number,
		history: Point[],
	}

	const visit = (maxStraightSteps: number, minStraightSteps: number) => {
		const nextPositions: Position[] = [
			{x: 0, y: 0, dir: "right", steps: 0, cost: 0, history: []},
			{x: 0, y: 0, dir: "down", steps: 0, cost: 0, history: []},
		];

		const forward = (p: Position): Position => {
			switch (p.dir) {
			case "left": return {...p, x: p.x - 1, steps: p.steps + 1, history: [...p.history, {x: p.x, y: p.y}]};
			case "right": return {...p, x: p.x + 1, steps: p.steps + 1, history: [...p.history, {x: p.x, y: p.y}]};
			case "up": return {...p, y: p.y - 1, steps: p.steps + 1, history: [...p.history, {x: p.x, y: p.y}]};
			case "down": return {...p, y: p.y + 1, steps: p.steps + 1, history: [...p.history, {x: p.x, y: p.y}]};
			default: throw new Error("invalid");
			}
		};

		const turnRight = (p: Position): Position => {
			switch (p.dir) {
			case "left": return { ...p, dir: "up", steps: 0 };
			case "right": return { ...p, dir: "down", steps: 0 };
			case "up": return { ...p, dir: "right", steps: 0 };
			case "down": return { ...p, dir: "left", steps: 0 };
			default: throw new Error("invalid");
			}
		};

		const turnLeft = (p: Position): Position => {
			switch (p.dir) {
			case "left": return { ...p, dir: "down", steps: 0 };
			case "right": return { ...p, dir: "up", steps: 0 };
			case "up": return { ...p, dir: "left", steps: 0 };
			case "down": return { ...p, dir: "right", steps: 0 };
			default: throw new Error("invalid");
			}
		};

		const nextSteps = (p: Position): Position[] => {
			return (p.steps < minStraightSteps ? [forward(p)] : [
				forward(p),
				forward(turnRight(p)),
				forward(turnLeft(p)),
			]).filter(p => {
				if (p.steps > maxStraightSteps) {
					return false;
				}
				if (p.x < 0 || p.x >= cols || p.y < 0 || p.y >= rows) {
					return false;
				}
				return true;
			}).map(p => ({...p, cost: p.cost + grid[p.y][p.x]}));
		}

		const visited: {[K in Dir]: {steps: number, cost: number}[]}[][] = grid.map(line => line.map(() => ({
			left: [],
			right: [],
			up: [],
			down: [],
		})));

		while (!nextPositions.some(p => p.x === cols - 1 && p.y === rows - 1)) {
			const p = nextPositions[0];
			if (visited[p.y][p.x][p.dir].some(({steps, cost}) => (steps === p.steps || (steps <= p.steps && steps >= minStraightSteps)) && cost <= p.cost)) {
				nextPositions.splice(0, 1);
				continue;
			}
			visited[p.y][p.x][p.dir].push({steps: p.steps, cost: p.cost});
			nextPositions.splice(0, 1, ...nextSteps(p));
			nextPositions.sort((p1, p2) => p1.cost - p2.cost);
		}
		return nextPositions.find(p => p.x === cols - 1 && p.y === rows - 1)!;
	}

	const part1 = visit(3, 0);
	console.log(`Day 17, part 1: ${part1.cost}`);
	const part2 = visit(10, 4);
	console.log(`Day 17, part 2: ${part2.cost}`);

	return {grid, rows, cols, part1, part2};
};

const cellSize = 7.5;

const colors = [
	"blue", // Unused
	interpolateColors(0/8, [0, 0.5, 1], ["yellow", "orange", "red"]),
	interpolateColors(1/8, [0, 0.5, 1], ["yellow", "orange", "red"]),
	interpolateColors(2/8, [0, 0.5, 1], ["yellow", "orange", "red"]),
	interpolateColors(3/8, [0, 0.5, 1], ["yellow", "orange", "red"]),
	interpolateColors(4/8, [0, 0.5, 1], ["yellow", "orange", "red"]),
	interpolateColors(5/8, [0, 0.5, 1], ["yellow", "orange", "red"]),
	interpolateColors(6/8, [0, 0.5, 1], ["yellow", "orange", "red"]),
	interpolateColors(7/8, [0, 0.5, 1], ["yellow", "orange", "red"]),
	interpolateColors(8/8, [0, 0.5, 1], ["yellow", "orange", "red"]),
];

const Grid = memo(({grid}: {grid: number[][]}) => {
	return grid.map((line, y) => line.map((cell, x) => {
		return <Rectangle x={cellSize * x} y={cellSize * y} w={cellSize} h={cellSize} style={{backgroundColor: colors[cell]}}/>
	}));
});

const GhostPath = memo(({points}: {points: Point[]}) => {
	return points.map(({x, y}) => {
		return <Rectangle x={cellSize * x} y={cellSize * y} w={cellSize} h={cellSize} style={{backgroundColor: "black", opacity: 0.45}}/>
	});
});

const Crucible = ({position}: {position: Point}) => {
	const {x, y} = position;
	return (
		<>
			<Rectangle x={cellSize * x} y={cellSize * y} w={cellSize} h={cellSize} style={{borderRadius: cellSize + "px", outline: "2px solid black", backgroundColor: "#0F0", transform: "scale(1.5)"}}/>
		</>
	)
};

export const Day17 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const {grid, rows, cols, part1, part2} = useMemo(solve, []);

	const {history} = isPart1 ? part1 : part2;
	const index = Math.floor(interpolate(time % 8, [0.15, 7.85], [0, history.length], clamp));
	const position = index === history.length ? {x: cols - 1, y: rows - 1} : history[index];
	const titleOpacity = interpolate(time % 8, [7.333, 7.667], [1, 0.3], clamp);

	return (
		<DayWrapper day={17} title="Clumsy Crucible" dayDuration={dayDuration} titleOpacity={titleOpacity}>
			<Translate dx={(width - cols*cellSize) / 2} dy={(height - rows*cellSize) / 2}>
				<Grid grid={grid}/>
				<GhostPath points={history.slice(0, index)}/>
				<Crucible position={position}/>
			</Translate>
		</DayWrapper>
	);
};
