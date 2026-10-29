package dev.jawad.portfolio.service;

import dev.jawad.portfolio.model.BlogPost;
import org.commonmark.Extension;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.ext.heading.anchor.HeadingAnchorExtension;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MarkdownService {

    public record Article(BlogPost post, Map<String, String> metadata) {}

    private final Parser parser;
    private final HtmlRenderer renderer;

    public MarkdownService() {
        List<Extension> extensions = List.of(TablesExtension.create(), HeadingAnchorExtension.create());
        parser = Parser.builder().extensions(extensions).build();
        renderer = HtmlRenderer.builder().extensions(extensions).build();
    }

    public Optional<Article> read(Resource resource) throws IOException {
        String filename = resource.getFilename();
        if (filename == null) return Optional.empty();

        String content;
        try (var input = resource.getInputStream()) {
            content = new String(input.readAllBytes(), StandardCharsets.UTF_8).replace("\r\n", "\n");
        }
        if (!content.startsWith("---\n")) return Optional.empty();
        int end = content.indexOf("\n---", 4);
        if (end < 0) return Optional.empty();

        Map<String, String> metadata = new LinkedHashMap<>();
        for (String line : content.substring(4, end).split("\n")) {
            int colon = line.indexOf(':');
            if (colon > 0) metadata.put(line.substring(0, colon).trim(), line.substring(colon + 1).trim());
        }

        String markdown = content.substring(end + 4).trim();
        String slug = filename.replaceFirst("\\.md$", "");
        String dateValue = metadata.getOrDefault("date", "");
        String[] tags = Arrays.stream(metadata.getOrDefault("tags", "").replace("[", "").replace("]", "").split(","))
                .map(String::trim).filter(tag -> !tag.isEmpty()).toArray(String[]::new);
        int words = markdown.isBlank() ? 0 : markdown.split("\\s+").length;
        BlogPost post = new BlogPost(slug, metadata.getOrDefault("title", slug),
                metadata.getOrDefault("description", ""), metadata.getOrDefault("author", "Jawad Ali"),
                dateValue.isBlank() ? null : LocalDate.parse(dateValue), tags,
                Math.max(1, (words + 199) / 200), renderer.render(parser.parse(markdown)),
                Integer.parseInt(metadata.getOrDefault("order", String.valueOf(Integer.MAX_VALUE))));
        return Optional.of(new Article(post, Map.copyOf(metadata)));
    }
}
