#!/bin/bash
echo -n '<!DOCTYPE HTML><html><head><meta charset="UTF-8" /><script>'
java -jar closure/compiler.jar --js script.js
echo -n '</script><style>'
tr -d "\n" < style.css | sed -e 's/  */ /g' -e 's/\([;:{]\) /\1/g' -e 's/;}/}\n/g' -e 's/ {/{/g'
echo -n '</style></head></html>'
