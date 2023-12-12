import { interpolate, random, useCurrentFrame } from "remotion";
import { raw } from "./raw";
import { clamp, fps, white, width } from "../constants";
import { useMemo } from "react";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Translate } from "../common/Translate";
import { Rectangle } from "../common/Rectangle";
import { shuffle } from "../common/shuffle";

const sum = (nums: number[]) => {
	let result = 0;
	for (const num of nums) {
		result += num;
	}
	return result;
}

type Input = {map: string, blocks: number[]};

const solve = () => {
	const data = raw.split("\n").map(line => {
		const [map, str] = line.split(" ");
		const blocks = str.split(",").map(Number);
		return {map, blocks};
	});

	const cache: {[key: string]: number} = {};
	const combinations = ({map, blocks}: Input) => {
		if (blocks.length === 0) {
			return map.includes("#") ? 0 : 1;
		}
		const key = `${map} ${blocks.join(",")}`;
		if (cache[key] !== undefined) {
			return cache[key];
		}
		let count = 0;
		for (let i = 0; i <= map.length - (sum(blocks) + blocks.length - 1); i++) {
			const isPossible = !map.slice(0, i).includes("#") && !map.slice(i, i + blocks[0]).includes(".") && map[i + blocks[0]] !== "#";
			if (isPossible) {
				count += combinations({
					map: map.slice(i + blocks[0] + 1),
					blocks: blocks.slice(1),
				});
			}
		}
		cache[key] = count;
		return count;
	}

	console.log("Day 12, part 1:", sum(data.map(combinations)));

	const quintiplate = ({map, blocks}: Input) => ({
		map: [map, map, map, map, map].join("?"),
		blocks: [...blocks, ...blocks, ...blocks, ...blocks, ...blocks],
	});

	console.log("Day 12, part 2:", sum(data.map(input => combinations(quintiplate(input)))));

	const combinationAt = ({map, blocks}: Input, index: number): number[] => {
		if (blocks.length === 0) {
			if (map.includes("#")) {
				throw new Error("combinationAt")
			}
			return [];
		}
		let count = 0;
		for (let i = 0; i <= map.length - (sum(blocks) + blocks.length - 1); i++) {
			const previousCount = count;
			const isPossible = !map.slice(0, i).includes("#") && !map.slice(i, i + blocks[0]).includes(".") && map[i + blocks[0]] !== "#";
			const newInput = {
				map: map.slice(i + blocks[0] + 1),
				blocks: blocks.slice(1),
			};
			if (isPossible) {
				count += combinations(newInput);
			}
			if (count > index) {
				return [i, ...combinationAt(newInput, index - previousCount).map(k => k + i + blocks[0] + 1)]
			}
		}
		throw new Error("out of range");
	};

	return {data, quintiplate, combinations, combinationAt};
};

const spacingX = 16;
const spacingY = 54;
const lineHeight = 36;

const randomShufflePick = (seed: string, index: number, total: number) => {
	if (total >= 100) {
		return Math.floor(random(seed + index) * total);
	}
	const shuffled = shuffle(Array(total).fill(true).map((_, i) => i), seed);
	return shuffled[index % total];
}

const InputData = ({isPart1, input, combinations, combinationAt}: {
	isPart1: boolean,
	input: Input,
	combinations: (input: Input) => number,
	combinationAt: (input: Input, index: number) => number[],
}) => {
	const frequency = isPart1 ? 2 : 4;
	const time = useCurrentFrame() / fps;
	const indexFrom = randomShufflePick(input.map, Math.floor(time * frequency), combinations(input));
	const indexTo = randomShufflePick(input.map, Math.ceil(time * frequency), combinations(input));
	const solutionFrom = combinationAt(input, indexFrom);
	const solutionTo = combinationAt(input, indexTo);
	const solution = solutionFrom.map((_, i) => interpolate((time * frequency) % 1, [0.15, 0.55], [solutionFrom[i], solutionTo[i]], clamp));

	return (
		<div>
			{solution.map((p, k) => (
				<Rectangle
					key={k}
					x={0.5 + p * spacingX}
					y={2}
					w={input.blocks[k] * spacingX}
					h={lineHeight}
					style={{backgroundColor: "#343"}}
				/>
			))}
			{input.map.split("").map((c, i) => {
				return (
					<Translate key={i} dx={i * spacingX}>
						<span style={{
							position: "absolute",
							color: c === "#" ? "#00CC00" : "#FFFFFF",
							textShadow: c === "#" ? `0 0 4px #00CC00` :  `0 0 4px #FFFFFF`,
						}}>{c === "?" ? " " : c === "." ? "·" : c}</span>
					</Translate>
				);
			})}
			<Rectangle
				x={0.5}
				y={2}
				w={input.map.length * spacingX}
				h={lineHeight}
				style={{outline: `2px solid ${white}`}}
			/>
			<span style={{
				position: "absolute",
				left: `${input.map.length * spacingX + 7}px`,
			}}>{combinations(input)}</span>
		</div>
	);
};

export const Day12 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const {data, quintiplate, combinations, combinationAt} = useMemo(solve, []);
	const duration = 4;
	return (
		<DayWrapper day={12} title="Hot Springs" dayDuration={dayDuration} style={{
			fontSize: 29,
			textAlign: "center",
		}}>
			{data.slice(Math.floor(time / duration) * 20, Math.floor(time / duration) * 20 + 20).map((input_, i) => {
				const input = isPart1 ? input_ : quintiplate(input_);
				return (
					<Translate key={i} dy={6 + i * spacingY} dx={(width - input.map.length * spacingX) / 2}>
						<InputData isPart1={isPart1} input={input} combinations={combinations} combinationAt={combinationAt}/>
					</Translate>
				);
			})}
			{isPart1 && data.slice(100 + Math.floor(time / duration) * 20, 100 + Math.floor(time / duration) * 20 + 20).map((input, i) => {
				return (
					<Translate key={i} dy={6 + i * spacingY} dx={(width - input.map.length * spacingX) / 2 - width / 3}>
						<InputData isPart1={isPart1} input={input} combinations={combinations} combinationAt={combinationAt}/>
					</Translate>
				);
			})}
			{isPart1 && data.slice(200 + Math.floor(time / duration) * 20, 200 + Math.floor(time / duration) * 20 + 20).map((input, i) => {
				return (
					<Translate key={i} dy={6 + i * spacingY} dx={(width - input.map.length * spacingX) / 2 + width / 3}>
						<InputData isPart1={isPart1} input={input} combinations={combinations} combinationAt={combinationAt}/>
					</Translate>
				);
			})}
		</DayWrapper>
	);
};
