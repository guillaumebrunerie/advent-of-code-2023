import { AbsoluteFill, random } from "remotion";

export const Circle = ({
	cx,
	cy,
	r,
	color,
}: {
	cx: number;
	cy: number;
	r: number;
	color: string;
}) => {
	return (
		<AbsoluteFill
			style={{
				width: r,
				height: r,
				borderRadius: random(cx) > 0.5 ? r : 0,
				background: color,
				left: `${cx}px`,
				top: `${cy}px`,
				transform: `translate(-50%, -50%)`,
			}}
		/>
	);
};
