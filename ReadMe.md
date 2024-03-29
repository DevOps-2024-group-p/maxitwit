# Maxitwit
> This is a student project for the course, DevOps, Software Evolution and Software Maintenance, at ITU.
The project is an implementation of the [minitwit application] (https://github.com/itu-devops/flask-minitwit-mongodb/tree/Containerize)

## Stack

Node + express + prisma + vagrant + docker

## Development setup

Prerequisite: docker, node

First, clone the repo.

Then, populate ```.env``` with appropriate values. 

Currently, the .env file will have to be populated in the following way:

```
TARGET= # sets docker image build target, valid values: development, production
 
# Prisma db path
 
DATABASE_URL="postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]"
SESSION_SECRET= # session store secret, must be set. use random value for development
```

Then chose if you want to build locally or in a container and pic

### Docker Setup

Use the following connection string for containerized development:

```
DATABASE_URL="postgresql://pguser:pgpassword@postgres:5432/testdb"
```


```
docker compose up --build -d
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

### Testing

#### Containerized testing
Runs test.sh
Builds test containers, runs pytest against them.

```
npm run test
```



### Helpful docs
=======
### Prisma FAQ


How do i...

[Modify the DB schema](https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema#prototyping-with-an-existing-migration-history)
[Seed or skip seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding#integrated-seeding-with-prisma-migrate)
[Edit DB visually](https://www.prisma.io/docs/orm/tools/prisma-studio)
[Prisma](https://www.prisma.io/docs)


#### Contribution and workflow

Make a feature branch and make your changes, then stage your changes. Use commitizen cli tool to format your commit message [to the standard](https://www.conventionalcommits.org/en/v1.0.0/#summary)

Example:


```
git checkout -b feature/<my-feature-branch>
```

make your changes, then:

```
git checkout -b feature/<my-feature-branch>
```

make your changes, then:

```
git status
$ modified:   Dockerfile.api
git add Dockerfile.api
npm run cz
```

Then open a pull request.
