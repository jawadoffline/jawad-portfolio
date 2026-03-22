package dev.jawad.portfolio.model;

import java.time.LocalDate;

public record BlogPost(
        String slug,
        String title,
        String description,
        String author,
        LocalDate date,
        String[] tags,
        int readingTimeMinutes,
        String htmlContent
) {}
