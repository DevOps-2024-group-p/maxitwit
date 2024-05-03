# DevOps, Software Evolution & Software Maintenance

## Group P - 2024

## Authors

| Name | Email |
|------|-------|
| Andreas Andrä-Fredsted | <aandr@itu.dk> |
| Christian Emil Nielsen | <cemn@itu.dk> |
| Michel Moritz Thies | <mithi@itu.dk> |
| Róbert Sluka | <rslu@itu.dk> |
| Bence Luzsinszky | <bluz@itu.dk> |

## System's Perspective

### Sequence diagram, simulator

```mermaid
sequenceDiagram
    actor Simulator
    participant API
    participant Postgres DB
    Simulator-)API: Autmated tweets
    activate API
    API-)Postgres DB: Prisma ORM 
    activate Postgres DB
    Postgres DB->>Postgres DB:  
    activate Postgres DB
    Postgres DB-->>API: Flash messages
    activate Postgres DB
    API-->>Simulator: HTTP Response
```

### Module Viewpoint

```mermaid
classDiagram

    class API {
    }
    class Server {
    }
    class PostgreSQL {
    }
    API --> Server : sends request
    Server --> PostgreSQL : queries database
```

### Components Viewpoint

### Deplyoment Viewpoint

## Process' Perspective

## Lessons Learned
