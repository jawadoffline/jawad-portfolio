package dev.jawad.portfolio.service;

import dev.jawad.portfolio.model.BlogPost;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;

@Service
public class BlogService {

    private static final Logger log = LoggerFactory.getLogger(BlogService.class);
    private final List<BlogPost> posts = new ArrayList<>();
    private final List<BlogPost> reflections = new ArrayList<>();
    private final MarkdownService markdown;

    public BlogService(MarkdownService markdown) {
        this.markdown = markdown;
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

    private BlogPost parseMarkdownFile(Resource resource) throws java.io.IOException {
        return markdown.read(resource).map(MarkdownService.Article::post).orElse(null);
    }
}
