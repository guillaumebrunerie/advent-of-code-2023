import { useCurrentFrame } from "remotion";
import { fps } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { useMemo } from "react";
import { NotImplementedYet } from "../common/NotImplementedYet";

const solve = () => {
	
}

export const Day24 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const stuff = useMemo(solve, []);

	return (
		<DayWrapper day={24} title="TODO" dayDuration={dayDuration}>
			<NotImplementedYet day={24} />
		</DayWrapper>
	);
};
