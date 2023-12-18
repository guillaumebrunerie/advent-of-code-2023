import { Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp, fps, height, width } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { useMemo } from "react";
import { raw } from "./raw";
import { Point } from "../common/Point";
import { Svg } from "../common/Svg";
import { translatePath } from "@remotion/paths";
import { Translate } from "../common/Translate";
import { optionsFromArguments } from "tone";

const solve = () => {
	const data1 = raw.split("\n").map(line => {
		const [dir, b, c] = line.split(" ");
		const length = Number(b);
		const color = c.slice(1, -1);
		return {dir, length, color, from: {x: 0, y: 0}, to: {x: 0, y: 0}};
	});

	const data2 = raw.split("\n").map(line => {
		const [,, c] = line.split(" ");
		const length = parseInt(c.slice(2, 7), 16);
		const dir = "RDLU"[Number(c[7])]
		return {dir, length, from: {x: 0, y: 0}, to: {x: 0, y: 0}};
	});

	const dig = (data: {dir: string, length: number, from: Point, to: Point}[]) => {
		const position = {x: 0, y: 0};
		data.forEach(({dir, length}, i) => {
			data[i].from.x = position.x;
			data[i].from.y = position.y;

			switch (dir) {
			case "L":
				position.x -= length;
				break;
			case "R":
				position.x += length;
				break;
			case "U":
				position.y -= length;
				break;
			case "D":
				position.y += length;
				break;
			default:
				throw new Error();
			}

			data[i].to.x = position.x;
			data[i].to.y = position.y;
		});

		if (data[data.length - 1].to.x !== 0 || data[data.length - 1].to.y !== 0) {
			throw new Error("not looping");
		}
	}
	dig(data1);

	const minX = Math.min(...data1.map(d => d.from.x));
	const maxX = Math.max(...data1.map(d => d.from.x));
	const minY = Math.min(...data1.map(d => d.from.y));
	const maxY = Math.max(...data1.map(d => d.from.y));

	let count = 0;
	for (let x = minX; x <= maxX; x++) {
		for (let y = minY; y <= maxY; y++) {
			if (data1.some(({from, to}) => {
				if (from.x === x && to.x === x && Math.min(from.y, to.y) <= y && Math.max(from.y, to.y) >= y) {
					return true;
				}
				if (from.y === y && to.y === y && Math.min(from.x, to.x) <= x && Math.max(from.x, to.x) >= x) {
					return true;
				}
				return false;
			})) {
				count++;
			} else {
				// Ray tracing from top left quadrant
				const walls = data1.filter(d => {
					return ["U", "D"].includes(d.dir) && d.from.x > x && Math.min(d.from.y, d.to.y) < y && Math.max(d.from.y, d.to.y) >= y
				}).length;
				if (walls % 2 === 1) {
					count++;
				}
			}
		}
	}
	console.log(`Day 18, part 1: ${count}`);

	dig(data2);
	const xs = [...new Set(data2.map(d => d.from.x))].toSorted((a, b) => a - b).flatMap(x => [x, x+1]);
	const ys = [...new Set(data2.map(d => d.from.y))].toSorted((a, b) => a - b).flatMap(y => [y, y+1]);

	let count2 = 0;
	xs.forEach((x, kx) => {
		if (kx === xs.length - 1) {
			return;
		}
		ys.forEach((y, ky) => {
			if (ky === ys.length - 1) {
				return;
			}
			const area = (xs[kx + 1] - x) * (ys[ky + 1] - y);
			if (data2.some(({from, to}) => {
				if (from.x === x && to.x === x && Math.min(from.y, to.y) <= y && Math.max(from.y, to.y) >= y) {
					return true;
				}
				if (from.y === y && to.y === y && Math.min(from.x, to.x) <= x && Math.max(from.x, to.x) >= x) {
					return true;
				}
				return false;
			})) {
				count2 += area;
			} else {
				// Ray tracing from top left quadrant
				const walls = data2.filter(d => {
					return ["U", "D"].includes(d.dir) && d.from.x > x && Math.min(d.from.y, d.to.y) < y && Math.max(d.from.y, d.to.y) >= y
				}).length;
				if (walls % 2 === 1) {
					count2 += area;
				}
			}
		}
		)
	})
	console.log(`Day 18, part 2: ${count2}`);

	return {data1, data2};
};

