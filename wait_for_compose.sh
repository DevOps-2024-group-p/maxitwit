#!/bin/bash

# wait-for-apis.sh

shift
cmd="$@"

until $(curl --output /dev/null --silent --head --fail "http://localhost:3000/"); do
    printf 'Waiting for servers to be available\n'
    sleep 2
done

printf 'Server is up!\n'

exec $cmd