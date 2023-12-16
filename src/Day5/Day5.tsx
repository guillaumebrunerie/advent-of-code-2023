import { useMemo } from "react";
import { raw } from "./raw";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { black, clamp, fps, height, width } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Line } from "../common/Line";
import { BezierCurve, ExtrudedBezierCurve } from "../common/BezierCurve";
import { Rectangle } from "../common/Rectangle";

type Transition = {
	destination: number,
	source: number,
	length: number,
}[];

type Range = {start: number, length: number};
type RangeTransition = Transition[number] & {i: number};

const solve = () => {
	const blocks = raw.split("\n\n");
	const seeds = blocks[0].split(": ")[1].split(" ").map(Number);
	const seedRanges: Range[] = seeds.flatMap((seed, i) => i % 2 === 0 ? [{start: seed, length: seeds[i+1]}] : []);
	const transitions = blocks.slice(1).map(block => {
		const transition = block.split("\n").slice(1).map(line => {
			const [destination, source, length] = line.split(" ").map(Number);
			return {destination, source, length};
		}).toSorted((a, b) => a.source - b.source).flatMap((elt, i, array) => (
			i === array.length - 1
				? [elt, {source: elt.source + elt.length, destination: elt.source + elt.length, length: Infinity}]
				: (array[i+1].source > elt.source + elt.length
					? [elt, {source: elt.source + elt.length, destination: elt.source + elt.length, length: array[i+1].source - elt.source - elt.length}]
					: [elt])
		));
		return transition;
	});

	const applyTransition = (value: number, transition: Transition) => {
		for (const {destination, source, length} of transition) {
			if (value >= source && value < source + length) {
				return destination + value - source;
			}
		}
		return value;
	};

	const allNumbers = [seeds];
	transitions.forEach(transition => {
		allNumbers.push(allNumbers.at(-1)!.map(number => applyTransition(number, transition)));
	});
	console.log("Day5, part 1:", Math.min(...allNumbers.at(-1)!));

	const applyTransitionToRange = (range: Range, transition: Transition): {
		ranges: Range[],
		rangeTransitions: Transition[number][],
	} => {
		const ranges = [];
		const rangeTransitions = [];
		for (const {destination, source, length} of transition) {
			const min = Math.max(source, range.start);
			const max = Math.min(source + length, range.start + range.length);
			if (max > min) {
				ranges.push({start: min + destination - source, length: max - min});
				rangeTransitions.push({
					source: min,
					destination: min + destination - source,
					length: max - min,
				})
			}
		}
		return {ranges, rangeTransitions};
	};
	const applyTransitionToRanges = (ranges: Range[], transition: Transition): {
		ranges: Range[],
		rangeTransitions: Transition[number][],
	} => {
		const data = ranges.map(range => applyTransitionToRange(range, transition));
		return {
			ranges: data.map(d => d.ranges).flat(),
			rangeTransitions: data.map(d => d.rangeTransitions).flat(),
		};
	};

	const allRangeTransitions: RangeTransition[] = [];
	let allRanges = seedRanges;
	let i = 0;
	transitions.forEach(transition => {
		const data = applyTransitionToRanges(allRanges, transition);
		allRanges = data.ranges;
		allRangeTransitions.push(...data.rangeTransitions.map(r => ({...r, i})));
		i++;
	})
	console.log("Day5, part 2:", Math.min(...allRanges.map(range => range.start)));

	for (const rt of allRangeTransitions.filter(rt => rt.i === 0)) {
		allRangeTransitions.push({...rt, destination: rt.source, i: -1});
	}
	for (const rt of allRangeTransitions.filter(rt => rt.i === 6)) {
		allRangeTransitions.push({...rt, source: rt.destination, i: 7});
	}

	return {allNumbers, allRangeTransitions};
};

