---
title: "Go Routines"
date: 2024-04-04T09:00:00+07:00
draft: false
tags: ["Go", "Programming"]
---

Concurrency in Go is handled by Goroutines.

```go
go func() {
    fmt.Println("Running in a goroutine")
}()
```