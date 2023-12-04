import { CSSProperties } from "react";
import { AbsoluteFill } from "remotion";

export const Rectangle = ({
	x,
	y,
	w,
	h,
	style,
}: {
	x: number,
	y: number,
	w: number,
	h: number,
	style?: CSSProperties,
}) => {
	return (
		<AbsoluteFill
			style={{
				width: w,
				height: h,
				left: `${x}px`,
				top: `${y}px`,
				...style,
			}}
		/>
	);
};
