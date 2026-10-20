# Publishing writing

The Writing page at `/writing` links to two separate collections:

- **Engineering:** Markdown files in `src/main/resources/content/blog/`, served at `/blog`.
- **Reflections:** Markdown files in `src/main/resources/content/reflections/`, served at `/reflections`.

## Add an essay

Create a Markdown file in the appropriate folder. Its filename becomes the permanent URL: `the-decision-to-continue.md` is available at `/reflections/the-decision-to-continue`.

Start with frontmatter, then write the article below the closing marker:

```markdown
---
title: Your essay title
description: A short introduction or an excerpt from the essay.
author: Jawad Ali
date: YYYY-MM-DD
tags: [Attention, Everyday life]
---

Your opening paragraph.

Your next paragraph.
```

Replace `YYYY-MM-DD` with the actual publication date. The date field is optional: when omitted, no publication date is displayed or inferred. Use the original date for a piece previously shared elsewhere.

Articles appear newest first. For essays sharing a date, or a collection without dates, an optional `order: 1` field provides a stable editorial order; lower numbers appear first. Dated articles appear before undated articles. Each collection is sorted independently.

Use blank lines between paragraphs. A backslash at the end of a line creates a deliberate line break within a paragraph. Reading time is calculated automatically at 200 words per minute, rounded up.

Keep filenames stable after publication so shared links keep working. Titles and descriptions can be edited independently of the filename.

## Preview and publish

Run `mvn spring-boot:run` and visit `http://localhost:8080/writing`. Articles load at application startup, so restart after adding or editing a Markdown file.

Run `mvn package` to verify the build. Commit and push the changes to `master` to publish through the existing deployment workflow.