const line = (from: Point, to: Point, scale = 1) => `M ${from.x * scale} ${from.y * scale} L ${to.x * scale} ${to.y * scale} `;

export const Day18 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {data1, data2} = useMemo(solve, []);

	const minX1 = Math.min(...data1.map(d => d.from.x));
	const maxX1 = Math.max(...data1.map(d => d.from.x));
	const minY1 = Math.min(...data1.map(d => d.from.y));
	const maxY1 = Math.max(...data1.map(d => d.from.y));

	const minX2 = Math.min(...data2.map(d => d.from.x));
	const maxX2 = Math.max(...data2.map(d => d.from.x));
	const minY2 = Math.min(...data2.map(d => d.from.y));
	const maxY2 = Math.max(...data2.map(d => d.from.y));

	const index1 = interpolate(time, [0.15, dayDuration/2 - 0.15], [0, data1.length], {...clamp, easing: Easing.inOut(Easing.ease)});
	const paths1 = data1.slice(0, index1);

	const index2 = interpolate(time - 8, [0.3, dayDuration/2 - 0.15], [0, data2.length], {...clamp, easing: Easing.inOut(Easing.ease)});
	const paths2 = data2.slice(0, index2);

	const interval = [8, 8.45];
	const options = {...clamp, easing: Easing.poly(10)};
	const minX = interpolate(time, interval, [minX1, minX2], options);
	const maxX = interpolate(time, interval, [maxX1, maxX2], options);
	const minY = interpolate(time, interval, [minY1, minY2], options);
	const maxY = interpolate(time, interval, [maxY1, maxY2], options);
	const sizeX = maxX - minX;
	const sizeY = maxY - minY;
	const scale = Math.min((width - 20) / sizeX, (height - 20) / sizeY);
	const part2Width = interpolate(time, interval, [6, 2], options);

	return (
		<DayWrapper day={18} title="Lavaduct Lagoon" dayDuration={dayDuration}>
			<Translate dx={-(scale * sizeX - (width - 20)) / 2}>
				<Svg style={{strokeWidth: "6px", strokeLinecap: "square"}}>
					<path
						d={translatePath(
							`M ${data1[0].from.x} ${data1[0].from.y} ` + paths1.map(({to}) => `L ${to.x * scale} ${to.y * scale}`).join(" ") + " Z",
							-minX * scale + 10,
							-minY * scale + 10,
						)}
						style={{fill: "#222"}}
					/>
					{paths1.map(({from, to, color}, i) => {
						return <path key={i} d={translatePath(line(from, to, scale), -minX * scale + 10, -minY * scale + 10)} style={{stroke: color}}/>
					})}
				</Svg>
			</Translate>
			<Svg style={{strokeWidth: part2Width + "px", strokeLinecap: "square"}}>
				<path
					d={translatePath(
						`M ${data2[0].from.x} ${data2[0].from.y} ` + paths2.map(({to}) => `L ${to.x * scale} ${to.y * scale}`).join(" ") + " Z",
						-minX * scale + 10 + -(scale * sizeX - (width - 20)) / 2,
						-minY * scale + 10,
					)}
					style={{fill: "#222"}}
				/>
				{paths2.map(({from, to}, i) => {
					return <path key={i} d={translatePath(
						line(from, to, scale),
						-minX * scale + 10 + -(scale * sizeX - (width - 20)) / 2,
						-minY * scale + 10,
					)} style={{stroke: "#080"}}/>
				})}
			</Svg>
		</DayWrapper>
	);
};
