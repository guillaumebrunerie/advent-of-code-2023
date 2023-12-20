import { useCallback, useEffect, useState } from "react";
import { continueRender, delayRender, Audio, useVideoConfig } from "remotion";
import {audioBufferToDataUrl} from '@remotion/media-utils';
import * as Tone from "tone";

type Note = {
	constructor: { new(): Tone.Synth | Tone.NoiseSynth },
	start: number,
	note: Tone.Unit.Frequency,
	duration: Tone.Unit.Time,
	loop?: number,
	volume?: number,
};

export const BufferAudio = ({ notes }: { notes: Note[] }) => {
	const [handle] = useState(() => delayRender());
	const [audioBuffer, setAudioBuffer] = useState<string | null>(null);
	const {durationInFrames, fps} = useVideoConfig();

	const renderAudio = useCallback(async () => {
		const toneBuffer = await Tone.Offline(({transport}) => {
			notes.forEach(({constructor, start, note, duration, loop, volume}) => {
				const synth = new constructor().toDestination();
				if (volume) {
					synth.volume.value = volume;
				}
				if (loop === undefined) {
					if (synth instanceof Tone.NoiseSynth) {
						synth.triggerAttackRelease(duration, start);
					} else {
						synth.triggerAttackRelease(
							note,
							duration,
							start,
						);
					}
				} else {
					new Tone.Loop(() => {
						if (synth instanceof Tone.NoiseSynth) {
							synth.triggerAttackRelease(duration);
						} else {
							synth.triggerAttackRelease(
								note,
								duration,
							);
						}
					}, loop).start(start);
				}
				transport.start();
			})
		}, durationInFrames / fps);

		const buffer = toneBuffer.get() as AudioBuffer;
		setAudioBuffer(audioBufferToDataUrl(buffer));

		continueRender(handle);
	}, [handle, fps, durationInFrames, notes]);

	useEffect(() => {
		renderAudio();
	}, [renderAudio]);

	return audioBuffer && <Audio placeholder={null} src={audioBuffer}/>;
};
