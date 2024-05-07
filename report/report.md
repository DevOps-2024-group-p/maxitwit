# DevOps, Software Evolution & Software Maintenance

## Group P, 2024

## Authors

| Name | Email |
|------|-------|
| Andreas Andrä-Fredsted | <aandr@itu.dk> |
| Bence Luzsinszky | <bluz@itu.dk> |
| Christian Emil Nielsen | <cemn@itu.dk> |
| Michel Moritz Thies | <mithi@itu.dk> |
| Róbert Sluka | <rslu@itu.dk> |

## System Perspective

### Architecture

### Dependencies

### Viewpoints

#### Module Viewpoint

To effectively capture this, the following class diagram presents the components of the web-app mapped to their respective dependencies.

```mermaid
classDiagram
    direction RL

    class Monitoring
    class Logging-System
    class Database-System


    class Domain-Model {
        ExpressJS[
            +views
            +routes
            +prisma
            +services
        ]
    }
    
    class API-endpoint
    class GUI-endpoint

    Monitoring "1"--"*" Domain-Model : makes accessible
    Logging-System "1"--"1" Domain-Model : sends data
    Database-System "1"--"*" Domain-Model : updates

    Domain-Model --* API-endpoint : provides
    Domain-Model --* GUI-endpoint : provides
  

    API-endpoint : recieves HTTP requests 
    GUI-endpoint : recieves HTTP requests 

    Logging-System : Fluentd
    Logging-System : Syslogs

    Monitoring : Prometheus
    Monitoring : Grafana

    Database-System : PostgreSQL
```

The above module viewpoint highlights how the expressjs application interacts with numerous systems with some being
dependencies required for the running of the application, such as the postgres database, while others are tools meant for
tasks such as monitoring and logging. What is not covered in this illustration is the framework in which the application is run and managed,
which is covered in the following viewpoints.

#### Components Viewpoint

```mermaid
graph LR;
    id1[Browser]
    id2[Simulator]
    id3[Expressjs]
    id4[Services]
    id5[Prisma]
    id6[Postgres]

    id1-->id3
    id2-->id3
    id3-->id4
    id4-->id5
    id5-->id6
```
#### Deployment Viewpoint

```mermaid
flowchart LR

    subgraph "Digital Ocean"
    
        PROXY["Proxy"] --- SM["Swarm-Manager"]
        SM --- SW1["Worker1"]
        id1[("Postgres DB")] ---|Prisma| SW1
        id1 ---|Prisma| SW2
        SM --- SW2["Worker2"]
        SW1 --- |Prometheus|Monitoring
        SW2 --- |Prometheus|Monitoring

    end
    DO["User"] --- |HTTPS REQUEST| PROXY 

```

### Important interactions

The system can be interaceted with in two ways:

* [User Interface](https://maxitwit.tech)
* [API for the simulator](https://api.maxitwit.tech)

A user (or the simulator) can register, follow/unfollow other users and send tweets.

```mermaid
---
title: Sequence Diagram - Simulator Interaction
---
sequenceDiagram
    autonumber
    actor Simulator
    participant API
    participant Prisma Client
    participant Postgres DB
    Simulator->>+API: Sends automated HTTP requests<br>Register, Follow, Unfollow, Tweet
    API->>-Prisma Client: Processes and sends data
    activate Prisma Client
    Prisma Client->>+Postgres DB: Saves into DB based on schema 
    deactivate Prisma Client
    Postgres DB->>Postgres DB: Stores data <br>Generates unique ID
    Postgres DB-->>-Prisma Client: Sends response
    activate Prisma Client
    Prisma Client-->>+API: Sends response
    deactivate Prisma Client

    API-->>-Simulator: Sends HTTP response 
```

### Current State

![Sonarcloud screenshot](./images/sonarcloud.png)
The application is practically fully functional, apart from a single outstanding [bug](https://github.com/DevOps-2024-group-p/maxitwit/issues/42). While the application has [minimal technical debt](https://sonarcloud.io/summary/overall?id=fridge7809_maxitwit), it relies on legacy code and dependencies to test the application (test suite and simulator).

## Process Perspective

Why: ExpressJS, Prisma, Postgres

## Branching strategy

```mermaid
---
title: Git branching strategy
---
%%{init: { 'logLevel': 'debug', 'theme': 'base', 'gitGraph': {'showBranches': true, 'showCommitLabel':true,'mainBranchName': 'release'}} }%% 
    gitGraph
       commit
       commit tag: "v1.4.0"
       branch main
       checkout main
       commit
       checkout release
       checkout main
       branch feature
       checkout feature
       commit id: "fix: increment counter"
       checkout release
       checkout main
       commit
       checkout release
       merge main id: "release" tag: "v1.4.1" type: REVERSE
       checkout feature
       checkout release
       checkout feature
       merge main
```

The chosen branching strategy loosely follows the [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow. We chose to omit hotfix branches and merge the concept of a main/develop branch for simplicity. CI pipeline is triggered on open pull-requests from feature to main. CD pipeline is triggered on new commits on release. Release tag is bumped according to the contents of the release, using the [semantic versioning](https://semver.org/) protocol.

### Commit hooks

A pre-commit hook was added in [d40fcba](https://github.com/DevOps-2024-group-p/maxitwit/commit/d40fcba312eb082bda44bd220887f3d7574a7a40) to lint and enforce commit messages and to follow the [semantic versioning](https://semver.org/) protocol. A [CLI-tool](https://github.com/commitizen/cz-cli) was also [added](https://github.com/DevOps-2024-group-p/maxitwit/commit/44eec0ba28e7cad2000d6f1bcbf9db3c667b3862) to aid developers write commit messages that follows the chosen protocol. Effectively standardizing a common development process, improving our process quality and readability of the git log.

### CI/CD pipline

Our CI/CD pipleine is based on **Github Actions**. We have a [deploy.yml](https://github.com/DevOps-2024-group-p/maxitwit/blob/main/.github/workflows/deploy.yml) file that is automatically triggered when new data is pushed to the **release branch**.

```mermaid
---
title: CI/CD Pipeline
---
flowchart LR
        id0("Prepare")-->id1("Build and Push")
        id1-->id2("Test")
        id2-->id3("Set up VM")
        id3-->id4("Deploy")

        style id0 fill:#FFDB5C
        style id1 fill:#5AB2FF
        style id2 fill:#7ABA78
        style id3 fill:#FFBB70
```

We prepare the workflow by checking out to our release branch, logging in to Docker Hub and setting up Docker Buildx so it can build the images.

```mermaid
flowchart TB
    subgraph P["Prepare the workflow"]
        id0("Checkout")-->id1("Login to Docker Hub")
        id1-->id2("Set up Docker Buildx") 
    end
    
    style P fill:#FFDB5C
```

Th workflow builds our images and pushes them to Docker Hub.

```mermaid
flowchart TB
    subgraph B["Build and Push to Docker Hub"]
        id0("Maxitwit server")-->id1("Maxitwit api")
        id1-->id2("Maxitwit test")
        id2-->id3("Fluentd image") 
    end

    style B fill:#5AB2FF
```

The workflow runs snyk to check for vulerabilities, then builds our images and runs our tests suite against them.

```mermaid
flowchart TB
    subgraph T["Test"]
        id0("Run Snyk")-->id1("Test maxitwit")
    end

    style T fill:#7ABA78
```

The environment variables stored in GitHub Actions Secrets are given to the workers and the most recent [/remote_files](https://github.com/DevOps-2024-group-p/maxitwit/tree/main/remote_files) are SCPd to the Swarm Manager.

```mermaid
flowchart TB
    subgraph S["Set up VMs"]
        id0("Configure SSH")-->id1("Provision env vars to Workers")
        id1-->id2("Provision /remote_files to Swarm Manager")
    end

    style S fill:#FFBB70
```

Finally we SSH onto the Swarm Manager and run the [deploy.sh](https://github.com/DevOps-2024-group-p/maxitwit/blob/main/remote_files/deploy.sh) script to pull and build the new images.

### Monitoring

We use Prometheus and Grafana for [monitoring](http://144.126.246.214:3002/d/c8583637-71f4-4803-a0ed-f63485c5c3e6/group-p-public-dashboard?orgId=1&from=1715001375446&to=1715004975446).
There are multiple metrics set up in our backend, that are sent to /metrics enpoint on our both our [GUI](https://maxitwit.tech/metrics) and the [API](http://api.maxitwit.tech/metrics).
Prometheus scrapes these endpoints and Grafana visualizes the data.

We set up a separate Droplet on DigitalOcean for monitoring, because we had issues with its resource consumption. The monitoring droplet runs Prometheus and Grafana, and scrapes the metrics from the Worker nodes of the Docker swarm.

### Security Assesment

* TODO sentence about our pipelines using root users which violates [PloP](https://www.paloaltonetworks.com/cyberpedia/what-is-the-principle-of-least-privilege)

According to the documentation that can be found [Restricitons to ssh](https://superuser.com/questions/1751932/what-are-the-restrictions-to-ssh-stricthostkeychecking-no), we are aware that setting the flag for StrictHostKeyChecking to "no", might result in malicious parties being able to access the super user console of our system. Setting it to yes would prevent third parties from enterying our system and only known hosts would be able to.

### Scaling strategy

We used Docker Swarm for horizontal scaling. The strategy is defined in [compose.yml](https://github.com/DevOps-2024-group-p/maxitwit/blob/main/remote_files/compose.yaml).
One manager node is responsible for the load balancing and the health checks of two worker nodes.
Worker nodes we have 6 replicas of the service running.
We update our system with rolling upgrades. The replicas are updated 2 at a time, with 10s interval between the updates. The health of the service is monitored every 10s. If the service fails, it will be restarted with a maximum of 2 attempts.

## Lessons Learned

* evolution and refactoring
  * Implementation of Logging
The evolution to the docker swarm architecture made the reconfiguration of subsystems a necessity. Specifically the reimplementation of logs proved difficult, as we had to sync logs across workers. To achieve this, it was attempted to have fluentd containers in each worker gather logs and send them to a seperate digital ocean droplet with elasticsearch and kibana running. This however proved infeasable within the constraints of this class, as elasticsearch kept crashing due to the limited resources provided to it on the droplet. Thus, we defaulted to store logs in a /logs folder on the droplet also containing the load balancer. Overall, this proved a learning experience for how a change to the tech-stack can make other segments obsolete, thus increasing the amount of refactoring required for a change to be feasible. In this specific case, a migration to the EFK-stack before the implementation of the docker swarm would have allowed for a more seemless and robust evolution of the application.
* operation
* maintenance

### Maintaining a performant DB

We noticed the performance of the public timeline endpoint getting slower as the database grew. To remedy this, we [wrote a shell script](https://github.com/DevOps-2024-group-p/maxitwit/blob/fd72ed600e3e7d8e6e8a5d96885e52b495a0b85e/sql/grab_perf_stats.sql) to query the performance table of our production database to [identify which relations needed indices](https://github.com/DevOps-2024-group-p/maxitwit/pull/79).