export const Day5 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {allNumbers, allRangeTransitions} = useMemo(solve, []);

	const convertX = (x: number) => Math.round(x / (2 ** 32) * width);
	const newTime = Math.floor((time % (dayDuration / 2)) + 0.5) + interpolate(
		(time + 0.5) % 1,
		[0.3, 0.7],
		[0, 1],
		{...clamp, easing: Easing.inOut(Easing.ease)},
	) - 0.5;
	const convertY2 = (j: number) => (
		height * (j - Math.max(Math.min(newTime, 7.5), 0.5) + 1)
	);

	const curvature = -600; // + Math.sin(time * Math.PI / 2 /2 ) * 300;
	const curvatureX = (x: number) => -600 + Math.sin((convertX(x) - width/2) / 100 + time * 2) * 50;
	const seeds = allNumbers[0];
	return (
		<DayWrapper day={5} title="If You Give A Seed A Fertilizer" dayDuration={dayDuration}>
			{allNumbers.map((_, j) => (
				<Line
					key={j}
					from={{x: 0, y: convertY2(j)}}
					to={{x: width, y: convertY2(j)}}
					width={3}
					color="transparent"
				/>
			))}
			{isPart2 && allRangeTransitions.map(({source, destination, length, i}, j) => (
				<ExtrudedBezierCurve
					key={j}
					from={{x: convertX(source), y: convertY2(i)}}
					fromC={{x: convertX(source), y: convertY2(i) - curvatureX(source)}}
					toC={{x: convertX(destination), y: convertY2(i+1) + curvatureX(destination)}}
					to={{x: convertX(destination), y: convertY2(i+1)}}
					dx={Math.round(convertX(length) - convertX(0))}
					style={{
						fill: "#00FF0088",
						stroke: "none",
						strokeWidth: "0",
					}}
				/>
			))}
			{allNumbers.map((numbers, j) => seeds.map((_, i) => (
				j > 0 && (isPart1 || i % 2 === 0) && (
					<BezierCurve
						key={i}
						from={{x: convertX(allNumbers[j-1][i]), y: convertY2(j-1)}}
						fromC={{x: convertX(allNumbers[j-1][i]), y: convertY2(j-1) - curvatureX(allNumbers[j-1][i])}}
						toC={{x: convertX(numbers[i]), y: convertY2(j) + curvatureX(numbers[i])}}
						to={{x: convertX(numbers[i]), y: convertY2(j)}}
					/>
				)
			)))}
			{seeds.map((_, i) => (
				(isPart1 || i % 2 === 0) && (
					<BezierCurve
						key={i}
						from={{x: convertX(allNumbers[0][i]), y: convertY2(-0.5)}}
						fromC={{x: convertX(allNumbers[0][i]), y: convertY2(-0.5) - curvatureX(allNumbers[0][i])}}
						toC={{x: convertX(allNumbers[0][i]), y: convertY2(0) + curvatureX(allNumbers[0][i])}}
						to={{x: convertX(allNumbers[0][i]), y: convertY2(0)}}
					/>
				)
			))}
			{seeds.map((_, i) => (
				(isPart1 || i % 2 === 0) && (
					<BezierCurve
						key={i}
						from={{x: convertX(allNumbers.at(-1)![i]), y: convertY2(7)}}
						fromC={{x: convertX(allNumbers.at(-1)![i]), y: convertY2(7) - curvatureX(allNumbers.at(-1)![i])}}
						toC={{x: convertX(allNumbers.at(-1)![i]), y: convertY2(7.5) + curvatureX(allNumbers.at(-1)![i])}}
						to={{x: convertX(allNumbers.at(-1)![i]), y: convertY2(7.5)}}
					/>
				)
			))}
			<Line
				from={{x: convertX(47909639), y: 0}}
				to={{x: convertX(47909639), y: height}}
				width={10}
				color="transparent"
			/>
			<Rectangle x={0} y={convertY2(-0.5)} w={width} h={height / 2} style={{background: `linear-gradient(180deg, ${black}, ${black}BB, transparent)`}}/>
			<Rectangle x={0} y={convertY2(7)} w={width} h={height / 2} style={{background: `linear-gradient(0deg, ${black}, ${black}BB, transparent)`}}/>
		</DayWrapper>
	);
};

// {transitions[k].map((step, i) => (
// 	step.length !== Infinity && <Line
// 		key={i}
// 		from={{x: convertX(step.source), y: convertY(step.destination)}}
// 		to={{x: convertX(step.source + step.length), y: convertY(step.destination + step.length)}}
// 		width={5}
// 		color="green"
// 	/>
// ))}
// {transitions[k].map((step, i, array) => (
// 	i > 0 && <Line
// 		key={i}
// 		from={{x: convertX(array[i-1].source + array[i-1].length), y: convertY(array[i-1].destination + array[i-1].length)}}
// 		to={{x: convertX(step.source), y: convertY(step.destination)}}
// 		width={5}
// 		color="transparent"
// 	/>
// ))}
