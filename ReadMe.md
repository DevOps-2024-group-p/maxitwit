# Product Name
> This is a student project for the course, DevOps, Software Evolution and Software Maintenance, at ITU.
The project is an implementation of the minitwit application, based on flask, created in Express.js with pug.
The original flask application can be found on: https://github.com/itu-devops/flask-minitwit-mongodb/tree/Containerize


Some basics of the project:
    - Empty for now

## Installation
To get the repo, run the following command:  ```git clone https://github.com/AAFredsted/maxitwit.git```

Docker is required to run the application. 
Help with the install can be found at: https://docs.docker.com/engine/install/ubuntu/

If you wish to run the application locally, node.js and npm are required, which you can find here: https://nodejs.org/en

## Development setup

The application can be run locally using npm, or packaged by a docker in a development environment.
Both approaches should allow for development, however the docker-setup is the one closest to the actual deployment environment.
However, test can currently only run in the npm-setup.

### Docker Setup

To build the application in a dockerized enviroment, firstly update .env with appropriate values

```
cd <repo_location>
echo "TARGET=dev" > .env
```

Then, run the following command to create your containers with the development dependencies.

```
docker compose up --build
```

Once you are done, use the following command to remove the established containers from your system:
```
docker compose down
```

### NPM setup

Change enviroment variables in .env appropriately.
To run the application outside of a container, run:

```
npm install
npm run devstart 
```

#### Contribution

Make a feature branch and make your changes, then stage your changes. Use commitizen cli tool to format your commit message [to the standard](https://www.conventionalcommits.org/en/v1.0.0/#summary)

Example:

```
git status
$ modified:   Dockerfile.api
git add Dockerfile.api
npm run cz
```

Then open a pull request.

#### Testing: 

Testing has been implemented in a seperate docker-container.
To run the environment locally, use the following commands:

``` 
docker build -t mypytest -f Dockerfile.pytest .
docker run -d -p 3001:3001 mypytest
```
