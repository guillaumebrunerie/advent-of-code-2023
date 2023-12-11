import { interpolate, useCurrentFrame } from "remotion";
import { raw } from "./raw";
import { clamp, fps, height, white, width } from "../constants";
import { Fragment, ReactNode, useCallback, useMemo } from "react";
import { DayWrapper } from "../FullVideo/DayWrapper";
import { Dot } from "../common/Dot";
import { Path } from "../common/Path";

const solve = () => {
	const data = raw.split("\n").map(line => line.split(" ").map(Number));
	const newNumber = (data: number[], acc = 0): number => {
		if (data.every(n => n === 0)) {
			return acc;
		}
		return newNumber(data.flatMap((x, i) => i === 0 ? [] : [x - data[i - 1]]), acc + data.at(-1)!);
	};

	let result = 0;
	for (const line of data) {
		result += newNumber(line);
	}
	console.log(`Day 9, part 1: ${result}`);

	const newNumber2 = (data: number[], acc = 0): number => {
		if (data.every(n => n === 0)) {
			return acc;
		}
		return data[0] - newNumber2(data.flatMap((x, i) => i === 0 ? [] : [x - data[i - 1]]));
	};


	let result2 = 0;
	for (const line of data) {
		result2 += newNumber2(line);
	}
	console.log(`Day 9, part 2: ${result2}`);

	const polynomial = (data: number[], coefficients: number[] = []): number[] => {
		if (data.every(n => n === 0)) {
			return coefficients;
		}
		return polynomial(data.flatMap((x, i) => i === 0 ? [] : [x - data[i - 1]]), [...coefficients, data[0]]);
	};
	const makeFunction = (coefficients: number[]) => (x: number) => {
		let result = 0;
		coefficients.forEach((a, i) => {
			result += a * intPow(x, i);
		});
		return result;
	};
	// const makePolynomial = (coefficients: number[]): Polynomial => {
	// 	let result: Polynomial = [];
	// 	coefficients.forEach((a, i) => {
	// 		result = addPoly(result, mulPoly([a], intPowPoly(i)))
	// 	});
	// 	return result;
	// }

	const functions = data.map(line => makeFunction(polynomial(line)));
	// const polynomials = data.map(line => makePolynomial(polynomial(line)));

	return {data, functions};
}

const intPow = (x: number, n: number): number => {
	if (n === 0) {
		return 1;
	}
	return (x - n + 1) * intPow(x, n - 1) / n;
};

// type Rational = {over: number, under: number};
// type Polynomial = number[];

// const addPoly = (p1: Polynomial, p2: Polynomial): Polynomial => {
// 	const degree = Math.max(p1.length, p2.length);
// 	return Array(degree).fill(true).map((_, i) => (p1[i] || 0) + (p2[i] || 0));
// };

// const mulPoly = (p1: Polynomial, p2: Polynomial): Polynomial => {
// 	if (p1.length === 0) {
// 		return [];
// 	}
// 	return addPoly(
// 		p2.map(x => x * p1[0]),
// 		mulPoly(p1.slice(1), [0, ...p2]),
// 	);
// };

// const intPowPoly = (n: number): Polynomial => {
// 	if (n === 0) {
// 		return [1];
// 	}
// 	return mulPoly([(1 - n) / n, 1/n], intPowPoly(n - 1));
// };

// const applyPoly = (p: Polynomial, x: number) => {
// 	let result = 0;
// 	p.forEach((a, i) => {
// 		result += a * (x ** i);
// 	});
// 	return result;
// }

// const polyToString = (p: Polynomial) => {
// 	const exponents = "⁰¹²³⁴⁵⁶⁷⁸⁹";
// 	const strs = [];
// 	p.forEach((a, i) => {
// 		const monomial = i === 0 ? "" : i === 1 ? "x" : `x${exponents[i]}`;
// 		strs.push(`${a.toPrecision(2)}${monomial}`);
// 	});
// 	return strs.toReversed().join(" + ");
// }

