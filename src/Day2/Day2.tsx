import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

import { Circle } from "../common/Circle";
import { parse } from "./parse";
import { poissonDiskSampling } from "./poissonDiskSampling";
import { raw } from "./raw";
import { black, grey, dayDuration, white, red } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";

const data = parse(raw);
console.log(data.length, data);

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

export const Day2 = () => {
	const r = 11;
	const {fps, width, height} = useVideoConfig();
	const points = useMemo(() => poissonDiskSampling(width - r * 2, height - r * 2, r * 2).toSorted((p, q) => p.x - q.x), [r, width, height]);

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
		<DayWrapper day={2} title="Calorie counting">
			{points.map(({x, y}, i) => (
				<Circle key={i} r={10} cx={x + r} cy={y + r} color={getColor(i)}/>
			))}
		</DayWrapper>
	);
};
