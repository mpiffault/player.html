#!/bin/bash
echo '<!DOCTYPE HTML><html><head><meta charset="UTF-8" /><script>'
java -jar closure/compiler.jar --js script.js
echo '</script><style>'
tr -d "\n" < style.css | sed -e 's/  */ /g' -e 's/\([;:{]\) /\1/g' -e 's/;}/}\n/g' -e 's/ {/{/g'
echo '</style></head><body></body></html>'
