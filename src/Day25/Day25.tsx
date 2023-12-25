import { Easing, interpolate, interpolateColors, random, useCurrentFrame } from "remotion";
import { fps, height, white, width, clamp } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { useMemo } from "react";
import { raw, rawPreProcessed } from "./raw";
import { poissonDiskSampling } from "../common/poissonDiskSampling";
import { Dot } from "../common/Dot";
import { Svg } from "../common/Svg";
import { shuffle } from "../common/shuffle";
import { Outro } from "../FullVideo/Outro";
import { Line } from "../common/Line";
import { Translate } from "../common/Translate";
import { Point } from "../common/Point";
import { defaultArg } from "tone";

type Graph = {[key: string]: string[]};

const solve = () => {
	const graph: Graph = {};
	const addConnection = (from: string, to: string) => {
		graph[from] ||= [];
		graph[from].push(to);
		graph[to] ||= [];
		graph[to].push(from);
	};
	rawPreProcessed.split("\n").map(line => {
		const [inNode, out] = line.split(": ");
		const outNodes = out.split(" ");
		for (const outNode of outNodes) {
			addConnection(inNode, outNode);
		}
	});

	const connectedComponent = (node: string) => {
		const nodes: string[] = [];
		const nextNodes = (node: string) => {
			nodes.push(node);
			for (const next of graph[node]) {
				if (!nodes.includes(next)) {
					nextNodes(next);
				}
			}
		};
		nextNodes(node);
		return nodes;
	};

	const cc1 = connectedComponent("ttj");
	const cc2 = connectedComponent("rpd");
	console.log(`Day 25: ${cc1.length * cc2.length}`);

	const graphRaw: Graph = {};
	const addConnectionRaw = (from: string, to: string) => {
		graphRaw[from] ||= [];
		graphRaw[from].push(to);
		graphRaw[to] ||= [];
		graphRaw[to].push(from);
	};
	raw.split("\n").map(line => {
		const [inNode, out] = line.split(": ");
		const outNodes = out.split(" ");
		for (const outNode of outNodes) {
			addConnectionRaw(inNode, outNode);
		}
	});

	return {graph: graphRaw, cc1, cc2};
};

const distribution1 = shuffle(poissonDiskSampling(height, height, 21.49, 10, "dist1"), "xxx");
const distribution2 = shuffle(poissonDiskSampling(width / 2, width / 2, 26.8, 10, "dist2"), "xxx");
const distribution3 = shuffle(poissonDiskSampling(width / 2, width / 2, 27.35, 10, "dist3"), "xxx");

const delta = 80;
const specialPositions = {
	rpd: {x: width / 2 + delta, y: height / 4},
	vps: {x: width / 2 + delta, y: height / 2},
	dgc: {x: width / 2 + delta, y: 3 * height / 4},

	ttj: {x: width / 2 - delta, y: height / 4},
	htp: {x: width / 2 - delta, y: height / 2},
	fqn: {x: width / 2 - delta, y: 3 * height / 4},
}

const tMax = 2;
const yMax = 0;
const initialY = height + 50;
const speed = (initialY - yMax) * 4 / tMax;
const gravity = 2 * speed / tMax;
const stars = Array(50).fill(true).map((_, i) => {
	const angle = (random(`angle${i}`) - 0.5) * 2 * 15;
	const v = speed * (1 + (random(`x${i}`) - 0.5) * 0.1);
	const vx = v * Math.sin(angle * Math.PI / 180);
	const vy = v * Math.cos(angle * Math.PI / 180);
	return {
		initialX: width / 2 + (random(`x${i}`) - 0.5) * 400,
		initialY,
		vx,
		vy,
	};
});

const Star = ({pos}: {pos: Point}) => {
	return (
		<Translate dx={pos.x} dy={pos.y}>
			<span style={{color: "yellow", fontWeight: "bold", fontSize: 42}}>*</span>
		</Translate>
	);
};

