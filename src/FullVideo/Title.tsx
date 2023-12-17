import { Wrapper } from "../common/Wrapper"

export const Title = ({title, progress, opacity = 1}: {title: string, progress: number, opacity?: number}) => {
	return (
		<Wrapper>
			<div style={{
				position: "absolute",
				right: "0",
				bottom: -1,
				fontSize: "28pt",
				fontWeight:300,
				color: "rgb(204,204,204)",
				backgroundColor: "#10101a",
				padding: "0 4px",
				border: "2px solid #333340",
				opacity,
			}}>
				<div style={{
					position: "absolute",
					left: 0,
					top: 0,
					backgroundColor: "#999",
					opacity: 0.2,
					width: `${progress * 100}%`,
					height: "100%",
				}}/>
				{title}
			</div>
		</Wrapper>
	)
};
