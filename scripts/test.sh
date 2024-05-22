#!/bin/bash

# Run docker-compose
docker compose -f tests_compose.yaml up --build -d


# Wait for servers to be ready
for i in {1..36}
do
    if $(curl --output /dev/null --silent --head --fail "http://localhost:3000/"); then
        printf 'Server is up!\n'
        break
    fi
    printf 'Waiting for servers to be available'
    sleep 5
    printf '.'
    sleep 5
    printf '.'
    sleep 5
    printf '.\n'
    sleep 5
done

if [ $i -eq 8 ]; then
    printf 'Server did not become available after 3 minutes\n'
    exit 1
fi

# Check if the servers are ready
if [ $? -eq 0 ]; then
  # Run pytest
  pytest --force
  for arg in "$@"
do
    if [ "$arg" == "-d" ]
    then
        docker compose -f tests_compose.yaml down
    fi
done
else
  echo "Servers are not ready. Exiting."
  exit 1
fi