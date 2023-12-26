import { Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp, fps, height, width } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { useMemo } from "react";
import { raw } from "./raw";
import { Translate } from "../common/Translate";
import { Point } from "../common/Point";
import { translatePath } from "@remotion/paths";
import { Svg } from "../common/Svg";
import { Rectangle } from "../common/Rectangle";
import { shuffle } from "../common/shuffle";

type Dir = "left" | "right" | "up" | "down";
type Beam = {x: number, y: number, dir: Dir};

const solve = () => {
	const room = raw.split("\n");
	const rows = room.length;
	const cols = room[0].length;
	const forwardBeam = ({x, y, dir}: Beam): Beam => {
		switch (dir) {
		case "left": return {x: x - 1, y, dir};
		case "right": return {x: x + 1, y, dir};
		case "up": return {x, y: y - 1, dir};
		case "down": return {x, y: y + 1, dir};
		}
	};
	const mirrorBeam = ({x, y, dir}: Beam): Beam => {
		switch (dir) {
		case "left": return {x, y, dir: "down"};
		case "right": return {x, y, dir: "up"};
		case "up": return {x, y, dir: "right"};
		case "down": return {x, y, dir: "left"};
		}
	};
	const antiMirrorBeam = ({x, y, dir}: Beam): Beam => {
		switch (dir) {
		case "left": return {x, y, dir: "up"};
		case "right": return {x, y, dir: "down"};
		case "up": return {x, y, dir: "left"};
		case "down": return {x, y, dir: "right"};
		}
	};
	const hSplitBeam = ({x, y, dir}: Beam): Beam[] => {
		switch (dir) {
		case "left": return [{x, y, dir}];
		case "right": return [{x, y, dir}];
		case "up": return [{x, y, dir: "left"}, {x, y, dir: "right"}];
		case "down": return [{x, y, dir: "left"}, {x, y, dir: "right"}];
		}
	};
	const vSplitBeam = ({x, y, dir}: Beam): Beam[] => {
		switch (dir) {
		case "left": return [{x, y, dir: "up"}, {x, y, dir: "down"}];
		case "right": return [{x, y, dir: "up"}, {x, y, dir: "down"}];
		case "up": return [{x, y, dir}];
		case "down": return [{x, y, dir}];
		}
	};
	const moveBeam = (beam: Beam): Beam[] => {
		const {x, y} = beam;
		switch (room[y][x]) {
		case ".":
			return [forwardBeam(beam)];
		case "/":
			return [forwardBeam(mirrorBeam(beam))];
		case "\\":
			return [forwardBeam(antiMirrorBeam(beam))];
		case "-":
			return hSplitBeam(beam).map(forwardBeam);
		case "|":
			return vSplitBeam(beam).map(forwardBeam);
		default:
			throw new Error("wrong char");
		}
	};

	const shineBeam = (initialBeam: Beam) => {
		let beams: Beam[] = [initialBeam];
		const illuminated: {dir: Dir, i: number}[][][] = room.map(line => line.split("").map(() => []));
		let i = 0;
		while (beams.length > 0) {
			const newBeams = [];
			for (const beam of beams) {
				illuminated[beam.y][beam.x].push({dir: beam.dir, i});
				newBeams.push(...moveBeam(beam));
			}
			beams = newBeams.filter(({x, y, dir}) => {
				if (x < 0 || x >= cols || y < 0 || y >= rows) {
					return false;
				}
				if (illuminated[y][x].some(d => d.dir === dir)) {
					return false;
				}
				return true;
			});
			i++;
		}

		const count = illuminated.flat().filter(l => l.length > 0).length;
		return {count, illuminated, steps: i, initialBeam};
	};
	const part1 = shineBeam({x: 0, y: 0, dir: "right"});
	console.log(`Day 16, part 1: ${part1.count}`);

	const range = (n: number) => Array(n).fill(true).map((_, i) => i);

	const maxTop = Math.max(...range(cols).map(x => shineBeam({x, y: 0, dir: "down"}).count));
	const maxDown = Math.max(...range(cols).map(x => shineBeam({x, y: rows - 1, dir: "up"}).count));
	const maxLeft = Math.max(...range(cols).map(y => shineBeam({x: 0, y, dir: "right"}).count));
	const maxRight = Math.max(...range(cols).map(y => shineBeam({x: cols - 1, y, dir: "left"}).count));
	console.log(`Day 16, part 2: ${Math.max(maxTop, maxDown, maxLeft, maxRight)}`);

	// const part2Full = range(rows).map(y => shineBeam({x: 0, y, dir: "right"})).toSorted((a, b) => a.steps - b.steps);
	// const part2 = [0, 44, 15, 66, 29, 88, 43, 109].map(i => part2Full[i]);
	const part2 = range(rows).map(y => shineBeam({x: cols - 1, y, dir: "left"})).toSorted((a, b) => a.steps - b.steps).at(-1)!;
	return {room, part1, part2};
};

