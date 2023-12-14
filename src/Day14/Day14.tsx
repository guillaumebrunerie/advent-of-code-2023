import { NotImplementedYet } from "../common/NotImplementedYet";
import { Point } from "../common/Point";
import { raw } from "./raw";

const solve = () => {
	const roundBlocks: Point[] = [];
	const squareBlocks: Point[] = [];
	const data = raw.split("\n").map(line => line.split(""));
	const height = data.length;
	const width = data[0].length;
	data.forEach((line, y) => line.forEach((char, x) => {
		if (char === "O") {
			roundBlocks.push({x, y});
		} else if (char === "#") {
			squareBlocks.push({x, y});
		}
	}));

	const isFree = (x: number, y: number) =>
		x >= 0 && x < width && y >= 0 && y < height && data[y][x] === ".";

	const tiltUp = () => {
		let didSomething = true;
		while (didSomething) {
			didSomething = false;
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					if (data[y][x] === "O" && isFree(x, y - 1)) {
						data[y][x] = ".";
						data[y - 1][x] = "O";
						didSomething = true;
					}
				}
			}
		}
	};

	const tiltLeft = () => {
		let didSomething = true;
		while (didSomething) {
			didSomething = false;
			for (let x = 0; x < width; x++) {
				for (let y = 0; y < height; y++) {
					if (data[y][x] === "O" && isFree(x - 1, y)) {
						data[y][x] = ".";
						data[y][x - 1] = "O";
						didSomething = true;
					}
				}
			}
		}
	};

	const tiltDown = () => {
		let didSomething = true;
		while (didSomething) {
			didSomething = false;
			for (let y = height - 1; y >= 0; y--) {
				for (let x = 0; x < width; x++) {
					if (data[y][x] === "O" && isFree(x, y + 1)) {
						data[y][x] = ".";
						data[y + 1][x] = "O";
						didSomething = true;
					}
				}
			}
		}
	};

	const tiltRight = () => {
		let didSomething = true;
		while (didSomething) {
			didSomething = false;
			for (let x = width - 1; x >= 0; x--) {
				for (let y = 0; y < height; y++) {
					if (data[y][x] === "O" && isFree(x + 1, y)) {
						data[y][x] = ".";
						data[y][x + 1] = "O";
						didSomething = true;
					}
				}
			}
		}
	};

	const cycle = () => {
		tiltUp();
		tiltLeft();
		tiltDown();
		tiltRight();
	};

	const score = () => {
		let total = 0;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				if (data[y][x] === "O") {
					total += height - y;
				}
			}
		}
		return total;
	};

	tiltUp();
	console.log(`Day 14, part 1: ${score()}`);

	const toString = () => data.map(line => line.join("")).join("\n");

	const cache: {key: string, i: number, score: number}[] = [];
	cycle();
	let i = 1;
	for (;;) {
		const key = toString();
		const cached = cache.find(c => c.key === key);
		if (cached) {
			const period = i - cached.i;
			const phase = 1000000000 % period;
			const result = cache.find(c => c.i >= cached.i && c.i % period === phase);
			if (!result) {
				throw new Error("Not found")
			}
			console.log(`Day 14, part 2: ${result.score}`);
			break;
		}
		cache.push({key, i, score: score()});
		cycle();
		i++;
	}
};

solve();

export const Day14 = () => {
	return <NotImplementedYet day={14} />;
};
