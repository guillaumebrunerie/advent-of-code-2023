import { type ReactNode } from "react";
import { Line } from "../common/Line";
import { raw } from "./raw";
import { parse } from "./parse";
import "./solve";
import { Translate } from "../common/Translate";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { dayDuration, white, red } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";

const Row = ({
	block,
	isSpecial = false,
}: {
	block: number[];
	isSpecial: boolean;
}) => {
	const lines: ReactNode[] = [];
	const scale = 40;
	let x = 2;
	block.forEach((part, i) => {
		lines.push(
			<Line
				key={i}
				from={{ x, y: 0 }}
				to={{ x: x + part / scale, y: 0 }}
				width={8}
				color={isSpecial ? red : white}
			/>,
		);
		x += part / scale + 10;
	});

	return lines;
};

const data = parse(raw);
const spacing = 20;

export const Day1 = () => {
	const frame = useCurrentFrame();
	const {fps, height} = useVideoConfig();

	return (
		<DayWrapper day={1} title="Calorie counting" dayDuration={dayDuration}>
			{data.map((block, i) => {
				const dy = i * spacing - interpolate(frame, [0, dayDuration * fps], [-spacing, data.length * spacing - height]);
				const nextTo = (ny: number) => Math.round((dy - ny * height) / spacing) === 0;
				const dt = frame / (dayDuration * fps);
				let isSpecial = nextTo(dt * 2);
				isSpecial ||= nextTo((dt - 0.5) * 2)
				isSpecial ||= nextTo(((dt - 0.5) * 4) % 1)
				isSpecial ||= nextTo(((dt - 0.5) * 6) % 1)
				return (
					<Translate
						key={i}
						dy={dy}
					>
						<Row block={block} isSpecial={isSpecial} />
					</Translate>
				)
			})}
		</DayWrapper>
	)
};
