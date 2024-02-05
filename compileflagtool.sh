#!/bin/sh	

mkdir -p out

command=$(gcc -o out/flag_tool flag_tool.c -lsqlite3)

if [[ command ]]; then
	echo "Compile ok, flag tool is located in /out"
else
	echo "Compile failed"
fi
