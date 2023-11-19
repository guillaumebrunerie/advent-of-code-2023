import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";

export const InitialFlash = () => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();
	const opacity = interpolate(frame / fps, [0, 1], [1, 0], {
		easing: Easing.out(Easing.cubic),
	});
	return <AbsoluteFill style={{ backgroundColor: "#AAA", opacity }} />;
};
