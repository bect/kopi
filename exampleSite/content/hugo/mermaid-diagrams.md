---
title: "Mermaid Diagrams Showcase"
date: 2024-03-15T10:00:00+00:00
draft: false
tags: ["Mermaid", "Diagrams", "Visualization"]
summary: "A collection of Mermaid diagrams to demonstrate the theme's rendering capabilities, including Flowcharts, Sequence diagrams, and more."
---

This post demonstrates the Mermaid diagram integration. The code blocks below are rendered with a tab interface allowing you to switch between the Mermaid source code and the rendered diagram.

## Flowchart

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]
    D --> B
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant System
    User->>System: Request Data
    activate System
    System-->>User: Return Data
    deactivate System
```

## Class Diagram

```mermaid
classDiagram
    class Animal {
        +String name
        +eat()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : Event
    Processing --> Idle : Finished
```

## Pie Chart

```mermaid
pie title Browser Usage
    "Chrome" : 70
    "Firefox" : 20
    "Safari" : 10
```

## Entity Relationship Diagram

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
```

## User Journey

```mermaid
journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me
```