const cellSize = 9;

const line = (from: Point, to: Point, scale = 1) => `M ${from.x * scale} ${from.y * scale} L ${to.x * scale} ${to.y * scale} `;

const cellPath = (c: string) => {
	const splitterDelta = 0;
	const mirrorDelta = cellSize / 8;
	switch (c) {
	case ".":
		return "";
	case "|":
		return line({x: cellSize / 2, y: splitterDelta}, {x: cellSize / 2, y: cellSize - splitterDelta});
	case "-":
		return line({x: splitterDelta, y: cellSize / 2}, {x: cellSize - splitterDelta, y: cellSize / 2});
	case "/":
		return line({x: mirrorDelta, y: cellSize - mirrorDelta}, {x: cellSize - mirrorDelta, y: mirrorDelta});
	case "\\":
		return line({x: mirrorDelta, y: mirrorDelta}, {x: cellSize - mirrorDelta, y: cellSize - mirrorDelta});
	}
	throw new Error("error");
};

const Room = ({room}: {room: string[]}) => {
	return (
		<Svg style={{stroke: "#CCC", strokeWidth: 3, strokeLinecap: "round"}}>
			{room.map((line, y) => line.split("").map((char, x) => {
				if (char === ".") {
					return null;
				}
				return <path d={translatePath(cellPath(char), x * cellSize, y * cellSize)}/>
			}))}
		</Svg>
	);
};

const beamPath = (char: string, dirs: Dir[]) => {
	const middle = {x: 0.5, y: 0.5};
	const n = line({x: 0.5, y: 0}, middle, cellSize);
	const s = line({x: 0.5, y: 1}, middle, cellSize);
	const w = line({x: 0, y: 0.5}, middle, cellSize);
	const e = line({x: 1, y: 0.5}, middle, cellSize);
	const segments = {
		"left.": [e, w],
		"left-": [e, w],
		"left|": [e, n, s],
		"left/": [e, s],
		"left\\": [e, n],
		"right.": [e, w],
		"right-": [e, w],
		"right|": [w, n, s],
		"right/": [w, n],
		"right\\": [w, s],
		"up.": [n, s],
		"up-": [s, e, w],
		"up|": [n, s],
		"up/": [e, s],
		"up\\": [w, s],
		"down.": [n, s],
		"down-": [n, e, w],
		"down|": [n, s],
		"down/": [w, n],
		"down\\": [e, n],
	};
	const segs = [];
	for (const dir of dirs) {
		for (const s of segments[dir + char]) {
			if (!segs.includes(s)) {
				segs.push(s);
			}
		}
	}
	return segs.join("");
};

const Illumination = ({illumination, room, index, opacity = 1}: {
	illumination: {dir: Dir, i: number}[][][],
	room: string[],
	index: number,
	opacity?: number,
}) => {
	return (
		<Svg style={{stroke: "#0C0", strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round", opacity}}>
			{illumination.map((line, y) => line.map((dirs, x) => {
				const newDirs = dirs.flatMap(({dir, i}) => i < index ? [dir] : []);
				if (newDirs.length > 0) {
					return <path d={translatePath(beamPath(room[y][x], newDirs), x * cellSize, y * cellSize)}/>;
				}
				return null;
			}))}
		</Svg>
	);
};

export const Day16 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {room, part1, part2} = useMemo(solve, []);

	const stepsBefore = 20;
	const beam = isPart1 ? part1 : part2;
	const index = Math.floor(interpolate(time % 8, [0.15, 7.85], [-stepsBefore, beam.steps], {...clamp, easing: Easing.quad}));
	const dx = (width - cellSize * room[0].length) / 2;
	const dy = (height - cellSize * room.length) / 2;
	const initialDx = Math.min(1, (index + stepsBefore) / stepsBefore) * dx;
	return (
		<DayWrapper day={16} title="The Floor Will Be Lava" dayDuration={dayDuration}>
			<Svg style={{stroke: "#0C0", strokeWidth: 1, strokeLinecap: "round", strokeLinejoin: "round"}}>
				<path d={`M ${isPart1 ? 0 : width} ${dy + beam.initialBeam.y * cellSize + cellSize / 2} L ${isPart1 ? initialDx : width - initialDx} ${dy + beam.initialBeam.y * cellSize + cellSize / 2}`}/>
			</Svg>
			<Translate dx={dx} dy={dy}>
				<Rectangle w={cellSize * room[0].length} h={cellSize * room.length} style={{outline: "2px solid white", background: "#111", opacity: 0.5}}/>
				<Illumination illumination={beam.illuminated} room={room} index={index}/>
				<Room room={room}/>
			</Translate>
		</DayWrapper>
	);
};
