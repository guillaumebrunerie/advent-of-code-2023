import { CSSProperties } from "react";
import { AbsoluteFill } from "remotion";

export const Dot = ({
	c,
	r,
	borderRadius = r,
	style,
}: {
	c: {x: number, y: number};
	r: number;
	borderRadius?: number,
	style: CSSProperties;
}) => {
	return (
		<AbsoluteFill
			style={{
				width: r * 2,
				height: r * 2,
				borderRadius,
				left: `${c.x}px`,
				top: `${c.y}px`,
				transform: `translate(-50%, -50%)`,
				...style,
			}}
		/>
	);
};
