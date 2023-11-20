import { ReactNode } from "react";
import { AbsoluteFill } from "remotion";

export const Translate = ({
	dx = 0,
	dy = 0,
	children,
}: {
	dx?: number;
	dy?: number;
	children: ReactNode;
}) => {
	return (
		<AbsoluteFill style={{ left: `${dx}px`, top: `${dy}px` }}>
			{children}
		</AbsoluteFill>
	);
};
