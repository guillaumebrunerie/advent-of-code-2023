import { Composition } from "remotion";
import { FullVideo } from "./FullVideo/FullVideo";
import { allDays } from "./AllDays";
import {
	dayDuration,
	fps,
	height,
	introDuration,
	outroDuration,
	width,
} from "./constants";

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="FullVideo"
				component={FullVideo}
				durationInFrames={
					(introDuration +
						dayDuration * allDays.length +
						outroDuration) *
					fps
				}
				fps={fps}
				width={width}
				height={height}
			/>
			{allDays.map(({Day}, i) => (
				<Composition
					key={i}
					id={`Day${i + 1}`}
					component={Day}
					durationInFrames={dayDuration * fps}
					fps={fps}
					width={width}
					height={height}
				/>
			))}
		</>
	);
};
