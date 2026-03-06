---
title: "Content Organization"
date: 2024-03-23T12:00:00+07:00
draft: false
tags: ["Hugo", "Structure"]
---

Hugo organizes content based on the directory structure inside the `content` folder.

### Sections
Top-level directories in `content` become sections (e.g., `content/posts` becomes `example.com/posts`).

### Page Bundles
A directory containing an `index.md` file is a Leaf Bundle. It can contain resources like images specific to that page.

```text
content/posts/my-post/
├── index.md
└── image.jpg
```