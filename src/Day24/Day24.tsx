import { Easing, interpolate, useCurrentFrame } from "remotion";
import { fps, height, width, clamp, white } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { memo, useMemo } from "react";
import { NotImplementedYet } from "../common/NotImplementedYet";
import { raw } from "./raw";
import { Rectangle } from "../common/Rectangle";
import { Line } from "../common/Line";
import { Dot } from "../common/Dot";
import { Svg } from "../common/Svg";

	const add = (p, q) => ({
		x: p.x + q.x,
		y: p.y + q.y,
		z: p.z + q.z,
	});
	const sub = (p, q) => ({
		x: p.x - q.x,
		y: p.y - q.y,
		z: p.z - q.z,
	});
	const mul = (k, p) => ({
		x: k * p.x,
		y: k * p.y,
		z: k * p.z,
	});
	const cross = (p, q) => ({
		x: p.y * q.z - p.z * q.y,
		y: p.z * q.x - p.x * q.z,
		z: p.x * q.y - p.y * q.x,
	});
	const abs = (p) => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2);

const solve = () => {
// 	const raw = `19, 13, 30 @ -2,  1, -2
// 18, 19, 22 @ -1, -1, -2
// 20, 25, 34 @ -2, -2, -4
// 12, 31, 28 @ -1, -2, -1
// 20, 19, 15 @  1, -5, -3`;

	const data = raw.split("\n").map(line => {
		const [a, b] = line.split(" @ ");
		const [px, py, pz] = a.split(", ").map(Number);
		const [vx, vy, vz] = b.split(", ").map(Number);
		return {p: {x: px, y: py, z: pz}, v: {x: vx, y: vy, z: vz}};
	});

	const findIntersection = (h1, h2) => {
		const t2 = (h1.v.y * h1.p.x - h1.v.x * h1.p.y - (h1.v.y * h2.p.x - h1.v.x * h2.p.y)) / (h1.v.y * h2.v.x - h1.v.x * h2.v.y);
		const t1 = (h2.v.y * h2.p.x - h2.v.x * h2.p.y - (h2.v.y * h1.p.x - h2.v.x * h1.p.y)) / (h2.v.y * h1.v.x - h2.v.x * h1.v.y);
		const ix = h1.p.x + t1 * h1.v.x;
		const iy = h1.p.y + t1 * h1.v.y;
		return {t1, t2, ix, iy};
	}

	const intersections = [];
	let count = 0;
	for (const h1 of data) {
		for (const h2 of data) {
			if (h1 === h2) {
				continue;
			}
			const {t1, t2, ix, iy} = findIntersection(h1, h2);
			if (t1 > 0 && t2 > 0 && ix >= 200000000000000 && ix <= 400000000000000 && iy >= 200000000000000 && iy <= 400000000000000) {
				count++
				intersections.push({x: ix, y: iy, z: 0, t: Math.max(t1, t2)});
			}
		}
	}

	console.log(`Day 24, part 1: ${count/2}`);


	const computeStuff = (t1, t2) => {
		const {p: p1, v: v1} = data[0];
		const {p: p2, v: v2} = data[1];
		const pt1 = add(p1, mul(t1, v1));
		const pt2 = add(p2, mul(t2, v2));
		const v = mul(-1/(t2-t1), add(pt1, mul(-1, pt2)));
		const pt1I = mul(t2, pt1);
		const pt2I = mul(t1, pt2);
		const p = mul(1/(t2-t1), add(pt1I, mul(-1, pt2I)));

		const {p: p3, v: v3} = data[29];
		// How far is (p3 - p) away from being colinear with (v3 - v) ?
		return Math.asin(abs(cross(mul(1/abs(sub(p3,p)), sub(p3, p)), mul(1/abs(sub(v3,v)), sub(v3, v)))));
		// return {p, v};
	};
	// debugger;
	// computeStuff(2, 2.00001);

	const minX = 0;
	const spanX = 400000000000000;
	const minY = 0;
	const spanY = 400000000000000;
	// // const steps = 20;
	// // let str = "";
	// // for (let t1 = minY; t1 < minY + spanY; t1 += spanY / steps) {
	// // 	for (let t2 = minX; t2 < minX + spanX; t2 += spanX / steps) {
	// // 		str += `${Math.round(Math.log(computeStuff(t1, t2)))} `;
	// // 	}
	// // 	str += "\n";
	// // }
	// // console.log(str);

	// // const minX = 0;
	// // const spanX = 20;
	// // const minY = 0;
	// // const spanY = 20;
	// const steps = 20;
	// let str = "";
	// for (let t1 = minY; t1 < minY + spanY; t1 += spanY / steps) {
	// 	str += `${t1}: `;
	// 	for (let t2 = minX; t2 < minX + spanX; t2 += spanX / steps) {
	// 		str += `${(computeStuff(t1, t2) * 180 / Math.PI).toPrecision(2)} `;
	// 	}
	// 	str += "\n";
	// }
	// console.log(str);

	// const findT2 = (t1, min = 0, max = 200, v = NaN) => {
	// 	if ((max - min) < 1) {
	// 		return {t2: min, v};
	// 	}
	// 	const steps = 1000;
	// 	const delta = (max - min) / steps;
	// 	let bestT2 = 0;
	// 	let bestV = Infinity;
	// 	for (let t2 = min + delta / 2; t2 < max; t2 += delta) {
	// 		const v = computeStuff(t1, t2);
	// 		if (v < bestV) {
	// 			bestV = v;
	// 			bestT2 = t2;
	// 		}
	// 	}
	// 	return findT2(t1, bestT2 - delta / 2, bestT2 + delta / 2, bestV);
	// }
	// const doIt = (from, by) => {
	// 	for (let t1 = from; t1 < from + by; t1 += by / 20) {
	// 		const {t2, v} = findT2(t1);
	// 		console.log(`t1: ${t1}, t2: ${t2}, v: ${v}`);
	// 	}
	// };
	// doIt(0, 20);

	// debugger;

	// console.log(`Day 24, part 2: ${0}`);
	const min = {
		x: Math.min(...data.map(d => d.p.x)),
		y: Math.min(...data.map(d => d.p.y)),
		z: Math.min(...data.map(d => d.p.z)),
	};
	const max = {
		x: Math.max(...data.map(d => d.p.x)),
		y: Math.max(...data.map(d => d.p.y)),
		z: Math.max(...data.map(d => d.p.z)),
	};

	return {data, intersections, min, max};
};

