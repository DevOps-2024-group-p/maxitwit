#!/bin/sh	
command=$(gcc -o flag_tool flag_tool.c -lsqlite3)
if [[ command ]]; then
	echo "Compile ok"
else
	echo "Did not compile"
fi
