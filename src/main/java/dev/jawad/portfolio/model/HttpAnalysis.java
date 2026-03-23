package dev.jawad.portfolio.model;

import java.util.List;
import java.util.Map;

public record HttpAnalysis(
        String url,
        int statusCode,
        String statusText,

        // Timing (ms)
        long dnsLookupMs,
        long connectMs,
        long tlsHandshakeMs,
        long timeToFirstByteMs,
        long totalTimeMs,

        // Size
        long responseSizeBytes,
        String responseSizeFormatted,
        boolean gzipEnabled,
        String contentType,

        // Headers analysis
        boolean hasCacheControl,
        String cacheControlValue,
        boolean hasETag,
        boolean hasHSTS,
        boolean hasContentSecurityPolicy,
        boolean hasXFrameOptions,
        boolean hasXContentTypeOptions,
        boolean keepAlive,
        String serverHeader,

        // Score
        String grade,
        int score,
        List<AnalysisFinding> findings
) {}
