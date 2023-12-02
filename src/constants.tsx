export const width = 1920;
export const height = 1080;
export const fps = 60;

export const dayDuration = 16;
export const introDuration = 6;
export const outroDuration = 8;

export const attackDuration = 0.04;

export const black = "#0F0F23";
export const grey = "#444444";
export const white = "#AAAAAA";

export const red = "#FFFF66";

export const clamp = {
	extrapolateLeft: "clamp",
	extrapolateRight: "clamp",
} as const;

import { loadFont } from "@remotion/google-fonts/SourceCodePro";
export const { fontFamily } = loadFont();
