import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { introDuration } from "../constants";
import { clamp } from "./FullVideo";

export const Outro = () => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const fadeOut = interpolate(
		frame / fps,
		[introDuration - 1, introDuration],
		[1, 0],
		clamp,
	);

	const opacity = fadeOut;

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
			<div style={{ opacity }}>The end</div>
		</AbsoluteFill>
	);
};
