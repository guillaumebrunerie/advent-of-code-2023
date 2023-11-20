import { AbsoluteFill } from "remotion";

export type Point = {
	x: number;
	y: number;
};

export const Line = ({
	from,
	to,
	color = "#999",
	width = 5,
}: {
	from: Point;
	to: Point;
	color?: string;
	width?: number;
}) => {
	const deltaX = to.x - from.x;
	const deltaY = to.y - from.y;
	const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	const angle = Math.atan2(deltaY, deltaX);
	return (
		<AbsoluteFill
			style={{
				width: distance,
				height: width,
				background: color,
				left: `${(from.x + to.x) / 2}px`,
				top: `${(from.y + to.y) / 2}px`,
				transform: `translate(-50%, -50%) rotate(${angle}rad)`,
			}}
		/>
	);
};
