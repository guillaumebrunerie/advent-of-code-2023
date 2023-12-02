import { useCurrentFrame } from "remotion";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Translate } from "../common/Translate";
import { raw } from "./raw";
import { dayDuration, height, fps, width, white, red } from "../constants";
import { Line } from "../common/Line";

const parse = (data: string) => {
	return data.split("\n").map((line) => line.split(""));
};

const data = parse(raw);

const spacing = height / 18;

const highlightCommon = (common: string) => (letter: string, i: number) => {
	if (letter === common) {
		return <span key={i} style={{
			color: red,
			textShadow: "0 0 4px #FFFFCC, 0 0 10px #FFFFCC",
		}}>{letter}</span>
	}
	return letter;
}


const Rucksack1 = ({r}: {r: string[]}) => {
	const left = r.slice(0, r.length / 2);
	const right = r.slice(r.length / 2);
	const common = left.find(x => right.some(y => x === y)) || "";
	return <div>{[...left.map(highlightCommon(common)), " ", ...right.map(highlightCommon(common))]}</div>;
}

const Rucksack2 = ({i}: {i: number}) => {
	const i1 = i - (i % 3);
	const i2 = i1 + 1;
	const i3 = i1 + 2;
	const common = data[i1].find(l => data[i2].includes(l) && data[i3].includes(l)) || "";
	return <div>{data[i].map(highlightCommon(common))}</div>;
}

const blockDuration = dayDuration / 16;

export const Day3 = () => {
	const frame = useCurrentFrame();
	const isDay1 = frame < dayDuration * fps / 2;

	return (
		<DayWrapper day={3} title="Rucksack Reorganization" dayDuration={dayDuration} style={{
			fontSize: 30,
			fontWeight:300,
			textAlign: "center",
		}}>
			{data.map((line, i) => {
				const block = Math.floor((frame / fps) / blockDuration);
				const dy = i * spacing - height * block;
				return (
					<Translate key={i} dy={dy + 5}>
						{isDay1 ? <Rucksack1 r={line}/> : <Rucksack2 i={i}/>}
					</Translate>
				)
			})}
			{isDay1 ? <Line from={{x: width/2, y: 0}} to={{x: width/2, y: height}} color={white} width={2}/>
				: (
					<Translate dy={-5}>
						<Line from={{x: 0, y: spacing * 3}} to={{x: width, y: spacing * 3}} color={white} width={2}/>
						<Line from={{x: 0, y: spacing * 6}} to={{x: width, y: spacing * 6}} color={white} width={2}/>
						<Line from={{x: 0, y: spacing * 9}} to={{x: width, y: spacing * 9}} color={white} width={2}/>
						<Line from={{x: 0, y: spacing * 12}} to={{x: width, y: spacing * 12}} color={white} width={2}/>
						<Line from={{x: 0, y: spacing * 15}} to={{x: width, y: spacing * 15}} color={white} width={2}/>
					</Translate>
				)}
		</DayWrapper>
	)
};
