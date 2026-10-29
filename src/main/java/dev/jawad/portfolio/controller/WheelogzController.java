package dev.jawad.portfolio.controller;

import dev.jawad.portfolio.service.WheelogzService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Controller
public class WheelogzController {

    private final WheelogzService wheelogz;

    public WheelogzController(WheelogzService wheelogz) {
        this.wheelogz = wheelogz;
    }

    @ModelAttribute
    public void journal(Model model) {
        model.addAttribute("channelUrl", "https://www.youtube.com/@wheelogz");
    }

    @GetMapping("/wheelogz")
    public String home(Model model) {
        var stories = wheelogz.getStories();
        model.addAttribute("stories", stories);
        model.addAttribute("featured", stories.stream().findFirst().orElse(null));
        model.addAttribute("earlierStories", stories.stream().skip(1).toList());
        return "wheelogz/index";
    }

    @GetMapping("/wheelogz/{slug}")
    public String story(@PathVariable String slug, Model model) {
        var story = wheelogz.getStory(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride story not found"));
        model.addAttribute("story", story);
        model.addAttribute("videoReady", story.isVideoAvailable(Instant.now()));
        model.addAttribute("otherStories", wheelogz.getStories().stream()
                .filter(other -> !other.post().slug().equals(slug)).limit(2).toList());
        if (story.videoAvailableAt() != null) {
            model.addAttribute("videoReleaseLabel", story.videoAvailableAt().atZoneSameInstant(ZoneId.of("Asia/Karachi"))
                    .format(DateTimeFormatter.ofPattern("d MMMM yyyy 'at' h:mm a 'PKT'", Locale.ENGLISH)));
        }
        return "wheelogz/story";
    }
}
