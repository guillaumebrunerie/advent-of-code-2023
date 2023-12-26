import { Easing, interpolate, useCurrentFrame } from "remotion";
import { fps, height, width, clamp, white } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { memo, useMemo } from "react";
import { raw } from "./raw";
import { Dot } from "../common/Dot";
import { Svg } from "../common/Svg";

type Point3D = {
	x: number,
	y: number,
	z: number,
};

const add = (p: Point3D, q: Point3D) => ({
	x: p.x + q.x,
	y: p.y + q.y,
	z: p.z + q.z,
});

const sub = (p: Point3D, q: Point3D) => ({
	x: p.x - q.x,
	y: p.y - q.y,
	z: p.z - q.z,
});

const mul = (k: number, p: Point3D) => ({
	x: k * p.x,
	y: k * p.y,
	z: k * p.z,
});

const cross = (p: Point3D, q: Point3D) => ({
	x: p.y * q.z - p.z * q.y,
	y: p.z * q.x - p.x * q.z,
	z: p.x * q.y - p.y * q.x,
});

const abs = (p: Point3D) => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2);

const dot = (p: Point3D, q: Point3D) => (
	p.x * q.x + p.y * q.y + p.z * q.z
);

const solve = () => {
// 	const raw = `19, 13, 30 @ -2,  1, -2
// 18, 19, 22 @ -1, -1, -2
// 20, 25, 34 @ -2, -2, -4
// 12, 31, 28 @ -1, -2, -1
// 20, 19, 15 @  1, -5, -3`;

	type Hailstone = {
		p: Point3D,
		v: Point3D,
	};

	const data: Hailstone[] = raw.split("\n").map(line => {
		const [a, b] = line.split(" @ ");
		const [px, py, pz] = a.split(", ").map(Number);
		const [vx, vy, vz] = b.split(", ").map(Number);
		return {p: {x: px, y: py, z: pz}, v: {x: vx, y: vy, z: vz}};
	});

	const findIntersection = (h1: Hailstone, h2: Hailstone) => {
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
				count++;
				intersections.push({x: ix, y: iy, z: 0, t: Math.max(t1, t2)});
			}
		}
	}

	console.log(`Day 24, part 1: ${count/2}`);


	const computeStuff = (t1: number, t2: number) => {
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

	// const v = mul(330, {
	// 	x: Math.sin(168 * Math.PI/180) * Math.cos(19 * Math.PI/180),
	// 	y: Math.sin(19 * Math.PI/180),
	// 	z: -Math.cos(19 * Math.PI/180) * Math.cos(168 * Math.PI/180),
	// });
	// const p = add({x: 285000000000000, y: 310000000000000, z: 400000000000000}, mul(-800000000000, v));
	// const candidate = {
	// 	p,
	// 	v,
	// };

	const getT = (h1: Hailstone, h2: Hailstone) => {
		const n = cross(h1.v, h2.v);
		const t1 = dot(cross(h2.v, n), sub(h2.p, h1.p)) / dot(n, n);
		const t2 = dot(cross(h1.v, n), sub(h2.p, h1.p)) / dot(n, n);
		return {t1, t2};
	};

	// console.log(data.map(h => getT(h, candidate)).toSorted((a, b) => a.t1 - b.t1).map(({t1, t2}) => ({
	// 	x: t1 / 100000000000,
	// 	y: t2 / 100000000000,
	// })));


	const getDistance = (h1: Hailstone, h2: Hailstone) => {
		const n = cross(h1.v, h2.v);
		return dot(n, sub(h2.p, h1.p)) / abs(n);
	};

	// for (let x = 47; x <= 82; x++) {
	// 	for (let y = 89; y <= 124; y++) {
	// 		for (let z = 290; z <= 320; z++) {
	// 			const h1 = {
	// 				p: data[0].p,
	// 				v: sub(data[0].v, {x, y, z})
	// 			};
	// 			const h2 = {
	// 				p: data[1].p,
	// 				v: sub(data[1].v, {x, y, z})
	// 			};
	// 			const d = getDistance(h1, h2);
	// 			// if (Math.abs(d) < 1000000) {
	// 				console.log({x, y, z, d});
	// 			// }
	// 		}
	// 	}
	// }
	const v = {x: 63, y: 104, z: 296};

	const {t1} = getT(
		{p: data[0].p, v: sub(data[0].v, v)},
		{p: data[1].p, v: sub(data[1].v, v)},
	);
	const pTmp = add(data[0].p, mul(t1, sub(data[0].v, v)));
	const p = {
		x: Math.round(pTmp.x),
		y: Math.round(pTmp.y),
		z: Math.round(pTmp.z),
	};
	console.log(`Day 24, part 2: ${p.x + p.y + p.z}`);

	const rock = {p, v};

	const theta = -Math.asin(v.y / abs(v)) * 180 / Math.PI;
	const alpha = Math.asin(v.x / abs(v) / Math.cos(theta * Math.PI/180)) * 180 / Math.PI;

	const times = data.map(hailstone => getT(hailstone, rock).t1);

	return {data, intersections, min, max, rock, alpha, theta, times};
};

