import { OffthreadVideo, staticFile } from "remotion";
import { BufferAudio } from "./MembraneSynth";
import * as Tone from "tone";

// const range = (n: number) => Array(n).fill(true).map((_, i) => i);

export const FullAudio = () => {
	return (
		<>
			<OffthreadVideo src={staticFile("FullVideo.mp4")}/>
			<BufferAudio notes={[
				{ constructor: Tone.MembraneSynth, start: 6, loop: 8, note: "C2", duration: "1n" },
				{ constructor: Tone.NoiseSynth, start: 6, loop: 1, note: "C2", duration: 0.2, volume: -6 },
			]}/>
		</>
	)
};
