import { CSSProperties, ReactNode, useMemo } from "react";
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
	const newStyle = useMemo(() => ({
		left: `${dx}px`,
		top: `${dy}px`,
		...style,
	}), [dx, dy, style]);
	return (
		<AbsoluteFill style={newStyle}>
			{children}
		</AbsoluteFill>
	);
};