export const Day25 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {graph, cc1, cc2} = useMemo(solve, []);
	const nodes = Object.keys(graph);

	const initialX = (width - height + 20) / 2;
	const positionNode = (node: string) => {
		const clumping = 2.5
		const p = distribution1[nodes.indexOf(node)];
		const posFrom = {
			x: interpolate(p.x, [10, height - 10], [initialX + 10, initialX + height - 10], {easing: Easing.inOut(Easing.poly(1/clumping))}),
			y: interpolate(p.y, [10, height - 10], [10, height - 10], {easing: Easing.inOut(Easing.poly(1/clumping))}),
		};

		let p2;
		let dx = 10;
		let dy = 10;
		if (cc1.includes(node)) {
			p2 = distribution2[cc1.indexOf(node)];
			dx = 10;
			dy = height - (width / 2) + 10;
		} else {
			p2 = distribution3[cc2.indexOf(node)];
			dx = width / 2 + 10;
			dy = 10;
		}
		const factor = interpolate(time % 8, [0.15, 4], [1, 0.95], {...clamp, easing: Easing.inOut(Easing.ease)});
		const padding = (factor - 1) * width / 2;
		const posTo = specialPositions[node] || {
			x: interpolate(p2.x, [10, width / 2 - 10], [dx + 10 - padding, dx + width / 2 - 10 + padding], {easing: Easing.inOut(Easing.poly(1/clumping))}),
			y: interpolate(p2.y, [10, width / 2 - 10], [dy + 10 - padding, dy + width / 2 - 10 + padding], {easing: Easing.inOut(Easing.poly(1/clumping))}),
		};

		return {
			x: interpolate(time % 8, [0.15, 4], [posFrom.x, posTo.x], {...clamp, easing: Easing.inOut(Easing.ease)}),
			y: interpolate(time % 8, [0.15, 4], [posFrom.y, posTo.y], {...clamp, easing: Easing.inOut(Easing.ease)}),
		};
	};

	const cutY = interpolate(time, [4, 8], [0, height], clamp);
	const cutNodes = {
		ttjrpd: 5,
		vpshtp: 6,
		fqndgc: 7,
	};

	const fadeOut = interpolate(
		time,
		[15, 15.5],
		[1, 0],
		clamp,
	);

	return (
		<DayWrapper day={25} title="Snowverload" dayDuration={dayDuration} titleOpacity={fadeOut}>
			{isPart1 && nodes.map(node => (
				<Dot key={node} c={positionNode(node)} r={2} style={{backgroundColor: "yellow"}}/>
			))}
			{isPart1 && (
				<Svg style={{stroke: white, strokeWidth: 0.5}}>
					{nodes.map(inNode => (graph[inNode] || []).map(outNode => {
						if (inNode.localeCompare(outNode) <= 0) {
							return null;
						}
						const key = inNode + outNode;
						if (key in cutNodes && time >= cutNodes[key]) {
							return null;
						}
						const from = positionNode(inNode);
						const to = positionNode(outNode);
						const strokeWidth = interpolate(time % 8, [0.15, 4], [0.5, key in cutNodes ? 1 : 0.5], {...clamp, easing: Easing.inOut(Easing.ease)});
						const stroke = interpolateColors(time % 8, [0.15, 4], [white, key in cutNodes ? "#FFF" : white]);
						return (
							<path key={key} d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} style={{
								strokeWidth,
								stroke,
							}}/>
						);
					}
					))}
				</Svg>
			)}
			{isPart1 && <Line from={{x: width / 2, y: 0}} to={{x: width / 2, y: cutY}} width={2} color="#0C0"/>}
			{isPart2 && <Outro/>}
			{isPart2 && stars.map((star, i) => {
				const t = time - 8 - i * 5.5 / 50;
				if (t < 0) {
					return null;
				}
				const x = star.initialX + star.vx * t;
				const y = star.initialY - star.vy * t + gravity * t * t / 2;
				return <Star pos={{x, y}}/>
			})}
		</DayWrapper>
	);
};
