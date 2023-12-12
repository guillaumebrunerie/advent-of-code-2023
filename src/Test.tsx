import { AbsoluteFill, useCurrentFrame } from "remotion";

export const Test = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: "#008800"}}>
			<span style={{backgroundColor: frame % 2 === 1 ? "red" : "blue"}}>Hello world!</span>
		</AbsoluteFill>
	)
};
