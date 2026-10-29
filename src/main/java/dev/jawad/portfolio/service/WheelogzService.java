package dev.jawad.portfolio.service;

import dev.jawad.portfolio.model.RideStory;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class WheelogzService {

    private static final Logger log = LoggerFactory.getLogger(WheelogzService.class);
    private final MarkdownService markdown;
    private final List<RideStory> stories = new ArrayList<>();

    public WheelogzService(MarkdownService markdown) {
        this.markdown = markdown;
    }

    @PostConstruct
    public void loadStories() throws java.io.IOException {
        var resources = new PathMatchingResourcePatternResolver().getResources("classpath:content/wheelogz/*.md");
        for (var resource : resources) {
            try {
                var article = markdown.read(resource).orElseThrow(() -> new IllegalArgumentException("Missing frontmatter"));
                var meta = article.metadata();
                String release = meta.getOrDefault("videoAvailableAt", "");
                stories.add(new RideStory(article.post(), Integer.parseInt(meta.get("episode")),
                        LocalDate.parse(meta.get("rideDate")), meta.getOrDefault("motorcycle", ""),
                        meta.getOrDefault("location", ""), meta.getOrDefault("coverImage", ""),
                        meta.getOrDefault("coverAlt", ""), meta.getOrDefault("videoUrl", ""),
                        release.isBlank() ? null : OffsetDateTime.parse(release)));
            } catch (Exception exception) {
                log.error("Could not load ride story {}", resource.getFilename(), exception);
            }
        }
        stories.sort(Comparator.comparing(RideStory::rideDate).thenComparingInt(RideStory::episode).reversed());
        log.info("Loaded {} Wheelogz stories", stories.size());
    }

    public List<RideStory> getStories() {
        return List.copyOf(stories);
    }

    public Optional<RideStory> getStory(String slug) {
        return stories.stream().filter(story -> story.post().slug().equals(slug)).findFirst();
    }
}
