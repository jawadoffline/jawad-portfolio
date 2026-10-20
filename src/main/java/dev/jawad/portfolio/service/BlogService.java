package dev.jawad.portfolio.service;

import dev.jawad.portfolio.model.BlogPost;
import org.commonmark.Extension;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.ext.heading.anchor.HeadingAnchorExtension;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BlogService {

    private static final Logger log = LoggerFactory.getLogger(BlogService.class);
    private final List<BlogPost> posts = new ArrayList<>();
    private final List<BlogPost> reflections = new ArrayList<>();
    private final Parser parser;
    private final HtmlRenderer renderer;

    public BlogService() {
        List<Extension> extensions = List.of(
                TablesExtension.create(),
                HeadingAnchorExtension.create()
        );
        this.parser = Parser.builder().extensions(extensions).build();
        this.renderer = HtmlRenderer.builder().extensions(extensions).build();
    }

    @PostConstruct
    public void loadPosts() {
        loadCollection("classpath:content/blog/*.md", posts);
        loadCollection("classpath:content/reflections/*.md", reflections);
    }

    private void loadCollection(String pattern, List<BlogPost> collection) {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources(pattern);

            for (Resource resource : resources) {
                try {
                    BlogPost post = parseMarkdownFile(resource);
                    if (post != null) {
                        collection.add(post);
                        log.info("Loaded article: {}", post.slug());
                    }
                } catch (Exception e) {
                    log.error("Failed to parse blog post: {}", resource.getFilename(), e);
                }
            }

            collection.sort(Comparator.comparing(BlogPost::date,
                            Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparingInt(BlogPost::order)
                    .thenComparing(BlogPost::slug));
            log.info("Loaded {} articles from {}", collection.size(), pattern);
        } catch (Exception e) {
            log.error("Failed to load blog posts", e);
        }
    }

    public List<BlogPost> getAllPosts() {
        return Collections.unmodifiableList(posts);
    }

    public Optional<BlogPost> getPostBySlug(String slug) {
        return posts.stream()
                .filter(p -> p.slug().equals(slug))
                .findFirst();
    }

    public List<BlogPost> getReflections() {
        return Collections.unmodifiableList(reflections);
    }

    public Optional<BlogPost> getReflectionBySlug(String slug) {
        return reflections.stream()
                .filter(post -> post.slug().equals(slug))
                .findFirst();
    }

    public List<BlogPost> getPostsByTag(String tag) {
        return posts.stream()
                .filter(p -> Arrays.asList(p.tags()).contains(tag))
                .toList();
    }

    private BlogPost parseMarkdownFile(Resource resource) throws Exception {
        String filename = resource.getFilename();
        if (filename == null) return null;

        String slug = filename.replace(".md", "");

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String content = reader.lines().collect(Collectors.joining("\n"));

            // Parse frontmatter (between --- markers)
            if (!content.startsWith("---")) {
                log.warn("No frontmatter found in {}", filename);
                return null;
            }

            int endOfFrontmatter = content.indexOf("---", 3);
            if (endOfFrontmatter == -1) return null;

            String frontmatter = content.substring(3, endOfFrontmatter).trim();
            String markdown = content.substring(endOfFrontmatter + 3).trim();

            // Parse frontmatter fields
            Map<String, String> meta = new LinkedHashMap<>();
            for (String line : frontmatter.split("\n")) {
                int colon = line.indexOf(':');
                if (colon > 0) {
                    String key = line.substring(0, colon).trim();
                    String value = line.substring(colon + 1).trim();
                    meta.put(key, value);
                }
            }

            String title = meta.getOrDefault("title", slug);
            String description = meta.getOrDefault("description", "");
            String author = meta.getOrDefault("author", "Jawad Ali");
            String dateValue = meta.getOrDefault("date", "");
            LocalDate date = dateValue.isBlank() ? null : LocalDate.parse(dateValue);
            int order = Integer.parseInt(meta.getOrDefault("order", String.valueOf(Integer.MAX_VALUE)));
            String[] tags = meta.getOrDefault("tags", "")
                    .replace("[", "").replace("]", "")
                    .split(",");
            for (int i = 0; i < tags.length; i++) {
                tags[i] = tags[i].trim();
            }

            // Parse markdown to HTML
            String htmlContent = renderer.render(parser.parse(markdown));

            // Estimate reading time (~200 words per minute)
            int wordCount = markdown.split("\\s+").length;
            int readingTime = Math.max(1, (int) Math.ceil(wordCount / 200.0));

            return new BlogPost(slug, title, description, author, date, tags, readingTime, htmlContent, order);
        }
    }
}
