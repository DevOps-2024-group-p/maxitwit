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
```mermaid
flowchart LR
    subgraph "Digital Ocean"
        PROXY["Proxy"] --- SM["Swarm Manager"]
        SM --- SW1["Swarm Worker_1"]
        id1[("Database")] ---|Prisma| SW1
        id1 ---|Prisma| SW2
        SM --- SW2["Swarm Worker_2"]
        SW1 --- |Prometheus|Monitoring
        SW2 --- |Prometheus|Monitoring

    end
    DO["User"] --- |HTTPS REQUEST| PROXY 

```




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
