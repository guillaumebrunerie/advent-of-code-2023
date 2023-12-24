import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";

export const Scale = ({
	sx = 1,
	sy = 1,
	children,
}: {
	sx?: number;
	sy?: number;
	children: ReactNode;
}) => {
	return (
		<AbsoluteFill style={{ transform: `scale(${sx},${sy})` }}>
			{children}
		</AbsoluteFill>
	);
};
