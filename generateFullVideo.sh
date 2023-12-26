#!/bin/sh

end=25

days=$(seq 1 $end)

ffmpeg -y -i out/Intro.mp4 -c copy out/Intro.ts
for day in $days
do
	ffmpeg -y -i out/Day$day.mp4 -c copy out/Day$day.ts
done

command=$(
	for day in $days
	do
		echo -n "|out/Day${day}.ts"
	done
)
ffmpeg -y -i "concat:out/Intro.ts$command" -c copy out/Test.mp4
