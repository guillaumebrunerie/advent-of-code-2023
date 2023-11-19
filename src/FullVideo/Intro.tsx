import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { introDuration } from "../constants";
import { clamp } from "./FullVideo";

export const Intro = () => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const fadeOut = interpolate(
		frame / fps,
		[introDuration - 1, introDuration],
		[1, 0],
		clamp,
	);

	const fadeIn = interpolate(frame / fps, [0.5, 1.5], [0, 1], clamp);

	const fadeIn2 = interpolate(frame / fps, [2.5, 3.5], [0, 1], clamp);

	const opacity = fadeIn * fadeOut;
	const opacity2 = fadeIn2 * fadeOut;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: "black",
				color: "white",
				fontSize: 50,
				display: "grid",
				alignItems: "center",
				justifyItems: "center",
			}}
		>
			<div style={{ opacity }}>Advent of code 2023</div>
			<div style={{ opacity: opacity2 }}>
				A visualization by Guillaume Brunerie
			</div>
		</AbsoluteFill>
	);
};
