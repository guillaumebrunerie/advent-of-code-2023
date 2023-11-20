export const parse = (data: string) => {
	return data.split("\n\n").map((block) => block.split("\n").map(Number));
};
