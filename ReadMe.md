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
Both approaches should allow for development, however the docker-setup is the one closest to the actuall deployment environment.
However, test can currently only run in the npm-setup.

### Docker Setup

To build the application in a dockerized enviroment, firstly go to .env and set it to 'dev' for development, or 'prod' for production.
Then, run the following command to create your containers with the development dependencies.

```
docker compose up --build
```

Once you are done, use the following command to remove the established containers from your system:
```
docker compose down
```

### NPM setup
To run the application outside of a docker, run:

```
npm install
npm run devstart 
```

#### Testing: 
next release
