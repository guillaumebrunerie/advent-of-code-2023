import { interpolate, useCurrentFrame } from "remotion";
import { raw } from "./raw";
import { clamp, fps, height, width } from "../constants";
import { memo, useMemo } from "react";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Translate } from "../common/Translate";
import { Rectangle } from "../common/Rectangle";

type CardT = {
	winningNumbers: {number: number, isWinning: boolean}[],
	ownNumbers: {number: number, isWinning: boolean}[],
};

const solve = () => {
	const cards = raw.split("\n").map(line => {
		const [str1, str2] = line.split(": ")[1].split(" | ");
		const winningNs = str1.split(" ").flatMap(str => str.length === 0 ? [] : [Number(str)]);
		const ownNs = str2.split(" ").flatMap(str => str.length === 0 ? [] : [Number(str)]);
		const winningNumbers = str1.split(" ").flatMap(str => str.length === 0 ? [] : [{
			number: Number(str),
			isWinning: ownNs.includes(Number(str)),
		}]);
		const ownNumbers = str2.split(" ").flatMap(str => str.length === 0 ? [] : [{
			number: Number(str),
			isWinning: winningNs.includes(Number(str)),
		}]);
		return {winningNumbers, ownNumbers};
	});

	let win = 0;
	cards.forEach(({ownNumbers}) => {
		const wins = ownNumbers.filter(n => n.isWinning).length;
		if (wins > 0) {
			win += 2 ** (wins - 1);
		}
	});
	console.log("Day 4, part 1:", win);

	const cardAmounts = cards.map(() => 1);
	const cardAmountsOverTime = [[...cardAmounts]];
	cards.forEach(({ownNumbers}, i) => {
		const wins = ownNumbers.filter(n => n.isWinning).length;
		const count = cardAmounts[i];
		if (wins > 0) {
			for (let k = 0; k < wins; k++) {
				const j = i + k + 1;
				if (j >= cardAmounts.length) {
					continue;
				}
				cardAmounts[j] += count;
			}
		}
		cardAmountsOverTime.push([...cardAmounts]);
	});
	let sum = 0;
	for (const amount of cardAmounts) {
		sum += amount;
	}
	console.log("Day4, part 2:", sum);

	return {cards, cardAmountsOverTime};
};

const firstSpacingX = 50;
const sideSpacingX = 635;
const spacingX = 53;
const spacingY = 40;

const color = "#00CC00";
const styles = {
	highlighted: {
		color: "#FFFFFF",
		textShadow: "0 0 10px #ffffff",
		textAlign: "right" as const,
	},
	base: {
		textAlign: "right" as const,
	},
	green: {
		color,
		textShadow: `0 0 4px ${color}, 0 0 10px ${color}`,
		textAlign: "right" as const,
	},
	faded: {
		color: "#666",
		textAlign: "right" as const,
	}
};

const styles2 = {
	greenH: {
		backgroundColor: color,
		boxShadow: `0 0 4px ${color}, 0 0 10px ${color}`,
		borderRadius: "3px 3px 0 0",
	},
	green1: {
		backgroundColor: color,
		borderRadius: "3px 3px 0 0",
	},
	green: {
		backgroundColor: "#006600",
		borderRadius: "3px 3px 0 0",
	},
	white: {
		backgroundColor: "#BBB",
		borderRadius: "3px 3px 0 0",
	},
	whiteH: {
		backgroundColor: "#FFFFFF",
		boxShadow: `0 0 4px #FFFFFF, 0 0 10px #FFFFFF`,
		borderRadius: "3px 3px 0 0",
	},
};

const Card = memo(({card, isHighlighted}: {card: CardT, isHighlighted: boolean}) => {
	const {winningNumbers, ownNumbers} = card;
	return (
		<div>
			{winningNumbers.map(({number}, i) => (
				<Translate key={i} dx={firstSpacingX + i * spacingX - width} style={isHighlighted ? styles.highlighted : styles.base}>
					{number}
				</Translate>
			))}
			{ownNumbers.map(({number, isWinning}, i) => (
				<Translate key={i} dx={sideSpacingX + i * spacingX - width} style={isHighlighted ? (isWinning ? styles.green : styles.base) : styles.faded}>
					{number}
				</Translate>
			))}
		</div>
	)
});

const style = {
	fontSize: 32,
	fontWeight: 400,
};

export const Day4 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const isPart2 = !isPart1;
	const {cards, cardAmountsOverTime} = useMemo(solve, []);
	const block = Math.floor(time);
	const stepForPart1 = Math.floor(interpolate(
		time % 1,
		[0.15, 0.85],
		[0, 24],
		clamp
	));
	const stepForPart2 = Math.floor(interpolate(
		time,
		[dayDuration / 2 + 0.15, dayDuration - 0.15],
		[0, cardAmountsOverTime.length - 1],
		clamp,
	));
	const processedCards = isPart1 ? Math.floor(interpolate(time, [0, dayDuration / 2], [0, cards.length])) : cards.length;
	return (
		<DayWrapper day={4} title="Scratchcards" dayDuration={dayDuration} style={style}>
			{cards.slice(0, processedCards).map((card, i) => (
				<Rectangle
					key={i}
					x={10 + i * (width - 20) / cards.length}
					y={height - 110}
					w={width / cards.length / 2}
					h={card.ownNumbers.filter(n => n.isWinning).length * 10}
					style={isPart1 ? styles2.green1 : i < stepForPart2 ? styles2.green : styles2.greenH}
				/>
			))}
			{isPart2 && cardAmountsOverTime[stepForPart2].map((amount, i) => (
				<Rectangle
					key={i}
					x={10 + i * (width - 20) / cards.length}
					y={height - 115 - Math.cbrt(amount) / 0.11}
					w={width / cards.length / 2}
					h={Math.cbrt(amount) / 0.11}
					style={i < stepForPart2 ? styles2.white : styles2.whiteH}
				/>
			))}
			{isPart1 && cards.slice(block * 24, (block + 1) * 24).map((card, i) => (
				<Translate key={i} dy={5 + i * spacingY}>
					<Card card={card} isHighlighted={i < stepForPart1}/>
				</Translate>
			))}
		</DayWrapper>
	)
};
