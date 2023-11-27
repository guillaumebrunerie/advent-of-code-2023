import { Audio, staticFile } from "remotion";

import { Wrapper } from "../common/Wrapper"
import { Title } from "./Title";
import { InitialFlash, FinalFlash, MidFlash } from "../common/Flashes";
import { dayDuration } from "../constants";
import { Background } from "../common/Background";
import { ReactNode } from "react";

type DayWrapperProps = {
	day: number,
	title: string,
	children: ReactNode,
};

export const DayWrapper = ({day, title, children}: DayWrapperProps) => {
	return (
		<Wrapper>
			<Background />
			{children}
			<Title title={`Day ${day}: ${title}`}/>
			<Audio src={staticFile(`Day${day}.wav`)}/>
			<InitialFlash />
			<MidFlash/>
			<FinalFlash duration={dayDuration} />
		</Wrapper>
	);
};
