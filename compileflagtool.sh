#!/bin/sh	

mkdir -p out

command=$(gcc -o out/flag_tool flag_tool.c -lsqlite3)

db=/tmp/minitwit.db


if [ ! -f "/tmp/minitwit.db" ]; then
	echo "no database, expected db at path $db"
	exit 1;
fi


if [[ command ]]; then
	echo "Compile ok, flag tool is located in /out"
else
	echo "Compile failed"
fi
