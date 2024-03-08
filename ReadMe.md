# Maxitwit
> This is a student project for the course, DevOps, Software Evolution and Software Maintenance, at ITU.
The project is an implementation of the [minitwit application] (https://github.com/itu-devops/flask-minitwit-mongodb/tree/Containerize)

## Stack

Node + express + prisma + vagrant + docker

## Development setup

Prerequisite: docker, node

First, clone the repo.

Then, populate ```.env``` with appropriate values. 

Then chose if you want to build locally or in a container and pic

### Docker Setup

```
docker compose up --build
```

Once you are done, use the following command to remove the established containers from your system:

```
docker compose down
```

### Local setup

To run the application locally:

```
npm install
npm run devstart 
```

### Helpful docs

[Prisma](https://www.prisma.io/docs)


#### Contribution and workflow

Make a feature branch and make your changes, then stage your changes. Use commitizen cli tool to format your commit message [to the standard](https://www.conventionalcommits.org/en/v1.0.0/#summary)

Example:


```
git checkout -b feature/<my-feature-branch>
```

make your changes, then:

``` 
docker build -t mypytest -f Dockerfile.pytest .
docker run -d -p 3001:3001 mypytest
```

git status
$ modified:   Dockerfile.api
git add Dockerfile.api
npm run cz
```

Then open a pull request.
