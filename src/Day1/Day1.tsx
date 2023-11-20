import { ReactNode } from "react";
import { Line } from "../common/Line";
import { raw } from "./raw";
import { parse } from "./parse";
import "./solve";
import { Translate } from "../common/Translate";
import { Background } from "../common/Background";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { dayDuration } from "../constants";

const Row = ({
	block,
	isSpecial = false,
}: {
	block: number[];
	isSpecial: boolean;
}) => {
	const lines: ReactNode[] = [];
	const scale = 40;
	let x = 2;
	block.forEach((part, i) => {
		lines.push(
			<Line
				key={i}
				from={{ x, y: 0 }}
				to={{ x: x + part / scale, y: 0 }}
				width={8}
				color={isSpecial ? "red" : undefined}
			/>,
		);
		x += part / scale + 10;
	});

	return lines;
};

// const Sweep = () => {
// 	return (
// 		<AbsoluteFill style={{background: "linear-gradient(transparent, white)", height: 40, top: -40}}/>
// 	)
// };

const data = parse(raw);
const spacing = 20;

export const Day1 = () => {
	const frame = useCurrentFrame();
	const {fps, height} = useVideoConfig();

	return (
		<>
			<Background />
			{data.map((block, i) => {
				const dy = i * spacing - frame * 5.05;
				const center = frame / (dayDuration * fps) * height;
				const isSpecial = dy >= center - 10 && dy < center + 10;
				return (
					<Translate
						key={i}
						dy={dy + spacing / 2}
					>
						<Row block={block} isSpecial={isSpecial} />
					</Translate>
				)
			})}
		</>
	);
};
