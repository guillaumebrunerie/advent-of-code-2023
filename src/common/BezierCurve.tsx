import { Point } from "./Point";
import { height, white, width } from "../constants";

export const BezierCurve = ({
	from,
	fromC,
	toC,
	to,
}: {
	from: Point;
	fromC: Point;
	toC: Point;
	to: Point;
}) => {
	return (
		<svg style={{
			position: "absolute",
			fill: "none",
			stroke: white,
			strokeWidth: "2px",
		}} viewBox={`0 0 ${width} ${height}`}>
			<path d={`M ${from.x} ${from.y} C ${fromC.x} ${fromC.y}, ${toC.x} ${toC.y}, ${to.x} ${to.y}`}/>
		</svg>
	)
};

// For Day 5
export const ExtrudedBezierCurve = ({
	from,
	fromC,
	toC,
	to,
	dx,
}: {
	from: Point;
	fromC: Point;
	toC: Point;
	to: Point;
	dx: number;
}) => {
	return (
		<svg style={{
			position: "absolute",
			fill: "#00FF0088",
			stroke: "none",
			strokeWidth: "0",
		}} viewBox={`0 0 ${width} ${height}`}>
			<path d={`
M ${from.x} ${from.y}
C ${fromC.x} ${fromC.y}, ${toC.x} ${toC.y}, ${to.x} ${to.y}
L ${to.x + dx} ${to.y}
C ${toC.x + dx} ${toC.y}, ${fromC.x + dx} ${fromC.y}, ${from.x + dx} ${from.y}
L ${from.x} ${from.y}
`}/>
		</svg>
	)
};
