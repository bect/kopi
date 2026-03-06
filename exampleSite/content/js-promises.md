---
title: "Js Promises"
date: 2024-04-05T14:00:00+07:00
draft: false
tags: ["JavaScript", "Async"]
---

Handling asynchronous operations in JavaScript using Promises.

```javascript
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Success!");
  }, 1000);
});
```