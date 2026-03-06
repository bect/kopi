---
title: "Taxonomy Setup"
date: 2024-03-24T13:00:00+07:00
draft: false
tags: ["Hugo", "Taxonomy"]
---

Taxonomies allow you to classify content. Hugo includes `tags` and `categories` by default.

You can define custom taxonomies in your site configuration:

```yaml
taxonomies:
  tag: tags
  category: categories
  series: series
```

Then use them in your front matter:

```yaml
series: ["Hugo 101"]
```