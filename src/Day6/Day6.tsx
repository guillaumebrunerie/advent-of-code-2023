import { Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp, fps, height, width } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Path } from "../common/Path";
import { Dot } from "../common/Dot";

const dataPart1 = [
	{time: 41, distance: 249},
	{time: 77, distance: 1362},
	{time: 70, distance: 1127},
	{time: 96, distance: 1011},
];

const dataPart2 = {
	time: 41777096, distance: 249136211271011,
};

export const Day6 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;

	const part2Lines = 2000;
	const data = isPart1 ? dataPart1[Math.floor(time / 2)] : {
		time: part2Lines,
		distance: dataPart2.distance / (dataPart2.time ** 2) * (part2Lines ** 2),
	};
	const convertX = (x: number) => 10 + (x / data.time) * (width - 20);
	const convertY = (y: number) => height - (60 + (y / data.time / data.time * 4) * (height - 70));
	const t = isPart1
		? Math.floor(interpolate(time % 2, [0.15, 1.85], [0, data.time], clamp))
		: Math.floor(interpolate(time % 8, [0.15, 7.85], [0, data.time], clamp));

	return (
		<DayWrapper day={6} title="Wait For It" dayDuration={dayDuration}>
			{Array(data.time).fill(null).map((_, i) => {
				const winningFactor = i * (data.time - i) - data.distance;
				const delta = data.distance / 5;
				const options = {...clamp, easing: Easing.poly(1)};
				const red = Math.floor(interpolate(winningFactor, [-delta/2, delta], [220, 0], options));
				const green = Math.floor(interpolate(winningFactor, [-delta/2, delta], [220, 255], options));
				const blue = Math.floor(interpolate(winningFactor, [-delta/2, delta], [220, 0], options));
				const color = `rgb(${red}, ${green}, ${blue})`;
				return i < t && <Path key={i} d={`M ${convertX(0)} ${convertY(0)} L ${convertX(i)} ${convertY(0)} L ${convertX(data.time)} ${convertY(i * (data.time - i))}`} style={{stroke: color, strokeWidth: 200 / data.time}}/>
			})}
			<Dot c={{x: convertX(data.time), y: convertY(data.distance)}} r={10} style={{backgroundColor: "#00CC00"}}/>
		</DayWrapper>
	);
};
