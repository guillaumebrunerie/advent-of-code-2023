import { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";

export const Translate = ({
	dx = 0,
	dy = 0,
	children,
	style,
}: {
	dx?: number,
	dy?: number,
	children: ReactNode,
	style?: CSSProperties,
}) => {
	return (
		<AbsoluteFill style={{
			left: `${dx}px`,
			top: `${dy}px`,
			...style,
		}}>
			{children}
		</AbsoluteFill>
	);
};
