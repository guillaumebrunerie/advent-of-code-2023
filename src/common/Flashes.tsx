import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { white, clamp, attackDuration } from "../constants";

export const InitialFlash = () => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();
	const opacity = interpolate(frame / fps, [0, 1], [1, 0], {
		...clamp,
		easing: Easing.out(Easing.cubic),
	});
	return <AbsoluteFill style={{ backgroundColor: white, opacity }} />;
};

export const FinalFlash = ({dayDuration}: {dayDuration: number}) => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();
	const opacity = interpolate(frame / fps, [dayDuration - attackDuration, dayDuration], [0, 1], {
		...clamp,
	});
	return <AbsoluteFill style={{ backgroundColor: white, opacity }} />;
};

export const MidFlash = ({dayDuration}: {dayDuration: number}) => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();
	const opacity = interpolate(frame / fps, [dayDuration / 2 - attackDuration, dayDuration / 2], [0, 1], {
		...clamp,
	}) * interpolate(frame / fps, [dayDuration / 2, dayDuration / 2 + 1], [1, 0], {
		...clamp,
		easing: Easing.out(Easing.cubic),
	}) * 0.5;
	return <AbsoluteFill style={{ backgroundColor: white, opacity }} />;
};
