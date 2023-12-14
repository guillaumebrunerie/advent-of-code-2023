import { useCurrentFrame } from "remotion";
import { Point } from "../common/Point";
import { raw } from "./raw";
import { fps, height, width } from "../constants";
import { useMemo } from "react";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Translate } from "../common/Translate";
import { Rectangle } from "../common/Rectangle";
import { Line } from "../common/Line";

const range = (n: number) => Array(n).fill(true).map((_, i) => i);

const solve = () => {
	const patterns = raw.split("\n\n").map(pattern => pattern.split("\n").map(line => line.split("")));

	const mirrors: {type: "col" | "row", z: number}[] = [];

	const note = (pattern: string[][], oldNote = -1) => {
		const h = pattern.length;
		const w = pattern[0].length;
		const row = range(h - 1).find(y => range(h).every(y2 => {
			const y3 = 2 * y + 1 - y2;
			return (100 * (y + 1) !== oldNote) && (y3 < 0 || y3 >= h || pattern[y2].join("") === pattern[y3].join(""));
		}));
		const col = range(w - 1).find(x => range(w).every(x2 => {
			const x3 = 2 * x + 1 - x2;
			return (x + 1 !== oldNote) && (x3 < 0 || x3 >= w || range(h).map(i => pattern[i][x2]).join("") === range(h).map(i => pattern[i][x3]).join(""));
		}));
		if (col !== undefined) {
			return {value: col + 1, type: "col" as const, z: col};
		}
		if (row !== undefined) {
			return {value: 100 * (row + 1), type: "row" as const, z: row};
		}
		return null;
	};

	let total = 0;
	patterns.forEach((pattern, i) => {
		const {value, type, z} = note(pattern)!;
		total += value;
		mirrors[i] = {type, z};
	})
	console.log(`Day 13, part 1: ${total}`);

	const smudge = (c: string) => c === "." ? "#" : ".";

	const smudgeNote = (pattern: string[][]) => {
		const h = pattern.length;
		const w = pattern[0].length;
		const oldNote = note(pattern)!;
		for (const y of range(h)) {
			for (const x of range(w)) {
				const n = note(pattern.with(y, pattern[y].with(x, smudge(pattern[y][x]))), oldNote.value);
				if (n) {
					return {...n, smudge: {x, y}};
				}
			}
		}
		throw new Error("No smudge found");
	};

	const smudges: {type: "col" | "row", z: number, smudge: Point}[] = [];

	let total2 = 0;
	patterns.forEach((pattern, i) => {
		const {value, type, z, smudge} = smudgeNote(pattern)!;
		total2 += value;
		smudges[i] = {type, z, smudge};
	})
	console.log(`Day 13, part 2: ${total2}`);

	return {patterns, mirrors, smudges};
};

const cellSize = 15;

const styles = {
	faded: {background: "#666"},
	fadedHighlighted: {background: "#333"},
	highlighted: {
		background: "#CCC",
		zIndex: 1,
	},
	highlighted2: {
		background: "#AAA",
	},
	fadedGreen: {
		background: "#030",
	},
	green: {
		background: "#080",
		zIndex: 1,
	},
	smudgeH: {
		background: "#080",
		zIndex: 1,
	},
	smudgeF: {
		background: "#080",
		zIndex: 1,
	},
};

