# Wheelogz road journal

The journal lives at `/wheelogz`. Each story has a permanent URL such as `/wheelogz/the-ride-i-finally-recorded`. Wheelogz has its own navigation and styles, with links from the portfolio footer and Writing page.

## Add a ride story

Create a Markdown file under `src/main/resources/content/wheelogz/`. Its filename becomes the story URL. Start with single-line frontmatter fields:

```markdown
---
title: The Ride I Finally Recorded
description: A short introduction to the story.
author: Jawad Ali
date: 2026-10-29
rideDate: 2026-10-25
episode: 1
motorcycle: Lifan KPT 250
location: Islamabad — Rawalpindi
coverImage: /images/wheelogz/episode-01.png
coverAlt: A description of the image for readers who cannot see it.
videoUrl: https://www.youtube.com/watch?v=g3JyymqHqc4
videoAvailableAt: 2026-10-30T21:00:00+05:00
tags: [First rides, Lifan KPT 250]
---

The opening of your story.

## A chapter heading

The next part of the story.
```

`date` is the article publication date; `rideDate` is the day of the ride and appears in the journal. Stories are ordered by ride date, newest first. Episode numbers identify the videos. Reading time is calculated from the written story.

Place your cover image in `src/main/resources/static/images/wheelogz/` and refer to it by its `/images/wheelogz/` URL. The cover displays at its full 16:9 ratio. Give it descriptive alt text. If an image is omitted, the journal uses a typographic cover and the article begins with the text.

## An optional companion video

Stories are readable independently. A video link appears after the story; there are no timed captions or embedded players.

For an already-public video, provide `videoUrl` and omit `videoAvailableAt`. For a scheduled video, include its release date, time, and timezone offset. `+05:00` represents Pakistan time. The watch link appears at that instant without another deployment, including for a reader who already has the story open. Before release, readers see the release date and a channel link.

The video itself must also be scheduled or published on YouTube. The journal controls only when its companion link appears. Omit `videoUrl` when the story has no video.

Keep raw captions outside the published content folder. Use them as source material, check the finished story against the ride, and publish the prose.

Restart the application to preview new Markdown content. Run `mvn package`, then commit and push to `master` to publish through the existing deployment workflow.
