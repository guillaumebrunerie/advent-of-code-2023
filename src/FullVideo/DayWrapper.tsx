import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";

import { Wrapper } from "../common/Wrapper"
import { Title } from "./Title";
import { InitialFlash, FinalFlash, MidFlash } from "../common/Flashes";
import { Background } from "../common/Background";
import { CSSProperties, ReactNode } from "react";
import { fps } from "../constants";

type DayWrapperProps = {
	day: number,
	title: string,
	dayDuration: number,
	children: ReactNode,
	style?: CSSProperties,
};

export const DayWrapper = ({day, title, dayDuration, children, style}: DayWrapperProps) => {
	const frame = useCurrentFrame();
	const progress = frame / (fps * dayDuration);
	return (
		<Wrapper style={style}>
			<Background />
			{children}
			<Title title={`Day ${day}: ${title}`} progress={progress}/>
			<InitialFlash />
			<MidFlash dayDuration={dayDuration}/>
			<FinalFlash dayDuration={dayDuration} />
			{Array(dayDuration / 16).fill(null).map((_, i) => (
				<Sequence from={fps * i * 16}>
					<Audio src={staticFile(`Day${day}.wav`)}/>
				</Sequence>
			))}
		</Wrapper>
	);
};
