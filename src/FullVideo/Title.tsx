import { Wrapper } from "../common/Wrapper"

export const Title = ({title}: {title: string}) => {
	return (
		<Wrapper>
			<div style={{
				position: "absolute",
				right: 0,
				bottom: -1,
				fontSize: "28pt",
				color: "rgb(204,204,204)",
				backgroundColor: "#10101a",
				padding: "0 4px",
				border: "2px solid #333340",
			}}>
				{title}
			</div>
		</Wrapper>
	)
}
