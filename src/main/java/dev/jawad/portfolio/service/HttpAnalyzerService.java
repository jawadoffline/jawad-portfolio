package dev.jawad.portfolio.service;

import dev.jawad.portfolio.model.AnalysisFinding;
import dev.jawad.portfolio.model.HttpAnalysis;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class HttpAnalyzerService {

    private static final Duration TIMEOUT = Duration.ofSeconds(5);
    private static final List<String> BLOCKED_HOSTS = List.of(
            "localhost", "127.0.0.1", "0.0.0.0", "10.", "172.16.", "172.17.",
            "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.",
            "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.",
            "172.30.", "172.31.", "192.168.", "169.254.", "[::1]"
    );

    public HttpAnalysis analyze(String url) {
        // Validate URL
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }

        URI uri;
        try {
            uri = URI.create(url);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid URL");
        }

        String host = uri.getHost();
        if (host == null) throw new IllegalArgumentException("Invalid URL");
        for (String blocked : BLOCKED_HOSTS) {
            if (host.startsWith(blocked) || host.equals(blocked)) {
                throw new IllegalArgumentException("Private/local addresses are not allowed");
            }
        }

        try {
            return performAnalysis(uri, url);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze: " + e.getMessage());
        }
    }

    private HttpAnalysis performAnalysis(URI uri, String url) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(TIMEOUT)
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(TIMEOUT)
                .header("Accept-Encoding", "gzip, deflate")
                .header("User-Agent", "JawadAli-HttpAnalyzer/1.0")
                .GET()
                .build();

        // Measure DNS + connect + TLS + TTFB together, then total
        long startTotal = System.nanoTime();

        // First byte timing — we use BodyHandlers.ofString which waits for full response
        // For TTFB approximation, we measure the time to get headers
        long startRequest = System.nanoTime();
        HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());
        long endTotal = System.nanoTime();

        long totalTimeMs = (endTotal - startTotal) / 1_000_000;

        // Extract timing components (approximated since Java HttpClient doesn't expose individual phases)
        boolean isHttps = url.startsWith("https");
        long estimatedDns = Math.min(totalTimeMs / 5, 50);
        long estimatedConnect = Math.min(totalTimeMs / 6, 40);
        long estimatedTls = isHttps ? Math.min(totalTimeMs / 4, 80) : 0;
        long estimatedTtfb = totalTimeMs - estimatedDns - estimatedConnect - estimatedTls;
        if (estimatedTtfb < 0) estimatedTtfb = totalTimeMs / 2;

        // Response size
        byte[] body = response.body();
        long responseSize = body.length;

        // Headers
        var headers = response.headers();
        String contentEncoding = headers.firstValue("content-encoding").orElse("");
        boolean gzipEnabled = contentEncoding.contains("gzip") || contentEncoding.contains("deflate") || contentEncoding.contains("br");
        String contentType = headers.firstValue("content-type").orElse("unknown");
        String cacheControl = headers.firstValue("cache-control").orElse("");
        boolean hasCacheControl = !cacheControl.isEmpty();
        boolean hasETag = headers.firstValue("etag").isPresent();
        boolean hasHSTS = headers.firstValue("strict-transport-security").isPresent();
        boolean hasCSP = headers.firstValue("content-security-policy").isPresent();
        boolean hasXFrame = headers.firstValue("x-frame-options").isPresent();
        boolean hasXContentType = headers.firstValue("x-content-type-options").isPresent();
        String connection = headers.firstValue("connection").orElse("");
        boolean keepAlive = !connection.equalsIgnoreCase("close");
        String serverHeader = headers.firstValue("server").orElse("Not disclosed");

        // Build findings and score
        List<AnalysisFinding> findings = new ArrayList<>();
        int score = 100;

        // Performance findings
        if (totalTimeMs < 200) {
            findings.add(new AnalysisFinding("good", "Fast Response", "Total response time is " + totalTimeMs + "ms — excellent."));
        } else if (totalTimeMs < 500) {
            findings.add(new AnalysisFinding("good", "Acceptable Response Time", "Total response time is " + totalTimeMs + "ms — good for most use cases."));
        } else if (totalTimeMs < 1000) {
            score -= 10;
            findings.add(new AnalysisFinding("warning", "Slow Response", "Total response time is " + totalTimeMs + "ms. Consider optimizing server processing or using a CDN."));
        } else {
            score -= 20;
            findings.add(new AnalysisFinding("bad", "Very Slow Response", "Total response time is " + totalTimeMs + "ms. This will impact user experience significantly."));
        }

        // Compression
        if (gzipEnabled) {
            findings.add(new AnalysisFinding("good", "Compression Enabled", "Response uses " + contentEncoding + " compression. This reduces bandwidth and improves load times."));
        } else {
            if (responseSize > 1024) {
                score -= 15;
                findings.add(new AnalysisFinding("bad", "No Compression", "Response is " + formatSize(responseSize) + " without compression. Enable GZIP to reduce transfer size by 60-80%."));
            } else {
                findings.add(new AnalysisFinding("good", "Small Response", "Response is only " + formatSize(responseSize) + " — compression would have minimal benefit."));
            }
        }

        // Caching
        if (hasCacheControl) {
            findings.add(new AnalysisFinding("good", "Cache-Control Present", "Value: " + cacheControl));
        } else {
            score -= 10;
            findings.add(new AnalysisFinding("warning", "No Cache-Control Header", "Adding cache headers reduces repeat requests and improves perceived performance."));
        }

        if (hasETag) {
            findings.add(new AnalysisFinding("good", "ETag Present", "Enables conditional requests (304 Not Modified) for efficient caching."));
        }

        // Security headers
        if (hasHSTS) {
            findings.add(new AnalysisFinding("good", "HSTS Enabled", "Strict-Transport-Security forces HTTPS — prevents downgrade attacks."));
        } else if (isHttps) {
            score -= 10;
            findings.add(new AnalysisFinding("warning", "No HSTS Header", "Add Strict-Transport-Security to prevent SSL stripping attacks."));
        }

        if (hasXContentType) {
            findings.add(new AnalysisFinding("good", "X-Content-Type-Options Present", "Prevents MIME type sniffing."));
        } else {
            score -= 5;
            findings.add(new AnalysisFinding("warning", "Missing X-Content-Type-Options", "Add 'nosniff' to prevent browsers from MIME-sniffing the response."));
        }

        if (hasXFrame) {
            findings.add(new AnalysisFinding("good", "X-Frame-Options Present", "Protects against clickjacking."));
        } else {
            score -= 5;
            findings.add(new AnalysisFinding("warning", "Missing X-Frame-Options", "Add DENY or SAMEORIGIN to prevent clickjacking."));
        }

        if (hasCSP) {
            findings.add(new AnalysisFinding("good", "Content-Security-Policy Present", "Mitigates XSS and injection attacks."));
        } else {
            score -= 5;
            findings.add(new AnalysisFinding("warning", "Missing Content-Security-Policy", "CSP helps prevent XSS attacks. Consider adding one."));
        }

        // Keep-alive
        if (keepAlive) {
            findings.add(new AnalysisFinding("good", "Keep-Alive Enabled", "Connection reuse reduces latency for subsequent requests."));
        }

        // HTTPS
        if (isHttps) {
            findings.add(new AnalysisFinding("good", "HTTPS Enabled", "Connection is encrypted."));
        } else {
            score -= 15;
            findings.add(new AnalysisFinding("bad", "No HTTPS", "This site is served over plain HTTP. All traffic is unencrypted."));
        }

        score = Math.max(0, Math.min(100, score));
        String grade = scoreToGrade(score);

        return new HttpAnalysis(
                url, response.statusCode(), statusText(response.statusCode()),
                estimatedDns, estimatedConnect, estimatedTls, estimatedTtfb, totalTimeMs,
                responseSize, formatSize(responseSize), gzipEnabled, contentType,
                hasCacheControl, cacheControl, hasETag, hasHSTS, hasCSP, hasXFrame, hasXContentType,
                keepAlive, serverHeader,
                grade, score, findings
        );
    }

    private String scoreToGrade(int score) {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "F";
    }

    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }

    private String statusText(int code) {
        return switch (code) {
            case 200 -> "OK";
            case 201 -> "Created";
            case 301 -> "Moved Permanently";
            case 302 -> "Found";
            case 304 -> "Not Modified";
            case 400 -> "Bad Request";
            case 401 -> "Unauthorized";
            case 403 -> "Forbidden";
            case 404 -> "Not Found";
            case 500 -> "Internal Server Error";
            case 502 -> "Bad Gateway";
            case 503 -> "Service Unavailable";
            default -> "Status " + code;
        };
    }
}
