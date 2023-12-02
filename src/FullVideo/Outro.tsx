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
import { Background } from "../common/Background";

export const Outro = () => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const fadeOut = interpolate(
		frame / fps,
		[5.5, 6],
		[1, 0],
		clamp,
	);

	const opacity = fadeOut;

	return (
		<Wrapper>
			<Background/>
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
			<Audio src={staticFile("Outro.wav")}/>
			<InitialFlash/>
		</Wrapper>
	);
};
