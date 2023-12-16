import { interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { raw } from "./raw";
import { clamp, fps, height, width } from "../constants";
import { Fragment, useMemo } from "react";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Translate } from "../common/Translate";
import { Line } from "../common/Line";
import { Svg } from "../common/Svg";

const solve = () => {
	const strings = raw.split(",");
	const hash = (str: string, modulo = 256) => {
		let v = 0;
		for (let i = 0; i < str.length; i++) {
			v += str.charCodeAt(i);
			v *= 17;
			v %= modulo;
		}
		return v;
	};
	const decoratedHash = (str: string, modulo = 256) => {
		let v = 0;
		const history = [v];
		for (let i = 0; i < str.length; i++) {
			v += str.charCodeAt(i);
			v *= 17;
			v %= modulo;
			history.push(v);
		}
		return {v, history};
	};

	let sum = 0;
	for (const str of strings) {
		sum += hash(str);
	}

	console.log(`Day 15, part 1: ${sum}`);

	const combine = (strings: string[], modulo = 256) => {
		const boxes: {label: string, focalLength: number}[][] = Array(modulo).fill(true).map(() => []);
		const maxes = [];
		const totals = [];

		for (const str of strings) {
			if (str.endsWith("-")) {
				const label = str.slice(0, -1);
				const box = hash(label, modulo);
				boxes[box] = boxes[box].filter(lens => lens.label !== label);
			} else {
				const [label, lengthStr] = str.split("=");
				const box = hash(label, modulo);
				const focalLength = Number(lengthStr);
				if (boxes[box].some(lens => lens.label === label)) {
					boxes[box] = boxes[box].map(lens => lens.label === label ? {label, focalLength} : lens);
				} else {
					boxes[box].push({label, focalLength});
				}
			}
			maxes.push(Math.max(...boxes.map(b => b.length)));
			totals.push(boxes.reduce((a, b) => a + b.length, 0));
		}
		return boxes;
	}

	const boxes = combine(strings);
	let total = 0;
	boxes.forEach((box, boxI) => {
		box.forEach((lens, lensI) => {
			total += (1 + boxI) * (1 + lensI) * lens.focalLength;
		});
	});
	console.log(`Day 15, part 2: ${total}`);

	const boxes16 = Array(800).fill(true).map((_, i) => combine(strings.slice(0, rows * columns + i)));

	return {strings, decoratedHash, boxes: boxes16};
};

const spacingX = 18;
const styles = {
	used: {color: "#666"},
	current: {boxShadow: "0 0 10px #0C0"},
	future: {color: "#CCC"},
	value: {color: "#666"},
	finishedValue: {color: "#CCC"},
};

const rows = 20;
const columns = 5;
const spacingCol = width / columns;
const spacingRow = height / rows;

const lensWidths   = [10, 5, 0, 15, 10, 5, 20, 15, 10];
const lensCxLefts  = [-10, -10, -10, 0, 0, 0, 10, 10, 10];
const lensCxRights = [-10, 0, 10, -10, 0, 10, -10, 0, 10];

const Lens = ({focalLength, lensHeight}: {focalLength: number, lensHeight: number}) => {
	const lensWidth = lensWidths[focalLength]
	const lensCy = 10;
	const lensCx = lensCxLefts[focalLength];
	const lensCx2 = lensCxRights[focalLength];
	const offset = lensHeight + 50;
	const x = offset - lensWidth / 2;
	const y = offset - lensHeight / 2;
	return (
		<Translate dx={-offset} dy={-offset}>
			<Svg>
				<path
					style={{
						fill: "#444",
						stroke: "#CCC",
						strokeWidth: 2,
					}}
					d={`
M ${x} ${y}
C ${x + lensCx} ${y + lensCy},
  ${x + lensCx} ${y + lensHeight - lensCy},
  ${x} ${y + lensHeight}
L ${x + lensWidth} ${y + lensHeight}
C ${x + lensWidth + lensCx2} ${y + lensHeight - lensCy},
  ${x + lensWidth + lensCx2} ${y + lensCy},
  ${x + lensWidth} ${y}
L ${x} ${y}
`}/>
			</Svg>
		</Translate>
	);
};

const boxRows = 8;
const boxCols = 32;
const spacingColRows = width / boxCols;
const spacingRowRows = height / boxRows;

const delta = 6;

