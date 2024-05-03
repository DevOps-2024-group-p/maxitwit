# DevOps, Software Evolution & Software Maintenance

## Group P - 2024

## Authors

| Name | Email |
|------|-------|
| Andreas Andrä-Fredsted | <aandr@itu.dk> |
| Bence Luzsinszky | <bluz@itu.dk> |
| Christian Emil Nielsen | <cemn@itu.dk> |
| Michel Moritz Thies | <mithi@itu.dk> |
| Róbert Sluka | <rslu@itu.dk> |

## System's Perspective


### Sequence diagram, simulator

```mermaid
sequenceDiagram
    participant Simulator
    participant API
    participant Database
    Alice->>John: Hello John, how are you?
    loop HealthCheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```

### Sequence diagram, application

```mermaid
sequenceDiagram
    participant Simulator
    participant API
    participant Database
    Alice->>John: Hello John, how are you?
    loop HealthCheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```

### Module Viewpoint

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

### Components Viewpoint

### Deplyoment Viewpoint

## Process' Perspective

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
    Prisma Client->>+Postgres DB: Saves into DB based on schema 
    Postgres DB->>Postgres DB: Stores data <br>Generates unique ID
    Postgres DB-->>-Prisma Client: Sends response
    Prisma Client-->>+API: Sends response
    API-->>-Simulator: Sends HTTP response 
```

## Lessons Learned


- evolution and refactoring
  - Implementation of Logging
The evolution to the docker swarm architecture made the reconfiguration of subsystems a necessity. Specifically the reimplementation of logs proved difficult, as we had to sync logs across workers. To achieve this, it was attempted to have fluentd containers in each worker gather logs and send them to a seperate digital ocean droplet with elasticsearch and kibana running. This however proved infeasable within the constraints of this class, as elasticsearch kept crashing due to the limited resources provided to it on the droplet. Thus, we defaulted to store logs in a /logs folder on the droplet also containing the load balancer. Overall, this proved a learning experience for how a change to the tech-stack can make other segments obsolete, thus increasing the amount of refactoring required for a change to be feasible. In this specific case, a migration to the EFK-stack before the implementation of the docker swarm would have allowed for a more seemless and robust evolution of the application.
- operation
- maintenance
