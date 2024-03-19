#!/bin/bash

# wait-for-apis.sh

shift
cmd="$@"

for i in {1..36}
do
    if $(curl --output /dev/null --silent --head --fail "http://localhost:3000/"); then
        printf 'Server is up!\n'
        exec $cmd
    fi
    printf 'Waiting for servers to be available\n'
    sleep 5
done

printf 'Server did not become available after 3 minutes\n'
exit 1