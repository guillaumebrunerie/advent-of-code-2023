import { interpolate, useCurrentFrame } from "remotion";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { raw } from "./raw";
import { clamp, fps, height } from "../constants";
import { Translate } from "../common/Translate";
import { useMemo } from "react";

const digits = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

const getFirstDigit = (line: string, part: 1 | 2): number => {
	if (line.length === 0) {
		throw new Error("getFirstDigit");
	}
	for (let k = 1; k <= 9; k++) {
		if (line.startsWith(`${k}`) || (part === 2 && line.startsWith(digits[k - 1]))) {
			return k;
		}
	}
	return getFirstDigit(line.slice(1), part);
}

const getLastDigit = (line: string, part: 1 | 2): number => {
	if (line.length === 0) {
		throw new Error("getLastDigit");
	}
	for (let k = 1; k <= 9; k++) {
		if (line.endsWith(`${k}`) || (part === 2 && line.endsWith(digits[k - 1]))) {
			return k;
		}
	}
	return getLastDigit(line.slice(0, line.length - 1), part);
}

const solve = () => {
	const parsed = raw.split("\n");
	let result = 0;
	for (const line of parsed) {
		const a = getFirstDigit(line, 1);
		const b = getLastDigit(line, 1);
		result += a * 10 + b;
	}
	console.log(`Part 1: ${result}`);

	result = 0;

	for (const line of parsed) {
		const a = getFirstDigit(line, 2);
		const b = getLastDigit(line, 2);
		result += a * 10 + b;
	}
	console.log(`Part 2: ${result}`);
};

solve();

const data = [...raw.split("\n"), ...raw.split("\n")];

const color = "#00CC00";
const styles = [
	{},
	{
		color: "#FFFFFF",
		textShadow: "0 0 10px #ffffff",
	},
	{
		color,
		textShadow: `0 0 4px ${color}, 0 0 10px ${color}`,
	},
];

const process = (data: string[], part: 1 | 2) => {
	return data.map(line => {
		const params = line.split("").map(() => 0);
		const regexp = {
			1: /[0123456789]/g,
			2: /[0123456789]|one|two|three|four|five|six|seven|eight|nine/g,
		}[part];
		const matches = [...line.matchAll(regexp)];
		for (const match of matches) {
			const isFirstOrLast = match === matches[0] || match === matches.at(-1);
			for (let k = 0; k < match[0].length; k++) {
				params[match.index as number + k] = isFirstOrLast ? 2 : 1;
			}
		}

		return {line, params};
	});
}

const DataLine = ({processed, process}: {processed: {line: string, params: number[]}, process: boolean}) => {
	if (!process) {
		return <div>{processed.line}</div>;
	}
	return (
		<div>
			{processed.line.split("").map((c, i) => <span key={i} style={styles[processed.params[i]]}>{c}</span>)}
		</div>
	);
};

const useCurrentTime = () => {
	return useCurrentFrame() / fps;
};

export const Day1 = ({blockDuration = 1, dayDuration}: {blockDuration?: number, dayDuration: number}) => {
	const spacing = height / 25;
	const time = useCurrentTime();
	const isPart1 = time < dayDuration / 2;
	console.log({time, dayDuration});
	const processedPart1 = useMemo(() => process(data, 1), []);
	const processedPart2 = useMemo(() => process(data, 2), []);

	return (
		<DayWrapper day={1} title="Trebuchet?!" dayDuration={dayDuration} style={{
			fontSize: 30,
			fontWeight:300,
			textAlign: "center",
		}}>
			{data.map((_, i) => {
				const block = Math.floor(time / blockDuration);
				const blockRatio = time / blockDuration - block;
				const delta = 0.15 / blockDuration;
				const process = i < (block + interpolate(blockRatio, [delta, 1 - delta], [0, 1], clamp)) * 25;
				const dy = i * spacing - height * block;
				if (dy < 0 || dy > height) {
					return null;
				}
				return (
					<Translate key={i} dy={dy}>
						<DataLine
							processed={(isPart1 ? processedPart1 : processedPart2)[i]}
							process={process}
						/>
					</Translate>
				)
			})}
		</DayWrapper>
	);
};
