import { CSSProperties, ReactNode } from "react";
import { height, width } from "../constants";

export const Svg = ({style, children}: {style?: CSSProperties, children: ReactNode}) => {
	return (
		<svg style={{
			position: "absolute",
			fill: "none",
			...style,
		}} viewBox={`0 0 ${width} ${height}`}>
			{children}
		</svg>
	)
};
