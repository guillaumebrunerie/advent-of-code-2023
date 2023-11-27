import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily, white } from "../constants";
import { DayWrapper } from "../FullVideo/DayWrapper";

export const NotImplementedYet = ({ day }: { day: number }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	return (
		<DayWrapper day={day} title="TODO">
			<AbsoluteFill
				style={{
					color: white,
					fontSize: 50,
					display: "grid",
					alignItems: "center",
					justifyItems: "center",
					fontFamily,
				}}
			>
	(visualization for day {day}, frame {frame}/{durationInFrames})
			</AbsoluteFill>
		</DayWrapper>
	);
};
