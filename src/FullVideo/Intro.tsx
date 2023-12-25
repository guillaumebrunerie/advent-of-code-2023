import {
	AbsoluteFill,
	Audio,
	Sequence,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { clamp, introDuration } from "../constants";
import { Wrapper } from "../common/Wrapper";
import { FinalFlash } from "../common/Flashes";

export const Intro = () => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const fadeOut = 1;

	const fadeIn = interpolate(frame / fps, [1.5, 2], [0, 1], clamp);

	const fadeIn2 = interpolate(frame / fps, [3.5, 4], [0, 1], clamp);

	const opacity = fadeIn * fadeOut;
	const opacity2 = fadeIn2 * fadeOut;

	return (
		<Wrapper>
			<AbsoluteFill
				style={{
					backgroundColor: "#0F0F23",
					fontSize: 70,
					fontWeight: 300,
					display: "grid",
					alignItems: "center",
					justifyItems: "center",
					color: "#00CC00",
					padding: "200px 0",
				}}
			>
				<div style={{
					opacity,
					textShadow: "0 0 4px #00cc00, 0 0 10px #00cc00",
				}}>Advent of code 2023</div>
				<div style={{
					color: "#CCCCCC",
					opacity: opacity2,
				}}>
	Visualizations by{" "}
					<span style={{
						color: "#FFFFFF",
						textShadow: "0 0 10px #ffffff",
					}}>
						Guillaume Brunerie
					</span>
				</div>
			</AbsoluteFill>
			<Sequence from={2 * fps}>
				{false && <Audio src={staticFile("Intro.wav")}/>}
			</Sequence>
			<FinalFlash dayDuration={introDuration}/>
		</Wrapper>
	);
};
