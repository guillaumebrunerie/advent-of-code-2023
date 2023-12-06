import { height, width } from "../constants";
import { CSSProperties } from "react";

export const Path = ({d, style}: {d: string, style: CSSProperties}) => {
	return (
		<svg style={{
			position: "absolute",
			fill: "none",
			...style,
		}} viewBox={`0 0 ${width} ${height}`}>
			<path d={d}/>
		</svg>
	)
};
