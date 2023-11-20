import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const NotImplementedYet = ({ day }: { day: number }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: "black",
				color: "#AAA",
				fontSize: 50,
				display: "grid",
				alignItems: "center",
				justifyItems: "center",
			}}
		>
			(visualization for day {day}, frame {frame}/{durationInFrames})
		</AbsoluteFill>
	);
};
