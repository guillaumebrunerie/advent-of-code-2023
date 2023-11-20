import { Sequence, useVideoConfig } from "remotion";
import { allDays } from "../AllDays";
import { dayDuration, introDuration, outroDuration } from "../constants";
import { Outro } from "./Outro";
import { InitialFlash } from "./InitialFlash";
import { Intro } from "./Intro";
import { Title } from "./Title";

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
			{allDays.map(({Day, title}, i) => (
				<Sequence
					key={i}
					from={(introDuration + i * dayDuration) * fps}
					durationInFrames={dayDuration * fps}
				>
					<Day />
					<Title title={`Day ${i + 1}: ${title}`}/>
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
