import { CSSProperties, useMemo } from "react"
import { fontFamily, white } from "../constants"

export const Wrapper = ({children, style}: {children: React.ReactNode, style?: CSSProperties}) => {
	const newStyle = useMemo(() => ({
		fontFamily,
		color: white,
		...style,
	}), [style]);
	return (
		<div style={newStyle}>
			{children}
		</div>
	)
}
