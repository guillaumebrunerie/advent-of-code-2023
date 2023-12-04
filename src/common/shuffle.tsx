import { random } from "remotion";

export const shuffle = <T,>(array: T[], seed: string): T[] => {
	const result: T[] = [];
	while (array.length > 0) {
		const i = Math.floor(random(`shuffle(${seed}, ${array.length})`) * array.length);
		result.push(array.splice(i, 1)[0]);
	}
	return result;
}
