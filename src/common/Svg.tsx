import { CSSProperties, ReactNode } from "react";
import { height, width } from "../constants";

export const Svg = ({w = width, h = height, style, children}: {w?: number, h?: number, style?: CSSProperties, children: ReactNode}) => {
	return (
		<svg style={{
			position: "absolute",
			fill: "none",
			...style,
		}} viewBox={`0 0 ${w} ${h}`}>
			{children}
		</svg>
	)
};
