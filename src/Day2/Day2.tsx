import { CSSProperties, ReactNode, useMemo } from "react";
import { raw } from "./raw";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { clamp, fps, height, width } from "../constants";
import { Easing, interpolate, interpolateColors, random, useCurrentFrame } from "remotion";
import { Dot } from "../common/Dot";
import { poissonDiskSampling, poissonDiskSamplingFixedSize } from "../common/poissonDiskSampling";

const solve = () => {
	const parsed = raw.split("\n").map(line => {
		const game = line.split(": ")[1];
		const showings = game.split("; ");
		return showings.map(showing => {
			const data = {
				red: 0,
				green: 0,
				blue: 0,
			};
			showing.split(", ").forEach(color => {
				if (color.endsWith(" red")) {
					data.red = Number(color.slice(0, color.length - " red".length))
				} else if (color.endsWith(" green")) {
					data.green = Number(color.slice(0, color.length - " green".length))
				} else if (color.endsWith(" blue")) {
					data.blue = Number(color.slice(0, color.length - " blue".length))
				}
			});
			return data;
		});
	});
	console.log({parsed});

	// Part 1
	let result1 = 0;
	for (let i = 1; i <= parsed.length; i++) {
		if (parsed[i - 1].every(showing => showing.red <= 12 && showing.green <= 13 && showing.blue <= 14)) {
			result1 += i;
		}
	}
	console.log("Part 1:", result1);

	// Part 2
	let result2 = 0;
	for (let i = 1; i <= parsed.length; i++) {
		const red = Math.max(...parsed[i - 1].map(showing => showing.red));
		const green = Math.max(...parsed[i - 1].map(showing => showing.green));
		const blue = Math.max(...parsed[i - 1].map(showing => showing.blue));
		const power = red * green * blue;
		result2 += power;
	}
	console.log("Part 2:", result2);

	return parsed;
}

type ShowingT = {red: number, green: number, blue: number};

const useCurrentTime = () => {
	return useCurrentFrame() / fps;
};

const style = (color: string, spread = 0) => ({
	backgroundColor: color,
	boxShadow: `0 0 4px ${spread}px ${color}, 0 0 10px ${spread}px ${color}`,
});

const colors = {
	red: "#e6410b",
	green: "#00CC00",
	blue: "#00c8ff",
	grey: "#333333",
};

// Alternate between two samplings, to avoid repeated squares at the same place
const sampling1 = poissonDiskSampling(width, height, 40, 20, "sampling1");
const sampling2 = poissonDiskSampling(width, height, 40, 20, "sampling2");

const Showing = ({showing, dayData, i: j, x, y, t, seed}: {
	showing: ShowingT,
	dayData: {
		day: 1 | 2,
		red: number,
		green: number,
		blue: number
	},
	i: number,
	x: number,
	y: number,
	t: number,
	seed: string,
}) => {
	const time = useCurrentTime();
	const localTime = time - t;

	const phase = random(`showing(${seed})`) * Math.PI * 2;
	const amount = showing.red + showing.green + showing.blue;
	const points = useMemo(() => (j % 2 ? sampling1 : sampling2).toSorted((p, q) => {
		const dp = (p.x - x) ** 2 + (p.y - y) ** 2;
		const dq = (q.x - x) ** 2 + (q.y - y) ** 2;
		return dp - dq;
	}).slice(0, amount).toSorted((p, q) => {
		const angleP = (Math.atan2(p.y - y, p.x - x) + Math.PI + phase) % (Math.PI * 2);
		const angleQ = (Math.atan2(q.y - y, q.x - x) + Math.PI + phase) % (Math.PI * 2);
		return angleP - angleQ;
	}), [x, y, amount, phase, j]);

	if (localTime < 0 || localTime >= 1) {
		return null;
	}

	const cubes: ReactNode[] = [];
	const makeCubes = (
		amount: number,
		colorData: number,
		color: string,
		offset: number,
	) => {
		const normalStyle = style(color);
		const ghostStyle = style(
			interpolateColors(localTime, [0.15, 0.6], [color, colors.grey]),
		);
		for (let i = 0; i < amount; i++) {
			if (dayData.day === 1) {
				cubes.push(<Dot c={points[i + offset]} r={8} borderRadius={0} style={amount > colorData ? ghostStyle : normalStyle}/>);
			} else if (dayData.day === 2) {
				cubes.push(<Dot c={points[i + offset]} r={8} borderRadius={0} style={j === colorData ? normalStyle : ghostStyle}/>);
			}
		}
	};
	makeCubes(showing.red, dayData.red, colors.red, 0);
	makeCubes(showing.green, dayData.green, colors.green, showing.red);
	makeCubes(showing.blue, dayData.blue, colors.blue, showing.red + showing.green);

	return cubes;
};

const pickIndexIf = <T,>(array: T[], f: (t: T) => boolean, seed: string): number | null => {
	const newArray = array.flatMap((t, i) => f(t) ? [i] : []);
	if (newArray.length === 0) {
		return null;
	}
	return newArray[Math.floor(random(seed) * newArray.length)];
};

const Game = ({game, t, seed, isPart1}: {game: ShowingT[], t: number, seed: number, isPart1: boolean}) => {
	// For part 2, for each color find the index of a showing having the max
	// amount of cubes for that color. If possible, try to pick them in separate
	// showings.
	const max = {
		red: Math.max(...game.map(showing => showing.red)),
		green: Math.max(...game.map(showing => showing.green)),
		blue: Math.max(...game.map(showing => showing.blue)),
	};
	const pickIndex = (
		necessary: (showing: ShowingT) => boolean,
		optional: (showing: ShowingT) => boolean,
		seed: string,
	) => (
		pickIndexIf(game, showing => (
			necessary(showing) && optional(showing)
		), seed) ?? pickIndexIf(game, necessary, `${seed},2`) ?? 0
	);
	const maxIndices = {
		red: pickIndex(
			showing => showing.red === max.red,
			showing => showing.green !== max.green && showing.blue !== max.blue,
			`red,${seed}`,
		),
		green: pickIndex(
			showing => showing.green === max.green,
			showing => showing.blue !== max.blue && showing.red !== max.red,
			`green,${seed}`,
		),
		blue: pickIndex(
			showing => showing.blue === max.blue,
			showing => showing.red !== max.red && showing.green !== max.green,
			`blue,${seed}`,
		),
	};
	const showingPositions = useMemo(() => poissonDiskSamplingFixedSize(width, height, game.length, `showings,${seed}`), [game, seed])
	return (
		game.map((showing, i) => {
			return (
				<Showing
					key={i}
					showing={showing}
					dayData={isPart1 ? {day: 1, red: 12, green: 13, blue: 14} : {day: 2, ...maxIndices}}
					i={i}
					x={showingPositions[i].x}
					y={showingPositions[i].y}
					t={t}
					seed={`game(${seed}, ${i})`}
				/>
			)
		})
	)
};

export const Day2 = ({dayDuration = 100}: {dayDuration: number}) => {
	const time = useCurrentTime();
	const isPart1 = time < dayDuration / 2;
	const parsed = useMemo(solve, []);

	return (
		<DayWrapper day={2} title="Cube Conundrum" dayDuration={dayDuration}>
			{parsed.map((game, i) => (
				i < dayDuration && <Game key={i} game={game} t={i} seed={i} isPart1={isPart1}/>
			))}
		</DayWrapper>
	)
};
