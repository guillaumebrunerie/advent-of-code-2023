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
import { z } from "zod";
import { Test } from "./Test";

export const RemotionRoot = () => {
	return (
		<>
			{false && <Composition
				id="Test"
				component={Test}
				durationInFrames={fps}
				fps={fps}
				width={width}
				height={height}
			/>}
			{allDays.map(({Day, day, fullDuration}, i) => (
				<Composition
					key={i}
					id={`Day${day}`}
					component={Day}
					schema={z.object({
						dayDuration: z.number(),
					})}
					defaultProps={{
						dayDuration: fullDuration,
					}}
					calculateMetadata={({props}) => {
						return {durationInFrames: props.dayDuration * fps, props};
					}}
					fps={fps}
					width={width}
					height={height}
				/>
			))}
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
		</>
	);
};
