import { Sequence, useVideoConfig } from "remotion";
import { allDays } from "../AllDays";
import { dayDuration, introDuration, outroDuration } from "../constants";
import { Outro } from "./Outro";
import { InitialFlash } from "./InitialFlash";
import { Intro } from "./Intro";

export const clamp = {
	extrapolateLeft: "clamp",
	extrapolateRight: "clamp",
} as const;

export const FullVideo = () => {
	const { fps } = useVideoConfig();
	return (
		<>
			<Sequence durationInFrames={introDuration * fps}>
				<Intro />
			</Sequence>
			{allDays.map((Day, i) => (
				<Sequence
					from={(introDuration + i * dayDuration) * fps}
					durationInFrames={dayDuration * fps}
				>
					<Day />
					<InitialFlash />
				</Sequence>
			))}
			<Sequence
				from={(introDuration + allDays.length * dayDuration) * fps}
				durationInFrames={outroDuration * fps}
			>
				<Outro />
				<InitialFlash />
			</Sequence>
		</>
	);
};
