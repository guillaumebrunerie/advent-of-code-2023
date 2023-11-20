import type { ReactNode } from "react";

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
		<div style={{ transform: `scale(${sx},${sy})` }}>
			{children}
		</div>
	);
};
