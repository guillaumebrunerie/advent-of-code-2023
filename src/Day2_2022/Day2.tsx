import { useMemo } from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";

import { Dot } from "../common/Dot";
import { parse } from "./parse";
import { poissonDiskSampling } from "./poissonDiskSampling";
import { raw } from "./raw";
import { black, grey, white, red } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";

const data = parse(raw);

const getResult = (input: [string, string]) => {
	const a = "ABC".split("").indexOf(input[0]);
	const b = "XYZ".split("").indexOf(input[1]);
	switch ((3 + a - b) % 3) {
	case 0:
		return "tie";
	case 1:
		return "win";
	case 2:
		return "lose";
	default:
		throw new Error();
	}
}

const getResult2 = (input: [string, string]) => {
	switch (input[1]) {
	case "X":
		return "lose";
	case "Y":
		return "draw";
	case "Z":
		return "win";
	default:
		throw new Error();
	}
}

export const Day2 = ({dayDuration}: {dayDuration: number}) => {
	const r = 12;
	const {fps, width, height} = useVideoConfig();
	const points = useMemo(() => poissonDiskSampling(width - r * 2, height - r * 2, r * 2).toSorted((p, q) => p.y - q.y), [r, width, height]);

	const frame = useCurrentFrame();

	const speed = points.length / (dayDuration * fps) * 2;
	const getColor = (i: number) => {
		if (i >= frame * speed) {
			return black;
		}
		if (i >= (frame - dayDuration * fps / 2) * speed) {
			return getResult(data[i]) === "win" ? red
				: getResult(data[i]) === "lose" ? grey
					: white;
		}
		return getResult2(data[i]) === "win" ? red
			: getResult2(data[i]) === "lose" ? grey
				: white;
	}

	return (
		<DayWrapper day={2} title="Rock Paper Scissors" dayDuration={dayDuration}>
			{points.map(({x, y}, i) => (
				<Dot key={i} r={5} c={{x: x + r, y: y + r}} style={{backgroundColor: getColor(i)}} borderRadius={random(i) > 0.5 ? 5 : 0}/>
			))}
		</DayWrapper>
	);
};
