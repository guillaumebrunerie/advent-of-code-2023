import {
	AbsoluteFill,
	Audio,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { clamp } from "../constants";
import { Wrapper } from "../common/Wrapper";
import { InitialFlash } from "../common/Flashes";

export const Outro = () => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const fadeOut = interpolate(
		frame / fps % 8,
		[5.5, 6],
		[1, 0],
		clamp,
	);

	const opacity = fadeOut;

	return (
		<Wrapper>
			<AbsoluteFill
				style={{
					color: "#ffffff",
					textShadow: "0 0 10px #ffffff",
					fontSize: 80,
					fontWeight: 300,
					display: "grid",
					alignItems: "center",
					justifyItems: "center",
					padding: "200px 0",
					opacity,
				}}
			>
				Thank you for watching!
			</AbsoluteFill>
			{false && (
				<AbsoluteFill
					style={{
						color: "#CCC",
						fontSize: 60,
						fontWeight: 300,
						textAlign: "center",
						top: "650px",
						opacity,
					}}
				>
	(day 25 is coming soon)
				</AbsoluteFill>
			)}
			{false && <Audio src={staticFile("Outro.wav")}/>}
			<InitialFlash/>
		</Wrapper>
	);
};
