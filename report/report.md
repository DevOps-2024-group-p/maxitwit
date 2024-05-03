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

### Module Viewpoint

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