export const Day9 = ({dayDuration}: {dayDuration: number}) => {
	const time = useCurrentFrame() / fps;
	const isPart1 = time < dayDuration / 2;
	const {data, functions} = useMemo(solve, []);
	const index = Math.floor(time);
	const points = data[index];
	const convertX = useCallback((x: number) => interpolate(
		x,
		isPart1 ? [0, points.length + 1] : [-1, points.length],
		[20, width - 20],
	), [isPart1, points.length]);
	const convertY = useCallback((y: number) => interpolate(
		y,
		isPart1
			? [Math.min(...points, functions[index](points.length)), Math.max(...points, functions[index](points.length))]
			: [Math.min(...points.slice(0, points.length / 2)), Math.max(...points.slice(0, points.length / 2))],
		[height - 60, 20],
	), [functions, index, isPart1, points]);
	const resolution = 100;
	const iMax = isPart1 ? interpolate((time % 1), [0, 0.85], [0, resolution], clamp) : resolution;
	const iMin = isPart1 ? 0 : interpolate((time % 1), [0, 0.85], [resolution, 0], clamp);
	const background = useMemo((): ReactNode => data.map((points, index) => {
		const resolution = 100;
		const pts = Array(resolution).fill(true).map((_, i) => {
			const x = i / resolution * (points.length + 2) - 1;
			const pt = {
				x: convertX(x),
				y: convertY(functions[index](x)),
			};
			return `L ${pt.x} ${pt.y}`;
		});
		const x = (-1) / resolution * (points.length + 2) - 1;
		const pt = {
			x: convertX(x),
			y: convertY(functions[index](x)),
		};
		return (
			<Fragment key={index}>
				<Path d={`M ${pt.x} ${pt.y} ${pts.join(" ")}`} style={{strokeWidth: 3, stroke: "#FFFFFF0C"}}/>
			</Fragment>
		);
	}), [data, functions, convertX, convertY]);

	const pts = Array(resolution).fill(true).map((_, i) => {
		if (i >= iMax || i <= iMin) {
			return null;
		}
		const x = i / resolution * (points.length + 2) - 1;
		const pt = {
			x: convertX(x),
			y: convertY(functions[index](x)),
		};
		return `L ${pt.x} ${pt.y}`;
	});
	const x = (iMin - 1) / resolution * (points.length + 2) - 1;
	const pt = {
		x: convertX(x),
		y: convertY(functions[index](x)),
	};
	return (
		<DayWrapper day={9} title="Mirage Maintenance" dayDuration={dayDuration}>
			{background}
			<Path d={`M ${pt.x} ${pt.y} ${pts.join(" ")}`} style={{strokeWidth: 3, stroke: "#FFFFFF"}}/>
			{points.map((y, i) => (
				<Dot key={i} c={{x: convertX(i), y: convertY(y)}} r={6} style={{backgroundColor: white}}/>
			))}
			<Dot
				c={{
					x: convertX(isPart1 ? points.length : -1),
					y: convertY(functions[index](isPart1 ? points.length : -1)),
				}}
				r={10}
				style={{
					backgroundColor: "#00CC00",
					boxShadow: `0 0 4px #00CC00, 0 0 10px #00CC00`,
					opacity: interpolate(time % 1, [0.25, 0.75], [0, 1], clamp),
				}}
			/>
		</DayWrapper>
	)
};

			// {data.map((points, index) => {
			// 	return Array(resolution).fill(true).map((_, i) => {
			// 		const x1 = i / resolution * (points.length + 2) - 1;
			// 		const x2 = (i + 1) / resolution * (points.length + 2) - 1;
			// 		const pt = (x: number) => ({
			// 			x: convertX(x),
			// 			y: convertY(functions[index](x)),
			// 		});
			// 		return <Line key={i} from={pt(x1)} to={pt(x2)} width={3} color="white"/>
			// 	});
			// })}
			// {data.map((points) => {
			// 	return points.map((y, i) => (
			// 		<Dot key={i} c={{x: convertX(i), y: convertY(y)}} r={6} style={{backgroundColor: white}}/>
			// 	));
			// })}
