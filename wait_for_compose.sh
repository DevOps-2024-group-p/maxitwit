#!/bin/bash

# wait-for-apis.sh

set -e

server="$1"
api="$2"
shift
cmd="$@"

until $(curl --output /dev/null --silent --head --fail "$server"); do
    printf 'Waiting ffor maxitwitserver'
    sleep 2
done

until $(curl --output /dev/null --silent --head --fail "$api"); do
    printf 'Waiting for maxitwitapi'
    sleep 2
done

exec $cmd