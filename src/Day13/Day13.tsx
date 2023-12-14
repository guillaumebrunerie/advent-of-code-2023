import { interpolate, useCurrentFrame } from "remotion";
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

const cellSize = 25;

const styles = {
	faded: {background: "#666"},
	highlighted: {
		background: "#CCC",
		boxShadow: "0 0 4px #CCC",
	},
	highlighted2: {
		background: "#AAA",
		boxShadow: "0 0 4px #AAA",
	},
	green: {
		background: "#080",
		boxShadow: "0 0 4px #080",
	},
	red: {
		background: "#800",
	},
};
const flashSpeed = 15;

const Room = ({isPart1, delta, pattern, mirror, smudge, smudgeOpacity, smudgeMirrorOpacity}: {
	isPart1: boolean,
	delta: number,
	pattern: string[][],
	mirror: {type: "col" | "row", z: number},
	smudge: {type: "col" | "row", z: number, smudge: Point},
	smudgeOpacity: number,
	smudgeMirrorOpacity: number,
}) => {
	const h = pattern.length;
	const w = pattern[0].length;
	const v = (mirror.z + 1) * cellSize;
	const mirrorFrom = mirror.type === "col" ? {x: v, y: 0} : {x: 0, y: v};
	const mirrorTo = mirror.type === "col" ? {x: v, y: h * cellSize} : {x: w * cellSize, y: v};
	const vS = (smudge.z + 1) * cellSize;
	const mirrorFromS = smudge.type === "col" ? {x: vS, y: 0} : {x: 0, y: vS};
	const mirrorToS = smudge.type === "col" ? {x: vS, y: h * cellSize} : {x: w * cellSize, y: vS};
	const mirrorDelay = (x: number, y: number, mirror: {type: "col" | "row", z: number}) => {
		const dx = Math.abs(x - mirror.z - 0.5);
		const dy = Math.abs(y - mirror.z - 0.5);
		if (mirror.type === "col") {
			if (dx <= Math.min(mirror.z + 1, w - mirror.z - 1)) {
				return dx;
			} else {
				return Infinity;
			}
		}
		if (dy <= Math.min(mirror.z + 1, h - mirror.z - 1)) {
			return dy;
		} else {
			return Infinity;
		}
	};
	const time = useCurrentFrame() / fps;
	const rectangle = () => {
		const dX = Math.min(Math.max(0, (time - delta) * flashSpeed), Math.min(mirror.z + 1, w - mirror.z - 1));
		const dY = Math.min(Math.max(0, (time - delta) * flashSpeed), Math.min(mirror.z + 1, h - mirror.z - 1));
		if (mirror.type === "col") {
			return {
				x: mirror.z - dX + 1,
				y: 0,
				w: 2 * dX,
				h,
			};
		} else {
			return {
				x: 0,
				y: mirror.z - dY + 1,
				w,
				h: 2 * dY,
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
	return (
		<Translate dx={-w * cellSize / 2} dy={-h * cellSize / 2}>
			{pattern.map((line, y) => line.map((c, x) => {
				let style = styles.faded;
				// if (mirrorDelay(x, y, mirror) < (time - delta) * flashSpeed) {
				// 	style = styles.highlighted;
				// }
				// if (!isPart1 && mirrorDelay(x, y, mirror) < Infinity) {
				// 	style = styles.highlighted2;
				// }
				// if (!isPart1 && mirrorDelay(x, y, smudge) < (time - delta) * flashSpeed) {
				// 	style = styles.green;
				// }
				const rH = intersect({x, y, w: 1, h: 1}, rectangle());
				return (c === "#" &&
					(
						<>
							<Rectangle
								x={x * cellSize}
								y={y * cellSize}
								w={cellSize}
								h={cellSize}
								style={style}
							/>
							{rH && (
								<Rectangle
									x={rH.x * cellSize}
									y={rH.y * cellSize}
									w={rH.w * cellSize}
									h={rH.h * cellSize}
									style={styles.highlighted}
								/>
							)}
						</>
					)
				);
			}))}
			<Line
				from={mirrorFrom}
				to={mirrorTo}
				width={3}
				color="white"
				style={{opacity: (isPart1 && time < delta) ? 0 : 1, boxShadow: "0 0 10px white"}}
			/>
			<Rectangle
				x={smudge.smudge.x * cellSize}
				y={smudge.smudge.y * cellSize}
				w={cellSize}
				h={cellSize}
				style={{...styles.red, opacity: smudgeOpacity}}
			/>
			<Line
				from={mirrorFromS}
				to={mirrorToS}
				width={3}
				color="#00CC00"
				style={{opacity: smudgeMirrorOpacity}}
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

const n = 2;
const m = 2;
const spacingX = width / n;
const spacingY = height / m;
const initialX = (width - (n - 1) * spacingX) / 2;
const initialY = (height - (m - 1) * spacingY) / 2;

export const Day13 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const {patterns, mirrors, smudges} = useMemo(solve, []);
	const d = 2;
	const indexFrom = Math.floor(time / d) * n * m;
	return (
		<DayWrapper day={13} title="Point of Incidence" dayDuration={dayDuration}>
			{patterns.map((pattern, i) => {
				if (i < indexFrom || i >= indexFrom + n * m) {
					return null;
				}
				const list = range(n * m);
				const indexToShow = Math.floor(interpolate(time % d, [0, d], [0, n * m]));
				const part2Opacity = list[i - indexFrom] <= indexToShow ? 1 : 0
				return (
					<Translate key={i} dx={initialX + (i % n) * spacingX} dy={initialY + Math.floor((i - indexFrom) / n) * spacingY}>
						<Room
							isPart1={isPart1}
							delta={i / 2 + 0.05}
							pattern={pattern}
							mirror={mirrors[i]}
							smudge={smudges[i]}
							smudgeOpacity={isPart1 ? 0 : 1}
							smudgeMirrorOpacity={isPart1 ? 0 : part2Opacity}
						/>
					</Translate>
				)
			})}
		</DayWrapper>
	);
};