const Room = ({isPart1, time, pattern, mirror, smudge}: {
	isPart1: boolean,
	time: number,
	pattern: string[][],
	mirror: {type: "col" | "row", z: number},
	smudge: {type: "col" | "row", z: number, smudge: Point},
}) => {
	const h = pattern.length;
	const w = pattern[0].length;
	const v = (mirror.z + 1) * cellSize;
	const mirrorFrom = mirror.type === "col" ? {x: v, y: 0} : {x: 0, y: v};
	const mirrorTo = mirror.type === "col" ? {x: v, y: h * cellSize} : {x: w * cellSize, y: v};
	const vS = (smudge.z + 1) * cellSize;
	const mirrorFromS = smudge.type === "col" ? {x: vS, y: 0} : {x: 0, y: vS};
	const mirrorToS = smudge.type === "col" ? {x: vS, y: h * cellSize} : {x: w * cellSize, y: vS};;
	const rectangle = (t: number, mirror: {type: "col" | "row", z: number}) => {
		const depth = Math.min(mirror.z + 1, (mirror.type === "col" ? w : h) - mirror.z - 1);
		const flashSpeed = depth / (2 - 0.15*2);
		const d = Math.min(Math.max(0, t * flashSpeed), depth);
		if (mirror.type === "col") {
			return {
				x: mirror.z - d + 1,
				y: 0,
				w: 2 * d,
				h,
			};
		} else {
			return {
				x: 0,
				y: mirror.z - d + 1,
				w,
				h: 2 * d,
			};
		}
	};
	type Rectangle = {
		x: number, y: number, w: number, h: number,
	};
	const intersect = (r1: Rectangle, r2: Rectangle) => {
		const x = Math.max(r1.x, r2.x);
		const y = Math.max(r1.y, r2.y);
		const w = Math.min(r1.x + r1.w, r2.x + r2.w) - x;
		const h = Math.min(r1.y + r1.h, r2.y + r2.h) - y;
		if (w <= 0 || h <= 0) {
			return null;
		}
		return {x, y, w, h};
	};
	const smudges = [
		smudge.smudge,
		{
			x: smudge.type == "col" ? smudge.z * 2 - smudge.smudge.x + 1 : smudge.smudge.x,
			y: smudge.type == "row" ? smudge.z * 2 - smudge.smudge.y + 1 : smudge.smudge.y,
		},
	];
	return (
		<Translate dx={-w * cellSize / 2} dy={-h * cellSize / 2}>
			{pattern.map((line, y) => line.map((c, x) => {
				return c === "#" && (
					<Rectangle
						x={x * cellSize - 0.5}
						y={y * cellSize - 0.5}
						w={cellSize + 1}
						h={cellSize + 1}
						style={styles.faded}
					/>
				);
			}))}
			{pattern.map((line, y) => line.map((c, x) => {
				const rH = intersect({x, y, w: 1, h: 1}, rectangle(isPart1 ? time : Infinity, mirror));
				return rH && (
					<Rectangle
						x={rH.x * cellSize - 0.5}
						y={rH.y * cellSize - 0.5}
						w={rH.w * cellSize + 1}
						h={rH.h * cellSize + 1}
						style={c === "#" ? styles.highlighted : styles.fadedHighlighted}
					/>
				);
			}))}
			{!isPart1 && smudges.map((smudge, i) => (
				pattern[smudge.y][smudge.x] === "." && <Rectangle
					key={i}
					x={smudge.x * cellSize - 0.5}
					y={smudge.y * cellSize - 0.5}
					w={cellSize + 1}
					h={cellSize + 1}
					style={{...styles.green}}
				/>
			))}
			{pattern.map((line, y) => line.map((c, x) => {
				const rG = intersect({x, y, w: 1, h: 1}, rectangle(isPart1 ? 0 : time, smudge));
				const isSmudge = smudges.some(s => s.x === x && s.y === y)
				return rG && (
					<Rectangle
						x={rG.x * cellSize - 0.5}
						y={rG.y * cellSize - 0.5}
						w={rG.w * cellSize + 1}
						h={rG.h * cellSize + 1}
						style={isSmudge ? (c === "#" ? styles.smudgeH : styles.smudgeF) : (c === "#" ? styles.green : styles.fadedGreen)}
					/>
				);
			}))}
			<Line
				from={mirrorFrom}
				to={mirrorTo}
				width={3}
				color="white"
				style={{boxShadow: "0 0 10px white"}}
			/>
			<Line
				from={mirrorFromS}
				to={mirrorToS}
				width={3}
				color="#00CC00"
				style={{opacity: isPart1 ? 0 : 1, boxShadow: "0 0 10px #00CC00"}}
			/>
			<Rectangle
				x={0}
				y={0}
				w={w * cellSize}
				h={h * cellSize}
				style={{outline: "1px solid #666"}}
			/>
		</Translate>
	);
};

const n = 6;
const m = 3;
const spacingX = width / n;
const spacingY = height / m;
const initialX = (width - (n - 1) * spacingX) / 2;
const initialY = (height - (m - 1) * spacingY) / 2;

export const Day13 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const {patterns, mirrors, smudges} = useMemo(solve, []);
	const d = 2;
	const indexFrom = Math.floor((time % (dayDuration/2)) / d) * n * m;
	return (
		<DayWrapper day={13} title="Point of Incidence" dayDuration={dayDuration}>
			{patterns.map((pattern, i) => {
				if (i < indexFrom || i >= indexFrom + n * m) {
					return null;
				}
				return (
					<Translate key={i} dx={initialX + (i % n) * spacingX} dy={initialY + Math.floor((i - indexFrom) / n) * spacingY}>
						<Room
							isPart1={isPart1}
							time={time % 2 - 0.15}
							pattern={pattern}
							mirror={mirrors[i]}
							smudge={smudges[i]}
						/>
					</Translate>
				)
			})}
		</DayWrapper>
	);
};