const Intersection = memo(({intersection, minN, maxX}: {intersection: Point3D, minN: number, maxX: number}) => {
	const process = (p: Point3D) => {
		return {
			x: interpolate(p.x, [minN, maxX], [20, width - 20]),
			y: interpolate(p.y, [minN, maxX], [20, height - 20]),
			z: 0,
		};
	};
	return <Dot c={process(intersection)} r={0.5} style={{backgroundColor: white, boxShadow: `0 0 2px ${white}`}} />
});

export const Day24 = ({dayDuration}: {dayDuration: number, alpha: number, theta: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {data, intersections, min, max, rock, alpha: alphaM, theta: thetaM, times} = useMemo(solve, []);

	let alpha = interpolate(time % 8, [0.15, 7.85], [0, -alphaM + 360], {...clamp, easing: Easing.inOut(Easing.ease)});
	let theta = interpolate(time % 8, [0.15, 7.85], [0, thetaM], {...clamp, easing: Easing.inOut(Easing.ease)});
	if (isPart1) {
		alpha = 0;
		theta = 0;
	}
	alpha = alpha * Math.PI / 180;
	theta = theta * Math.PI / 180;

	const minN = Math.min(min.x, min.y, min.z);
	const maxX = Math.max(max.x, max.y, max.z);
	const process = (p: Point3D) => {
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

	const topLeft = process({x: 200000000000000, y: 200000000000000, z: 0});
	const bottomRight = process({x: 400000000000000, y: 400000000000000, z: 0});

	const part2T = Math.max(0, time - 8.5) * 150000000000;
	const rockOpacity = interpolate(time, [15.5, 15.85], [1, 0], clamp);

	return (
		<DayWrapper day={24} title="Never Tell Me The Odds" dayDuration={dayDuration}>
			<Svg style={{strokeWidth: 0.5, stroke: white}}>
				{data.map((hailstone, i) => {
					const from = process(hailstone.p);
					const to = process(add(hailstone.p, mul(dist, hailstone.v)));
					return <path key={i} d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}/>
				})}
				{isPart2 && (() => {
					const from = process(rock.p);
					const to = process(add(rock.p, mul(dist, rock.v)));
					return <path d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} style={{stroke: "yellow", strokeWidth: 2, strokeLinecap: "round", opacity: rockOpacity}}/>;
				})()}
				{isPart1 && <rect
								x={topLeft.x}
								y={topLeft.y}
								width={bottomRight.x - topLeft.x}
								height={bottomRight.y - topLeft.y}
								style={{stroke: "yellow", strokeWidth: 1}}
				/>}
			</Svg>
			{data.map((hailstone, i) => {
				if (part2T > times[i]) {
					return null;
				}
				return <Dot key={i} c={process(add(hailstone.p, mul(part2T, hailstone.v)))} r={2.5} style={{backgroundColor: "#0C0"}} />
			})}
			{isPart2 && <Dot c={process(add(rock.p, mul(part2T, rock.v)))} r={5} style={{backgroundColor: "yellow"}} />}
			{isPart1 && intersections.map((intersection, i) => {
				return intersection.t <= dist && <Intersection key={i} intersection={intersection} minN={minN} maxX={maxX}/>
			})}
		</DayWrapper>
	);
};
