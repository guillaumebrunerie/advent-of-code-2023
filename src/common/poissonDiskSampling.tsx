import { random } from "remotion";

export const poissonDiskSampling = (
	width: number,
	height: number,
	radius: number,
	margin: number,
	seed: string,
) => {
	const firstPoint = {
		x: margin + random(`x,${seed}`) * (width - margin * 2),
		y: margin + random(`y,${seed}`) * (height - margin * 2),
	};
	const points = [firstPoint];
	let activePoints = [firstPoint];
	let i = 0;
	const k = 30;
	while (activePoints.length > 0) {
		const anchor = activePoints[Math.floor(random(`anchor${i},${seed}`) * activePoints.length)];
		let found = false;
		for (let j = 0; j < k; j++) {
			i++;
			const r = random(`r${i},${seed}`) * radius + radius;
			const angle = random(`a${i},${seed}`) * 2 * Math.PI;
			const point = {
				x: anchor.x + r * Math.cos(angle),
				y: anchor.y + r * Math.sin(angle),
			};
			const isValid = point.x > margin && point.x < width - margin && point.y > margin && point.y < height - margin &&
				points.every(pt => {
					const dx = pt.x - point.x;
					const dy = pt.y - point.y;
					return Math.abs(dx) > radius || Math.abs(dy) > radius || dx * dx + dy * dy > radius * radius
				});
			if (isValid) {
				points.push(point);
				activePoints.push(point);
				found = true;
				break;
			}
		}
		if (!found) {
			activePoints = activePoints.filter(pt => pt !== anchor);
		}
	}
	return points;
};

/*
// const testPoissonSampling = () => {
// 	for (const radius of [390, 420, 450, 490]) {
// 		let total = 0;
// 		for (let i = 0; i < 1000; i++) {
// 			total += poissonDiskSampling(1920, 1080, radius, radius / 2, `${Math.random()}`).length;
// 		}
// 		console.log(`Radius: ${radius}, points: ${total / 1000}`);
// 	}
// };

// testPoissonSampling();
*/

export const poissonDiskSamplingFixedSize = (_width: 1920, _height: 1080, amount: number, seed: string) => {
	const radius = [490, 450, 420, 390][amount - 3];
	if (!radius) {
		throw new Error("Not supported");
	}
	for (let i = 0; i < 100; i++) {
		const result = poissonDiskSampling(1920, 1080, radius, radius / 2, `${seed},${i}`);
		if (result.length === amount) {
			return result;
		}
	}
	throw new Error("Could not find Poisson disk sampling of the given size.");
}
