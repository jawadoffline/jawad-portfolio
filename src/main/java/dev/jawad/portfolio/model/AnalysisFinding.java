package dev.jawad.portfolio.model;

public record AnalysisFinding(
        String type,    // "good", "warning", "bad"
        String title,
        String detail
) {}
