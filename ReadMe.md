# Maxitwit

> This is a student project for the course, DevOps, Software Evolution and Software Maintenance, at ITU. The project is an implementation of the [minitwit application](https://github.com/itu-devops/flask-minitwit-mongodb/tree/Containerize)

## Table of Contents

- [Stack](#stack)
- [Development Setup](#development-setup)
  - [Docker Setup](#docker-setup)
  - [Local Setup](#local-setup)
- [Testing](#testing)
  - [Containerized Testing](#containerized-testing)
- [Helpful Docs](#helpful-docs)
  - [Prisma FAQ](#prisma-faq)
  - [Contribution and Workflow](#contribution-and-workflow)
- [Specification](#specification)

## Stack

Node + express + prisma + vagrant + docker

## Development Setup

### Prerequisites

- docker
- node && npm

### Steps

1. Clone the repo.
2. Create and populate `.env` with appropriate values in the root of the project.
   
   Currently, the .env file will have to be populated in the following way:
   ```bash
   TARGET= # sets docker image build target, valid values: development, production
   DATABASE_URL="postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]"
   SESSION_SECRET= # session store secret, must be set. use random value for development
   ```

3. Choose whether to build locally or in a container.

#### Docker Setup

Use the following connection string for containerized development in the `.env` file you created:
```bash
DATABASE_URL="postgresql://pguser:pgpassword@postgres:5432/testdb"
```

Build and start containers:
```bash
docker compose up --build -d
```

Seed the db server in the container:
```bash
docker exec maxitwitserver npm run seed
```

To remove the containers:
```bash
docker compose down
```

#### Local Setup

To run the application locally:

```bash
npm install
npm run devstart 
```

## Testing

### Containerized Testing

Runs `test.sh`:
- Builds test containers
- Runs pytest against them.

```bash
npm run test
```

## Helpful Docs

### Prisma FAQ

#### How do I...
- [Modify the DB schema](https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema#prototyping-with-an-existing-migration-history)
- [Seed or skip seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding#integrated-seeding-with-prisma-migrate)
- [Edit DB visually](https://www.prisma.io/docs/orm/tools/prisma-studio)
- [Prisma](https://www.prisma.io/docs)

### Contribution and Workflow

1. Make a feature branch and make your changes.
2. Stage your changes.
3. Use `commitizen` CLI tool to format your commit message [to the standard](https://www.conventionalcommits.org/en/v1.0.0/#summary)

   Example:
   ```bash
   git checkout -b feature/<my-feature-branch>
   git status
   $ modified:   Dockerfile.api
   git add Dockerfile.api
   npm run cz
   ```

4. Open a pull request.

## Specification

This README is compliant with the [Standard README](https://github.com/RichardLitt/standard-readme) spec.

## License

- License: [MIT](LICENSE)
- Author: [Your Name](https://github.com/yourname)
