import { interpolate, useCurrentFrame } from "remotion";
import { Point } from "../common/Point";
import { raw } from "./raw";
import { clamp, fps, height, white, width } from "../constants";
import { useMemo } from "react";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { shuffle } from "../common/shuffle";
import { Dot } from "../common/Dot";
import { Svg } from "../common/Svg";

const solve = () => {
	const data = raw.split("\n").map(line => line.split(""));
	const galaxies: Point[] = [];
	const emptyRows: number[] = [];
	const emptyColumns: number[] = [];
	data.forEach((line, y) => {
		if (!line.includes("#")) {
			emptyRows.push(y);
		}
		line.forEach((char, x) => {
			if (char === "#") {
				galaxies.push({x, y});
			}
			if (y === 0) {
				if (data.every(line2 => line2[x] !== "#")) {
					emptyColumns.push(x);
				}
			}
		});
	});

	let distance = 0;
	const getDistance = (g1: Point, g2: Point, expansion: number) => {
		const base = Math.abs(g1.x - g2.x) + Math.abs(g1.y - g2.y);
		const expandedRows = emptyRows.filter(y => y > Math.min(g1.y, g2.y) && y < Math.max(g1.y, g2.y)).length;
		const expandedColumns = emptyColumns.filter(x => x > Math.min(g1.x, g2.x) && x < Math.max(g1.x, g2.x)).length;
		return base + (expandedRows + expandedColumns) * (expansion - 1);
	};
	const galaxyPairs: {g1: Point, g2: Point}[] = [];
	galaxies.forEach((g1, i) => galaxies.forEach((g2, j) => {
		if (i > j) {
			distance += getDistance(g1, g2, 2);
			galaxyPairs.push({g1, g2});
		}
	}));
	console.log("Day 11, part 1:", distance);

	let distance2 = 0;
	galaxies.forEach((g1, i) => galaxies.forEach((g2, j) => {
		if (i > j) {
			distance2 += getDistance(g1, g2, 1000000);
		}
	}));
	console.log("Day 11, part 2:", distance2);

	return {galaxies, galaxyPairs: shuffle(galaxyPairs, "shuffle"), emptyRows, emptyColumns};
}

export const Day11 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const {galaxies, galaxyPairs, emptyRows, emptyColumns} = useMemo(solve, []);
	const w = isPart1 ? interpolate(time, [0.15, 7.85], [0, 0.05]) : interpolate(time, [8, 15.85], [0.05, 0.999], clamp);
	const expansion = 20 * w / (1 - w);
	const convertX = (x: number) => {
		const newX = x + emptyColumns.filter(c => c < x).length * (expansion - 1);
		const totalX = 140 + emptyColumns.length * (expansion - 1);
		return interpolate(newX, [0, totalX], [20, width - 20], clamp);
	};
	const convertY = (y: number) => {
		const newY = y + emptyRows.filter(r => r < y).length * (expansion - 1);
		const totalY = 140 + emptyRows.length * (expansion - 1);
		return interpolate(newY, [0, totalY], [20, height - 20], clamp);
	};
	const convert = (p: Point) => ({x: convertX(p.x), y: convertY(p.y)});
	const index = Math.max(0, Math.floor((time - 0.15) * 250));
	return (
		<DayWrapper day={11} title="Cosmic Expansion" dayDuration={dayDuration}>
			{galaxies.map((g, i) => (
				<Dot
					key={i}
					c={convert(g)}
					r={3}
					style={{backgroundColor: "#006600"}}
				/>
			))}
			<Svg style={{stroke: white, strokeWidth: 0.4}}>
			{galaxyPairs.slice(0, index).map(({g1, g2}, i) => (
				<path
					key={i}
					d={`M ${convertX(g1.x)} ${convertY(g1.y)} L ${convertX(g2.x)} ${convertY(g2.y)} `}
				/>
			))}
			</Svg>
		</DayWrapper>
	);
};
