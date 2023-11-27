import { AbsoluteFill } from "remotion";
import { black } from "../constants";

export const Background = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: black,
				height: "101%",
			}}
		/>
	);
};
