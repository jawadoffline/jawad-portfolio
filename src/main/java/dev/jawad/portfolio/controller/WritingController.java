package dev.jawad.portfolio.controller;

import dev.jawad.portfolio.service.BlogService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class WritingController {

    private final BlogService blogService;

    public WritingController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping("/writing")
    public String writing(Model model) {
        model.addAttribute("engineeringCount", blogService.getAllPosts().size());
        model.addAttribute("reflectionCount", blogService.getReflections().size());
        return "writing";
    }

    @GetMapping("/reflections")
    public String reflections(Model model) {
        model.addAttribute("posts", blogService.getReflections());
        model.addAttribute("collectionLabel", "Reflections");
        model.addAttribute("collectionPath", "/reflections");
        model.addAttribute("reflections", true);
        return "blog";
    }

    @GetMapping("/reflections/{slug}")
    public String reflection(@PathVariable String slug, Model model) {
        var post = blogService.getReflectionBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reflection not found"));
        model.addAttribute("post", post);
        model.addAttribute("collectionLabel", "Reflections");
        model.addAttribute("collectionPath", "/reflections");
        model.addAttribute("reflections", true);
        return "blog-post";
    }
}
