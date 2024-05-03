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
