import { interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { clamp, fps, height, width } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { useMemo } from "react";
import { raw } from "./raw";
import { Dot } from "../common/Dot";
import { poissonDiskSampling } from "../common/poissonDiskSampling";
import { shuffle } from "../common/shuffle";
import { Point } from "../common/Point";
import { Rectangle } from "../common/Rectangle";

type Rating = {x: number, a: number, m: number, s: number};
type Block = {x: [number, number], a: [number, number], m: [number, number], s: [number, number]};
type Rule = {
	condition: (r: Rating) => boolean,
	blockCondition: (block: Block) => {passing: Block | null, nonPassing: Block | null},
	result: string,
};
type Workflow = Rule[];
type State = {state: string, block: Block, prev: State | null, nexts: State[]};

const solve = () => {
	const [a, b] = raw.split("\n\n");
	const workflows: Record<string, Workflow> = a.split("\n").map(line => {
		const name = line.slice(0, line.indexOf("{"));
		const rules = line.slice(line.indexOf("{") + 1, -1).split(",").map(rule => {
			if (rule.includes(":")) {
				const [str, r] = rule.split(":");
				const key = str[0] as keyof Rating;
				const sign = str[1];
				const result = Number(str.slice(2));
				return {
					condition: (v: Rating) => {
						switch (sign) {
						case ">": return v[key] > result;
						case "<": return v[key] < result;
						default: throw new Error("invalid");
						}
					},
					blockCondition: (block: Block) => {
						switch (sign) {
						case ">":
							if (result < block[key][0]) {
								return {passing: block, nonPassing: null};
							}
							if (result >= block[key][1]) {
								return {passing: null, nonPassing: block};
							}
							return {
								passing: {...block, [key]: [result + 1, block[key][1]]},
								nonPassing: {...block, [key]: [block[key][0], result]},
							}
						case "<":
							if (result <= block[key][0]) {
								return {passing: null, nonPassing: block};
							}
							if (result > block[key][1]) {
								return {passing: block, nonPassing: null};
							}
							return {
								passing: {...block, [key]: [block[key][0], result - 1]},
								nonPassing: {...block, [key]: [result, block[key][1]]},
							}
						default:
							throw new Error("invalid");
						}
					},
					result: r,
				};
			}
			return {condition: () => true, blockCondition: (block: Block) => ({passing: block, nonPassing: null}), result: rule};
		});
		return {name, rules};
	}).reduce((acc, {name, rules}) => {
		acc[name] = rules;
		return acc;
	}, {} as Record<string, Workflow>);

	const ratings = b.split("\n").map(line => {
		return line.slice(1, -1).split(",").reduce((acc, cond) => {
			acc[cond[0] as keyof Rating] = Number(cond.slice(2));
			return acc;
		}, {} as Rating)
	});

	const isAccepted = (rating: Rating, workflow: string): boolean => {
		if (workflow === "A") {
			return true;
		}
		if (workflow === "R") {
			return false;
		}
		for (const rule of workflows[workflow]) {
			if (rule.condition(rating)) {
				return isAccepted(rating, rule.result);
			}
		}
		throw new Error("invalid");
	}

	const result1 = ratings.filter(r => isAccepted(r, "in")).reduce((acc, r) => {
		return acc + r.x + r.m + r.a + r.s;
	}, 0)

	console.log(`Day 19, part 1: ${result1}`);

	const initialState: State = {
		state: "in",
		block: {x: [1, 4000], m: [1, 4000], a: [1, 4000], s: [1, 4000]},
		nexts: [],
		prev: null,
	};
	const processState = (state: State) => {
		if (state.state === "R") {
			const newState = {...state, nexts: [], prev: state};
			state.nexts.push(newState);
			return [newState];
		}
		if (state.state === "A") {
			const newState = {...state, nexts: [], prev: state};
			state.nexts.push(newState);
			return [newState];
		}
		const result = [];
		let {block} = state;
		for (const rule of workflows[state.state]) {
			const {passing, nonPassing} = rule.blockCondition(block);
			if (passing) {
				const nextBlock = {state: rule.result, block: passing, nexts: [], prev: state};
				result.push(nextBlock);
				state.nexts ||= [];
				state.nexts.push(nextBlock);
			}
			if (nonPassing) {
				block = nonPassing;
				continue;
			}
			break;
		}
		return result;
	};

	const processStates = (states: State[]) => {
		return states.flatMap(state => processState(state));
	};

	let states = [initialState];
	const statesHistory = [states];
	while (states.some(s => s.state !== "A" && s.state !== "R")) {
		states = processStates(states);
		statesHistory.push(states);
	}
	const result2 = states.reduce((acc, state) => {
		if (state.state === "R") {
			return acc;
		}
		const {x, m, a, s} = state.block;
		return acc + (x[1] - x[0] + 1) * (m[1] - m[0] + 1) * (a[1] - a[0] + 1) * (s[1] - s[0] + 1);
	} , 0);

	console.log(`Day 19, part 2: ${result2}`);

	return {statesHistory};
};

const distribution = poissonDiskSampling(width, height, 34, 30, "hello");

const factorsX = [1, 1.1, 1.1, 1.1, 1.15, 1, 1, 1];
const factorsY = [1, 1, 2, 2.5, 2.1, 1.25, 1, 1];
const deltaX = [0, 0, 170, 180, 170, 0, 0, 0];
const deltaY = [-20, 0, 0, 0, 50, 50, 0, 0];

export const Day19 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {statesHistory} = useMemo(solve, []);
	const index = Math.min(Math.floor(time % 8), 7);

	const position = (index: number, i: number): Point => {
		if (index === 7) {
			return distribution[i];
		}
		const positions = statesHistory[index][i].nexts?.map(state => position(index + 1, statesHistory[index + 1].indexOf(state)))
		const sums = positions.reduce((p, q) => ({x: p.x + q.x, y: p.y + q.y}), {x: 0, y: 0});
		return {
			x: sums.x / positions.length,
			y: sums.y / positions.length,
		};
	};
	const positionN = (index: number, i: number): Point => {
		const {x, y} = position(index, i);
		return {
			x: (x - width / 2) * factorsX[index] + width / 2 + deltaX[index],
			y: (y - height / 2) * factorsY[index] + height / 2 + deltaY[index],
		}
	};

	const volume = (state: State) => {
		const {block: {x, m, a, s}} = state;
		return (x[1] - x[0] + 1) * (m[1] - m[0] + 1) * (a[1] - a[0] + 1) * (s[1] - s[0] + 1);
	};

	const rect = (index: number, i: number): {x: number, y: number, w: number, h: number} => {
		if (index === 0) {
			return {
				x: 20,
				y: 20,
				w: width - 40,
				h: height - 40,
			};
		}
		const state = statesHistory[index][i];
		const {prev} = state;
		const {x, y, w, h} = rect(index - 1, statesHistory[index - 1].indexOf(prev!));
		const k = prev!.nexts.indexOf(state);
		const v = volume(state);
		const prevV = prev!.nexts.slice(0, k).reduce((a, b) => a + volume(b), 0);
		const totalV = prev!.nexts.reduce((a, b) => a + volume(b), 0);
		if (index % 2 === 1) {
			return {
				x: x + (w * prevV) / totalV,
				y,
				w: w * v / totalV,
				h,
			};
		}
		return {
			x,
			y: y + (h * prevV) / totalV,
			w,
			h: h * v / totalV,
		};
	}

	const t = interpolate(time % 1, [0, 0.5], [0, 1], clamp);

	return (
		<DayWrapper day={19} title="Aplenty" dayDuration={dayDuration}>
			{isPart1 && statesHistory[index].map(({block: {x, m, a, s}, state, prev}, i) => {
				const volumeTo = (x[1] - x[0] + 1) * (m[1] - m[0] + 1) * (a[1] - a[0] + 1) * (s[1] - s[0] + 1);
				let volumeFrom = volumeTo;
				if (prev) {
					const {x, m, a, s} = prev.block;
					volumeFrom = (x[1] - x[0] + 1) * (m[1] - m[0] + 1) * (a[1] - a[0] + 1) * (s[1] - s[0] + 1);
				}
				const volume = interpolate(t, [0, 1], [volumeFrom, volumeTo], clamp);

				const positionTo = positionN(index, i);
				const positionFrom = prev ? positionN(index - 1, statesHistory[index - 1].indexOf(prev)) : positionTo;
				const pos = {
					x: interpolate(t, [0, 1], [positionFrom.x, positionTo.x], clamp),
					y: interpolate(t, [0, 1], [positionFrom.y, positionTo.y], clamp),
				};

				const colorTo = state === "A" ? "#0C0" : state === "R" ? "#444" : "#DDD";
				let colorFrom = colorTo;
				if (prev) {
					const {state} = prev;
					colorFrom = state === "A" ? "#0C0" : state === "R" ? "#444" : "#DDD";
				}
				const color = interpolateColors(t, [0, 1], [colorFrom, colorTo]);
				return (
					<Dot
						key={i}
						c={pos}
						r={Math.sqrt(volume) / 30000}
						style={{
							borderRadius: "50%",
							background: color,
							border: "2px solid #222",
						}}
					/>
				);
			})}
			{isPart2 && index > 0 && statesHistory[index - 1].map(({state}, i) => {
				const rectangle = rect(index - 1, i);
				return <Rectangle {...rectangle} style={{
					border: "1px solid white",
					backgroundColor: state === "A" ? "#0C0" : state === "R" ? "#444" : "transparent",
				}}/>
			})}
			{isPart2 && statesHistory[index].map(({state}, i) => {
				const rectangle = rect(index, i);
				return <Rectangle {...rectangle} style={{
					border: "1px solid white",
					backgroundColor: state === "A" ? "#0C0" : state === "R" ? "#444" : "transparent",
					opacity: t,
				}}/>
			})}
		</DayWrapper>
	);
};
