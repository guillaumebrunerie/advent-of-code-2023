import { raw } from "./raw";
import { CSSProperties, memo, useMemo } from "react";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Translate } from "../common/Translate";
import { fps, white } from "../constants";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { shuffle } from "../common/shuffle";

// Symbols: *#-+@%&=/$

type Highlight = {x: number, y: number, char: string}[];

const solve = (raw: string) => {
	const parsed = raw.split("\n");

	let result = 0;
	const potentialGears: {
		[gear: string]: {value: number, i: number, match: RegExpMatchArray}[]
	} = {};
	const symbolParts: {partStr: string, value: number, i: number, match: RegExpMatchArray}[] = [];
	parsed.forEach((line, i) => {
		for (const match of line.matchAll(/[0123456789]+/g)) {
			let foundSymbol = false;
			const index = match.index || 0;
			for (let x = index - 1; x <= index + match[0].length; x++) {
				for (let y = i - 1; y <= i + 1; y++) {
					if (x < 0 || x >= line.length || y < 0 || y >= parsed.length) {
						continue
					}
					const char = parsed[y][x];
					if (!char.match(/[0123456789.]/) && !foundSymbol) {
						foundSymbol = true;
						result += Number(match[0]);
					}
					if (!char.match(/[0123456789.]/)) {
						const pos = JSON.stringify({x, y, char});
						symbolParts.push({
							partStr: pos,
							value: Number(match[0]),
							i,
							match,
						});
					}
					if (char === "*") {
						const pos = JSON.stringify({x, y, char});
						potentialGears[pos] ||= [];
						potentialGears[pos].push({
							value: Number(match[0]),
							i,
							match,
						});
					}
				}
			}
		}
	});
	console.log("Part 1: ", result);

	let gearRatios = 0;
	let gears: Highlight[] = [];
	for (const [gearStr, numbers] of Object.entries(potentialGears)) {
		if (numbers.length === 2) {
			gearRatios += numbers[0].value * numbers[1].value;
			const {x, y, char} = JSON.parse(gearStr);
			const gear = [{x, y, char}];
			const setGear = (i: number, match: RegExpMatchArray) => {
				const index = match.index || 0;
				for (let k = index; k < index + match[0].length; k++) {
					gear.push({x: k, y: i, char: match[0][k - index]});
				}
			}
			setGear(numbers[0].i, numbers[0].match);
			setGear(numbers[1].i, numbers[1].match);
			gears.push(gear);
		}
	}
	gears = shuffle(gears, "gears");
	console.log("Part 2: ", gearRatios);

	let parts: Highlight[] = [];
	for (const {partStr, i, match} of symbolParts) {
		const {x, y, char} = JSON.parse(partStr);
		const part = [{x, y, char}];
		const index = match.index || 0;
		for (let k = index; k < index + match[0].length; k++) {
			part.push({x: k, y: i, char: match[0][k - index]});
		}
		parts.push(part);
	}
	parts = shuffle(parts, "parts");

	return {parsed, gears, parts};
};

const croppedSolve = (x: number, y: number, width: number, height: number) => {
	const newRaw = raw.split("\n").slice(y, y + height).map(line => line.slice(x, x + width)).join("\n");
	return solve(newRaw);
};

const color = "#00CC00";
const styles = {
	dark: {
		color: "#666666",
	},
	highlighted: {
		color: "#FFFFFF",
		textShadow: "0 0 10px #FFFFFF",
	},
	yellow: {
		color: "#FFFF66",
	},
	green: {
		color: "#00CC00",
	},
};

const getCharStyle = (char: string, isPart1: boolean, isHighlighted: boolean): CSSProperties => {
	if (char.match(/[0123456789]/)) {
		if (isHighlighted) {
			return isPart1 ? styles.yellow : styles.green;
		}
		return styles.dark;
	}
	if (char === "*") {
		return styles.highlighted;
	}
	if (isPart1) {
		return styles.highlighted;
	}
	return styles.dark;
};

const Char = ({char, isPart1, isHighlighted = false}: {char: string, isPart1: boolean, isHighlighted?: boolean}) => (
	<span style={getCharStyle(char, isPart1, isHighlighted)}>{char}</span>
);

const DataLine = memo(({line, isPart1}: {line: string, isPart1: boolean}) => (
	line.split("").map((char, j) => (
		char !== "." && (
			<Translate dx={j * spacingX}>
				<Char key={j} char={char} isPart1={isPart1}/>
			</Translate>
		)
	))
));

const Data = memo(({data, isPart1}: {data: string[], isPart1: boolean}) => (
	data.map((line, i) => (
		<Translate dy={i * spacingY}>
			<DataLine key={i} line={line} isPart1={isPart1}/>
		</Translate>
	))
));

const spacingY = 20;
const spacingX = 13.6;

const highlightStyles = {
	1: {
		backgroundColor: "#222",
		border: `1px solid ${white}`,
		boxShadow: `0 0 4px ${white}, 0 0 10px ${white}`,
	},
	2: {
		backgroundColor: "#002200",
		border: `1px solid ${color}`,
		boxShadow: `0 0 4px ${color}, 0 0 10px ${color}`,
	},
};

const Highlight = ({part, isPart1}: {part: Highlight, isPart1: boolean}) => {
	const x = Math.min(...part.map(pt => pt.x));
	const y = Math.min(...part.map(pt => pt.y));
	const w = Math.max(...part.map(pt => pt.x)) - x + 1;
	const h = Math.max(...part.map(pt => pt.y)) - y + 1;
	return (
		<>
			<AbsoluteFill style={{
				...highlightStyles[isPart1 ? 1 : 2],
				borderRadius: "5px",
				left: `${x * spacingX - 3}px`,
				top: `${y * spacingY + 1}px`,
				width: `${w * spacingX + 6}px`,
				height: `${h * spacingY + 7}px`,
			}}/>
			{part.map(({x, y, char}) => (
				<Translate dx={x * spacingX} dy={y * spacingY}>
					<Char isHighlighted char={char} isPart1={isPart1}/>
				</Translate>
			))}
		</>
	);
};

export const Day3 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const {parsed, gears, parts} = useMemo(() =>
		isPart1 ? croppedSolve(0, 0, 140, 53) : croppedSolve(0, 53, 140, 53),
		[isPart1],
	);
	const dyGlobal = 0;
	const length = isPart1 ? parts.length : gears.length;
	const partT = interpolate(
		time % (dayDuration / 2),
		[0.15, dayDuration / 2 - 0.15],
		[0, length],
	);
	return (
		<DayWrapper day={3} title="Gear Ratios" dayDuration={dayDuration} style={{
			fontSize: 22.8,
			fontWeight: 400,
		}}>
			<Translate dx={7} dy={7 - dyGlobal}>
				<Data data={parsed} isPart1={isPart1}/>
				{(isPart1 ? parts : gears).map((part, i) =>
					i < partT ? <Highlight part={part} isPart1={isPart1}/> : null
				)}
			</Translate>
		</DayWrapper>
	)
};
