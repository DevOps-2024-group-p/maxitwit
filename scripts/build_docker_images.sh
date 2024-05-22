#!/usr/bin/env bash

echo "Building Minitwit Images"
docker build -t $DOCKER_USERNAME/maxitwitserver -f Dockerfile.app .
docker build -t $DOCKER_USERNAME/maxitwitapi -f Dockerfile.api .
docker build -t $DOCKER_USERNAME/maxitwittest -f Dockerfile.test .

echo "Login to Dockerhub, provide your password below..."
read -s DOCKER_PASSWORD
echo $DOCKER_PASSWORD | docker login -u "$DOCKER_USERNAME" --password-stdin

echo "Pushing Minitwit Images to Dockerhub..."
docker push $DOCKER_USERNAME/minitwitimage:latest
docker push $DOCKER_USERNAME/minitwitapi:latest
docker push $DOCKER_USERNAME/minitwittest:latest