const initialKerning = (lens: {focalLength: number}) => {
	const u = lensCxLefts[lens.focalLength - 1];
	if (u === 10) {
		return -8;
	}
	if (u === 0) {
		return 0;
	}
	if (u === -10) {
		return 8;
	}
	throw new Error("invalid");
};

const kerning = (lens1: {focalLength: number} | undefined, lens2: {focalLength: number}) => {
	const a = lens1 ? lensWidths[lens1.focalLength - 1]/2 : 0;
	const b = lensWidths[lens2.focalLength - 1]/2;
	if (lens1) {
		const t = lensCxRights[lens1.focalLength - 1];
		const u = lensCxLefts[lens2.focalLength - 1];
		if (t === 10 && u === -10) {
			return a + b + 16;
		}
		if (t === 10 && u === 0) {
			return a + b + 8;
		}
		if (t === 0 && u === -10) {
			return a + b + 8;
		}
	}
	return a + b;
};

const lensPosition = (lenses: {focalLength: number}[]) => {
	return lenses.reduce((acc, lens, i) => {
		return acc + kerning(lenses[i - 1], lens);
	}, initialKerning(lenses[0]) + lenses.length * delta);
}

export const Day15 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {strings, decoratedHash, boxes} = useMemo(solve, []);

	const index = Math.floor(time);
	const part2Index = Math.floor((time - 8) * 50);
	return (
		<DayWrapper day={15} title="Lens Library" dayDuration={dayDuration} style={{
			fontSize: 30,
			fontWeight: "500",
		}}>
			{isPart1 && strings.slice(0, rows * columns).map((str, i) => {
				const {history} = decoratedHash(str);
				const interval = [0.3, 0.45, 0.85, 1];
				const color = interpolateColors(time % 1, interval, ["#CCC", "#0C0", "#0C0", "#444"]);
				const shadowColor = interpolateColors(time % 1, interval, ["#CCC0", "#0C0", "#0C0", "#4440"]);
				const shadowSize = interpolate(time % 1, interval, [0, 4, 4, 0], clamp);
				const textShadow = `0 0 ${shadowSize}px ${shadowColor}, 0 0 ${shadowSize * 2}px ${shadowColor}`;
				const value = Math.round(interpolate(
					time % 1,
					[0.5, 0.85],
					[history[index] ?? history.at(-1)!, history[index+1] ?? history.at(-1)!],
					clamp,
				));
				let valueStyle = styles.value;
				if (index >= str.length || (index === str.length - 1 && (time % 1 >= 0.85))) {
					valueStyle = styles.finishedValue;
				}
				return (
					<Translate key={i} dx={50 + Math.floor(i / rows) * spacingCol} dy={5 + (i % rows) * spacingRow}>
						<Translate style={styles.used}>{str.slice(0, index)}</Translate>
						<Translate dx={index * spacingX} style={{color, textShadow}}>{str[index]}</Translate>
						<Translate dx={(index + 1) * spacingX} style={styles.future}>{str.slice(index + 1)}</Translate>
						<Translate dx={10 * spacingX} style={valueStyle}>{value}</Translate>
					</Translate>
				);
			})}
			{isPart2 && (
				<>
					{Array(boxRows).fill(true).map((_, i) => (
						<Fragment key={i}>
							<Line from={{x: 0, y: (1/2 + i) * spacingRowRows}} to={{x: width, y: (1/2 + i) * spacingRowRows}} color="white" width={1}/>
							{Array(boxCols - 1).fill(true).map((_, j) => (
								<Line from={{x: (j + 1/2) * spacingColRows, y: (1/2 + i) * spacingRowRows - 5}} to={{x: (j + 1/2) * spacingColRows, y: (1/2 + i) * spacingRowRows + 5}} color="white" width={1}/>
							))}
						</Fragment>
					))}
					{boxes[part2Index].map((box, boxId) => (
						<Translate key={boxId} dx={spacingColRows / 2 + Math.floor(boxId / boxRows) * spacingColRows} dy={(1/2 + boxId % boxRows) * spacingRowRows}>
							{box.map(({focalLength}, lensId) => (
								<Translate key={lensId} dx={lensPosition(box.slice(0, lensId + 1))}>
									<Lens
										focalLength={focalLength - 1}
										lensHeight={60 + Math.floor(boxId / boxRows) - lensId * 5}
									/>
								</Translate>
							))}
						</Translate>
					))}
				</>
			)}
		</DayWrapper>
	);
};
