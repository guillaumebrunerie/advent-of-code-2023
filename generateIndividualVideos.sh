#!/bin/sh

end=25

days=$(seq 1 $end)

time npx remotion render Intro
for day in $days
do
	if [[$day == 11]]; then
		time npx remotion render Day$day --crf 28
	elif [[$day == 21]]; then
		time npx remotion render Day$day --crf 23
	elif [[$day == 24]]; then
		time npx remotion render Day$day --crf 23
	else
		time npx remotion render Day$day
	fi
done

# Day11: crf 28
# Day21: crf 23
# Day24: crf 23
