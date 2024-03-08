#!/usr/bin/env bash

echo "Building Minitwit Images"
docker build -t $DOCKER_USERNAME/maxitwitserver -f Dockerfile.app .
docker build -t $DOCKER_USERNAME/maxitwitapi -f Dockerfile.api .

echo "Login to Dockerhub, provide your password below..."
read -s DOCKER_PASSWORD
echo $DOCKER_PASSWORD | docker login -u "$DOCKER_USERNAME" --password-stdin

echo "Pushing Minitwit Images to Dockerhub..."
docker push $DOCKER_USERNAME/maxitwitimage:latest
docker push $DOCKER_USERNAME/maxitwitapi:latest