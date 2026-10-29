# Jawad Ali — Portfolio

A personal portfolio built with Java 21, Spring Boot 3.2.5, and Thymeleaf.

**Live:** [jawadali.dev](https://jawadali.dev)

## Design

An editorial layout with warm paper, charcoal text, rust accents, Newsreader headings, and DM Sans body text. Custom CSS supplies the responsive layout; there is no frontend build step or Tailwind runtime.

The homepage leads with a portrait and selected project stories, followed by background, experience, interactive walkthroughs, writing, tools, and direct contact links. The terminal is under “Meet the server.” Light and dark themes persist across pages.

## Features

- Server-rendered portfolio and print-ready résumé at `/resume`.
- Writing hub at `/writing`, with engineering articles at `/blog` and personal essays at `/reflections`.
- Both Markdown collections load at startup, with individual article pages and shareable links.
- Wheelogz road journal at `/wheelogz`, with its own visual identity, standalone ride stories, and optional companion video links.
- Bond price calculator with pricing, risk metrics, and cash flow schedules.
- HTTP response analyzer with measured total response time, estimated phases, and header findings.
- HTMX forms with loading, error, and recovery states.
- Engineering walkthroughs with keyboard-accessible tabs.
- Server-backed terminal, SSE visitor counts, disk-backed visits, and downloadable vCard.
- Responsive navigation, visible keyboard focus, reduced-motion support, and shared page fragments.

The homepage uses direct email, LinkedIn, and GitHub links. The legacy `/contact` endpoint only logs sender information; it is not a message delivery service.

## Run locally

Requires Java 21 and Maven.

```bash
mvn spring-boot:run
# http://localhost:8080
```

Or build and run the JAR:

```bash
mvn package
java -jar target/portfolio-1.0.0.jar
```

## Structure

- `src/main/java/dev/jawad/portfolio/controller/` — pages, tools, terminal, visitors, stats.
- `src/main/java/dev/jawad/portfolio/service/` — blog loading, bond pricing, HTTP analysis.
- `src/main/resources/templates/fragments/layout.html` — shared head, navigation, footer.
- `src/main/resources/templates/` — portfolio, writing, résumé, and tool views.
- `src/main/resources/static/css/styles.css` — design tokens, layouts, responsive styles.
- `src/main/resources/static/js/main.js` — shared interactions and walkthrough content.
- `src/main/resources/content/blog/` — engineering articles with frontmatter.
- `src/main/resources/content/reflections/` — personal essays with frontmatter.

Article frontmatter supports `title`, `description`, `author`, optional `date` (ISO format), comma-separated `tags`, and optional `order`. See [the writing guide](docs/writing.md) for adding and publishing articles.

Wheelogz stories load from `src/main/resources/content/wheelogz/`. See [the road journal guide](docs/wheelogz.md) for cover images, ride dates, and scheduled video links.

## Deployment

Pushes to `master` trigger GitHub Actions to build the JAR, copy it to Oracle Cloud, and restart the `jawad-portfolio` systemd service. Caddy supplies the reverse proxy and HTTPS. The `prod` profile enables template caching and response compression.

`deploy/setup-server.sh` documents VM setup. A multi-stage `Dockerfile`, Railway configuration, and a Procfile are also included.

```bash
docker build -t jawad-portfolio .
docker run -p 8080:8080 jawad-portfolio
```
