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

### Monitoring

### Security Assesment

### Scaling strategy

## Lessons Learned

* evolution and refactoring
  * Implementation of Logging
The evolution to the docker swarm architecture made the reconfiguration of subsystems a necessity. Specifically the reimplementation of logs proved difficult, as we had to sync logs across workers. To achieve this, it was attempted to have fluentd containers in each worker gather logs and send them to a seperate digital ocean droplet with elasticsearch and kibana running. This however proved infeasable within the constraints of this class, as elasticsearch kept crashing due to the limited resources provided to it on the droplet. Thus, we defaulted to store logs in a /logs folder on the droplet also containing the load balancer. Overall, this proved a learning experience for how a change to the tech-stack can make other segments obsolete, thus increasing the amount of refactoring required for a change to be feasible. In this specific case, a migration to the EFK-stack before the implementation of the docker swarm would have allowed for a more seemless and robust evolution of the application.
* operation
* maintenance
