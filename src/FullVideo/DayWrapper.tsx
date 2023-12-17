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
	titleOpacity?: number,
	style?: CSSProperties,
};

const enableInterFlash = true;
const enableSound = false;

export const DayWrapper = ({day, title, dayDuration, children, style, titleOpacity}: DayWrapperProps) => {
	const frame = useCurrentFrame();
	const progress = frame / (fps * dayDuration);
	return (
		<Wrapper style={style}>
			<Background />
			{children}
			<Title title={`Day ${day}: ${title}`} progress={progress} opacity={titleOpacity}/>
			<MidFlash dayDuration={dayDuration}/>
			{enableInterFlash && (
				<>
					<InitialFlash />
					<FinalFlash dayDuration={dayDuration} />
				</>
			)}
			{enableSound && Array(dayDuration / 16).fill(null).map((_, i) => (
				<Sequence key={i} from={fps * i * 16}>
					<Audio src={staticFile(`Day${day}.wav`)}/>
				</Sequence>
			))}
		</Wrapper>
	);
};
