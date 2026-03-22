package dev.jawad.portfolio.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Controller
public class PageController {

    private static final Logger log = LoggerFactory.getLogger(PageController.class);
    private static final int MAX_CONTACT_PER_IP = 5;
    private final ConcurrentHashMap<String, AtomicInteger> contactRateMap = new ConcurrentHashMap<>();

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/resume")
    public String resume() {
        return "resume";
    }

    @PostMapping("/contact")
    public String handleContact(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String message,
            HttpServletRequest request) {

        // Input length validation
        if (name.length() > 100 || email.length() > 200 || message.length() > 5000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Input too long");
        }

        // Simple rate limiting by IP
        String ip = request.getRemoteAddr();
        AtomicInteger count = contactRateMap.computeIfAbsent(ip, k -> new AtomicInteger(0));
        if (count.incrementAndGet() > MAX_CONTACT_PER_IP) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded");
        }

        log.info("Contact from {} ({})", name, email);
        return "fragments/contact-success";
    }
}
