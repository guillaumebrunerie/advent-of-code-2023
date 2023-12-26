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
import { FullAudio } from "./Audio/FullAudio";
import { Day21Helper } from "./Day21/Day21";
import { Day24 } from "./Day24/Day24";
import { Day22 } from "./Day22/Day22";
import { Intro } from "./FullVideo/Intro";

export const RemotionRoot = () => {
	return (
		<>
			{false && (
				<Composition
					id="Test"
					component={Test}
					durationInFrames={fps}
					fps={fps}
					width={width}
					height={height}
				/>
			)}
			<Composition
				id="Intro"
				component={Intro}
				durationInFrames={introDuration * fps}
				fps={fps}
				width={width}
				height={height}
			/>
			{allDays.map(({ Day, day, fullDuration }, i) => (
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
					calculateMetadata={({ props }) => {
						return {
							durationInFrames: props.dayDuration * fps,
							props,
						};
					}}
					fps={fps}
					width={width}
					height={height}
				/>
			))}
			<Composition
				id={`Day22WithProps`}
				component={Day22}
				schema={z.object({
					dayDuration: z.number(),
					from: z.number(),
					to: z.number(),
				})}
				defaultProps={{
					dayDuration: 16,
					from: 100,
					to: 150,
				}}
				calculateMetadata={({ props }) => {
					return { durationInFrames: props.dayDuration * fps, props };
				}}
				fps={fps}
				width={width}
				height={height}
			/>
			<Composition
				id={`Day24WithProps`}
				component={Day24}
				schema={z.object({
					dayDuration: z.number(),
					alpha: z.number(),
					theta: z.number(),
				})}
				defaultProps={{
					dayDuration: 16,
					alpha: 0,
					theta: 0,
				}}
				calculateMetadata={({ props }) => {
					return { durationInFrames: props.dayDuration * fps, props };
				}}
				fps={fps}
				width={width}
				height={height}
			/>
			<Composition
				id={`Day21Helper`}
				component={Day21Helper}
				schema={z.object({
					epsX: z.number(),
					epsY: z.number(),
					single: z.optional(z.boolean()),
				})}
				defaultProps={{ epsX: 0, epsY: -1 }}
				calculateMetadata={({ props }) => {
					return { durationInFrames: 16 * fps, props };
				}}
				fps={fps}
				width={131 * 8}
				height={131 * 8}
			/>
			<Composition
				id="FullVideo"
				component={FullVideo}
				durationInFrames={
					(introDuration +
						dayDuration * allDays.length) *
					fps
				}
				fps={fps}
				width={width}
				height={height}
			/>
			<Composition
				id="FullAudio"
				component={FullAudio}
				durationInFrames={
					(introDuration + dayDuration * 1) * fps
				}
				fps={fps}
				width={width}
				height={height}
			/>
		</>
	);
};
