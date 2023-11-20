import { parse } from "./parse";
import { raw } from "./raw";

export const solve1 = (data: number[][]) => {
	return Math.max(...data.map((food) => food.reduce((a, b) => a + b)));
};

console.log(`The solution for day 1 is ${solve1(parse(raw))}`);
