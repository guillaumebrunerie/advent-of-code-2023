#!/bin/sh

cd ../../

npx remotion still Day21Helper public/Day21Empty.png --props='{"epsX": 0, "epsY": 0}' --frame=30
npx remotion still Day21Helper public/Day21Full.png --props='{"epsX": 2, "epsY": 2}' --frame=30
npx remotion still Day21Helper public/Day21Single.png --props='{"epsX": 2, "epsY": 2, "single": true}' --frame=30

npx remotion still Day21Helper public/Day21CornerNE.png --props='{"epsX": 0, "epsY": 3}' --frame=30
npx remotion still Day21Helper public/Day21CornerNW.png --props='{"epsX": 4, "epsY": 3}' --frame=30
npx remotion still Day21Helper public/Day21CornerSE.png --props='{"epsX": 0, "epsY": 1}' --frame=30
npx remotion still Day21Helper public/Day21CornerSW.png --props='{"epsX": 4, "epsY": 1}' --frame=30

npx remotion still Day21Helper public/Day21SideW.png --props='{"epsX": 0, "epsY": 2}' --frame=30
npx remotion still Day21Helper public/Day21SideE.png --props='{"epsX": 4, "epsY": 2}' --frame=30
npx remotion still Day21Helper public/Day21SideN.png --props='{"epsX": 2, "epsY": 0}' --frame=30
npx remotion still Day21Helper public/Day21SideS.png --props='{"epsX": 2, "epsY": 4}' --frame=30

npx remotion still Day21Helper public/Day21MissingNE.png --props='{"epsX": 3, "epsY": 1}' --frame=30
npx remotion still Day21Helper public/Day21MissingNW.png --props='{"epsX": 1, "epsY": 1}' --frame=30
npx remotion still Day21Helper public/Day21MissingSE.png --props='{"epsX": 3, "epsY": 3}' --frame=30
npx remotion still Day21Helper public/Day21MissingSW.png --props='{"epsX": 1, "epsY": 3}' --frame=30
