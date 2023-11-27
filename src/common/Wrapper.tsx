import { fontFamily } from "../constants"

export const Wrapper = ({children}: {children: React.ReactNode}) => {
	return (
		<div style={{
			fontFamily,
		}}>
			{children}
		</div>
	)
}
