import { CSSProperties } from "react"
import { fontFamily, white } from "../constants"

export const Wrapper = ({children, style}: {children: React.ReactNode, style?: CSSProperties}) => {
	return (
		<div style={{
			fontFamily,
			color: white,
			...style,
		}}>
			{children}
		</div>
	)
}
