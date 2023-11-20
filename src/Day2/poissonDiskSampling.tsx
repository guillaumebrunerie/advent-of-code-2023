import { random } from "remotion";

export const poissonDiskSampling = (width: number, height: number, radius: number) => {
	const firstPoint = {x: random("x") * width, y: random("y") * height};
	const points = [firstPoint];
	let activePoints = [firstPoint];
	let i = 0;
	const k = 10;
	while (activePoints.length > 0) {
		const anchor = activePoints[Math.floor(random(`anchor${i}`) * activePoints.length)];
		let found = false;
		for (let j = 0; j < k; j++) {
			i++;
			const r = random(`r${i}`) * radius + radius;
			const angle = random(`a${i}`) * 2 * Math.PI;
			const point = {
				x: anchor.x + r * Math.cos(angle),
				y: anchor.y + r * Math.sin(angle),
			};
			const isValid = point.x > 0 && point.x < width && point.y > 0 && point.y < height &&
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
}