const Intersection = memo(({intersection, minN, maxX}) => {
	const process = (p) => {
		return {
			x: interpolate(p.x, [minN, maxX], [20, width - 20]),
			y: interpolate(p.y, [minN, maxX], [20, height - 20]),
			z: 0,
		};
	};
	return <Dot c={process(intersection)} r={0.5} style={{backgroundColor: white, boxShadow: `0 0 2px ${white}`}} />
});

export const Day24 = ({dayDuration, alpha, theta}: {dayDuration: number, alpha: number, theta: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {data, intersections, min, max} = useMemo(solve, []);

	alpha = interpolate(time % 8, [0.15, 7.85], [0, 168 + 180], {...clamp, easing: Easing.inOut(Easing.ease)});
	theta = interpolate(time % 8, [0.15, 7.85], [0, -19], {...clamp, easing: Easing.inOut(Easing.ease)});
	if (isPart1) {
		alpha = 0;
		theta = 0;
	}
	alpha = alpha * Math.PI / 180;
	theta = theta * Math.PI / 180;

	const minN = Math.min(min.x, min.y, min.z);
	const maxX = Math.max(max.x, max.y, max.z);
	const process = (p) => {
		const centered = {
			x: interpolate(p.x, [minN, maxX], [-100, 100]),
			y: interpolate(p.y, [minN, maxX], [-100, 100]),
			z: interpolate(p.z, [minN, maxX], [-100, 100]),
		};
		const rotated1 = {
			x: centered.x * Math.cos(alpha) + centered.z * Math.sin(alpha),
			y: centered.y,
			z: -centered.x * Math.sin(alpha) + centered.z * Math.cos(alpha),
		};
		const rotated2 = {
			x: rotated1.x,
			y: rotated1.y * Math.cos(theta) + rotated1.z * Math.sin(theta),
			z: -rotated1.y * Math.sin(theta) + rotated1.z * Math.cos(theta),
		};
		const screen = {
			x: interpolate(rotated2.x, [-100, 100], [20, width - 20]),
			y: interpolate(rotated2.y, [-100, 100], [20, height - 20]),
			z: 0,
		};
		return screen;
	};
	const dist = isPart1 ? interpolate(time, [0, 7.85], [0, (maxX - minN) / 200], {...clamp, easing: Easing.quad}) : maxX - minN;

	return (
		<DayWrapper day={24} title="Never Tell Me The Odds" dayDuration={dayDuration}>
			<Svg style={{strokeWidth: 0.5, stroke: white}}>
				{data.map(hailstone => {
					const from = process(hailstone.p);
					const to = process(add(hailstone.p, mul(dist, hailstone.v)));
					return <path d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}/>
				})}
			</Svg>
			{data.map(hailstone => {
				return <Dot c={process(hailstone.p)} r={2.5} style={{backgroundColor: "#0C0"}} />
			})}
			{isPart1 && intersections.map(intersection => {
				return intersection.t <= dist && <Intersection intersection={intersection} minN={minN} maxX={maxX}/>
			})}
		</DayWrapper>
	);
};
