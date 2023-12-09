import { useMemo } from "react";
import { raw } from "./raw";
import { clamp, fps, height, width } from "../constants";
import { interpolate, useCurrentFrame } from "remotion";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Translate } from "../common/Translate";

const combinations1 = ["5", "41", "32", "311", "221", "2111", "11111"];
const cards1 = "AKQJT98765432".split("");

const combinations2 = [
	["0/5", "1/4", "2/3", "3/2", "4/1", "5/"],
	["0/41", "1/31", "2/21", "3/11"],
	["0/32", "1/22"],
	["0/311", "1/211", "2/111"],
	["0/221"],
	["0/2111", "1/1111"],
	["0/11111"],
];
const cards2 = "AKQT98765432J".split("");

const handType1 = (hand: string[]) => {
	const amounts = cards1.map(card => hand.filter(c => c === card).length).filter(a => a !== 0).sort((a, b) => b - a).join("");
	const type = combinations1.indexOf(amounts);
	if (type === -1) {
		throw new Error("Invalid combination");
	}
	return type;
}

const solve = (lines: string[]) => {
	const hands = lines.map(line => {
		const [part1, part2] = line.split(" ");
		const hand = part1.split("");
		const score = Number(part2);
		return {hand, score};
	});

	const value1 = (card: string) => cards1.indexOf(card);

	const compareHands1 = (hand1: string[], hand2: string[]) => (
		(handType1(hand2) - handType1(hand1))
			|| (value1(hand2[0]) - value1(hand1[0]))
			|| (value1(hand2[1]) - value1(hand1[1]))
			|| (value1(hand2[2]) - value1(hand1[2]))
			|| (value1(hand2[3]) - value1(hand1[3]))
			|| (value1(hand2[4]) - value1(hand1[4]))
	);

	const sortedHands1 = hands.toSorted((a, b) => compareHands1(a.hand, b.hand));
	let result1 = 0;
	sortedHands1.forEach(({score}, i) => {
		result1 += score * (i + 1);
	})
	console.log("Day 7, part 1: ", result1);

	// Part 2

	const handType2 = (hand: string[]) => {
		const js = hand.filter(c => c === "J").length
		const amounts = cards2.slice(0, -1).map(card => hand.filter(c => c === card).length).filter(a => a !== 0).sort((a, b) => b - a).join("");
		const str = `${js}/${amounts}`;
		const type = combinations2.findIndex((value) => value.includes(str));
		if (type === -1) {
			throw new Error("Invalid combination");
		}
		return type;
	}

	const value2 = (card: string) => cards2.indexOf(card);

	const compareHands2 = (hand1: string[], hand2: string[]) => (
		(handType2(hand2) - handType2(hand1))
			|| (value2(hand2[0]) - value2(hand1[0]))
			|| (value2(hand2[1]) - value2(hand1[1]))
			|| (value2(hand2[2]) - value2(hand1[2]))
			|| (value2(hand2[3]) - value2(hand1[3]))
			|| (value2(hand2[4]) - value2(hand1[4]))
	);

	const sortedHands2 = hands.toSorted((a, b) => compareHands2(a.hand, b.hand));
	let result2 = 0;
	sortedHands2.forEach(({score}, i) => {
		result2 += score * (i + 1);
	});
	console.log("Day 7, part 2: ", result2);

	return {hands, sortedHands1, sortedHands2};
};

const allLines = raw.split("\n");

const spacingX = width / 10;
const spacingY = height / 20;

const colors = {
	"5": [0, 255, 0],
	"4": [100, 200, 0],
	"3": [200, 255, 100],
	"2": [200, 200, 100],
	"1": [170, 170, 170],
};

const Hand = ({isPart1, hand, t}: {isPart1: boolean, hand: string[], t: number}) => {
	return (
		<span>
			{hand.map((char, i) => {
				const count1 = hand.filter(c => c === char).length;
				const joker = hand.filter(c => c !== "J").toSorted((c1, c2) => hand.filter(c => c === c2).length - hand.filter(c => c === c1).length)[0];
				const count2 = hand.filter(c => c === char || (c === "J" && char === joker) || (c === joker && char === "J")).length;
				const colorFrom = (char === "J" && !isPart1) ? [255, 0, 0] : (isPart1 ? [170, 170, 170] : colors[`${count1}`]);
				const colorTo = (false && char === "J" && !isPart1) ? [255, 0, 0] : colors[`${isPart1 ? count1 : count2}`];
				const textShadow = (char === "J" && !isPart1) ? "0 0 7px #FFFFFF" : "";
				const red = Math.floor(interpolate(t, [0, 1], [colorFrom[0], colorTo[0]]));
				const green = Math.floor(interpolate(t, [0, 1], [colorFrom[1], colorTo[1]]));
				const blue = Math.floor(interpolate(t, [0, 1], [colorFrom[2], colorTo[2]]));
				const color = `rgb(${red}, ${green}, ${blue})`;
				return <span key={i} style={{color// , textShadow
				}}>{char}</span>
			})}
		</span>
	);
};

export const Day7 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const start = (Math.floor(time / 4) * 200) % 1000;
	const {hands, sortedHands1, sortedHands2} = useMemo(() => solve(allLines.slice(start).slice(0, 200)), [start]);

	const lt = (time % 4) / 4;

	const from = isPart1 ? hands : sortedHands1.toReversed();
	const to = isPart1 ? sortedHands1.toReversed() : sortedHands2.toReversed();

	const opacity = interpolate(lt, [0.9, 0.95], [1, 0], clamp);

	return (
		<DayWrapper day={7} title="Camel Cards" dayDuration={dayDuration} style={{
			fontSize: 30,
			textAlign: "center",
		}}>
			{from.map((data, i) => {
				const {hand} = data;
				const j = to.indexOf(data);
				const end = interpolate(j, [0, hands.length], [0.4, 0.7]);
				const interval = [0.05, end];
				const x = interpolate(lt, interval, [Math.floor(i / 20), Math.floor(j / 20)], clamp);
				const y = interpolate(lt, interval, [i % 20, j % 20], clamp);
				return (
					<Translate key={i} dx={x * spacingX - 900} dy={y * spacingY} style={{opacity}}>
						<Hand isPart1={isPart1} hand={hand} t={interpolate(lt, interval, [0, 1], clamp)}/>
					</Translate>
				);
			})}
		</DayWrapper>
	);
};
