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

The module viewpoint can be described as a mapping of functional requriements to static code blocks [SRC]. To effectively capture this, the following class diagram presents the components of the web-app mapped to their respective dependencies.

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
    Logging-System "*"--"1" Domain-Model : sends data
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

#### Components Viewpoint

#### Deplyoment Viewpoint

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

## Process Perspective

Why: ExpressJS, Prisma, Postgres

### CI/CD pipline

Our CI/CD pipleine is based on **Github Actions**. We have a [deploy.yml](https://github.com/DevOps-2024-group-p/maxitwit/blob/main/.github/workflows/deploy.yml) file that is automatically triggered when new data is pushed to the **release branch**.

```mermaid
---
title: CI/CD Pipeline
---
flowchart LR
        id0("Prepare")--"✓"-->id1("Build and Push")
        id1--"✓"-->id2("Test")
        id2--"✓"-->id3("Set up VM")
        id3--"✓"-->id4("Deploy")

        style id0 fill:#FFDB5C
        style id1 fill:#5AB2FF
        style id2 fill:#7ABA78
        style id3 fill:#FFBB70
```

```mermaid
flowchart TB
    subgraph P["Prepare the workflow"]
        id0("Checkout")-->id1("Login to Docker Hub")
        id1-->id2("Set up Docker Buildx") 
    end
    
    style P fill:#FFDB5C
```

```mermaid
flowchart TB
    subgraph B["Build and Push to Docker Hub"]
        id0("Maxitwit server")-->id1("Maxitwit api")
        id1-->id2("Maxitwit test")
        id2-->id3("Fluentd image") 
    end

    style B fill:#5AB2FF
```

```mermaid
flowchart TB
    subgraph T["Test"]
        id0("Run Snyk")-->id1("Test maxitwit")
    end

    style T fill:#7ABA78
```

```mermaid
flowchart TB
    subgraph S["Set up VMs"]
        id0("Configure SSH")-->id1("Provision env vars to Workers")
        id1-->id2("Provision /remote_files to Swarm Manager")
    end

    style S fill:#FFBB70
```

### Monitoring

### Security Assesment

### Scaling strategy

## Lessons Learned

* evolution and refactoring
  * Implementation of Logging
The evolution to the docker swarm architecture made the reconfiguration of subsystems a necessity. Specifically the reimplementation of logs proved difficult, as we had to sync logs across workers. To achieve this, it was attempted to have fluentd containers in each worker gather logs and send them to a seperate digital ocean droplet with elasticsearch and kibana running. This however proved infeasable within the constraints of this class, as elasticsearch kept crashing due to the limited resources provided to it on the droplet. Thus, we defaulted to store logs in a /logs folder on the droplet also containing the load balancer. Overall, this proved a learning experience for how a change to the tech-stack can make other segments obsolete, thus increasing the amount of refactoring required for a change to be feasible. In this specific case, a migration to the EFK-stack before the implementation of the docker swarm would have allowed for a more seemless and robust evolution of the application.
* operation
* maintenance
