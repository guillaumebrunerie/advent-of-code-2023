import { useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../common/Background";
import { Circle } from "../common/Circle";
import { parse } from "./parse";
import { poissonDiskSampling } from "./poissonDiskSampling";
import { raw } from "./raw";
import { useMemo } from "react";
import { dayDuration } from "../constants";

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
	const points = useMemo(() => poissonDiskSampling(1920 - r * 2, 1080 - r * 2, r * 2).toSorted((p, q) => p.x - q.x), [r]);
	console.log(points.length);

	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const getColor = (i: number) => {
		if (i >= frame * 7) {
			return "#222";
		}
		if (i >= (frame - dayDuration * fps / 2) * 7) {
			return getResult(data[i]) === "win" ? "white"
				: getResult(data[i]) === "lose" ? "black"
					: "grey";
		}
			return getResult2(data[i]) === "win" ? "white"
				: getResult2(data[i]) === "lose" ? "black"
					: "grey";
	}

	return (
		<>
			<Background/>
			{points.map(({x, y}, i) => (
				<Circle key={i} r={10} cx={x + r} cy={y + r} color={getColor(i)}/>
			))}
		</>
	);
};
