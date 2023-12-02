export const parse = (data: string) => {
	return data.split("\n").map((block) => block.split(" ") as [string, string]);
};
