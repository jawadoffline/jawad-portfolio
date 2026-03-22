package dev.jawad.portfolio.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.atomic.AtomicLong;

@RestController
public class StatsController {

    private static final Path COUNTER_FILE = Path.of("visit-count.txt");
    private final AtomicLong visitCount;

    public StatsController() {
        long initial = 0;
        try {
            if (Files.exists(COUNTER_FILE)) {
                initial = Long.parseLong(Files.readString(COUNTER_FILE).trim());
            }
        } catch (Exception ignored) {}
        this.visitCount = new AtomicLong(initial);
    }

    @PostMapping("/api/visit")
    public ResponseEntity<String> recordVisit() {
        long count = visitCount.incrementAndGet();
        persistCount(count);
        return ResponseEntity.ok(String.valueOf(count));
    }

    @GetMapping("/api/visits")
    public ResponseEntity<String> getVisits() {
        return ResponseEntity.ok(String.valueOf(visitCount.get()));
    }

    @GetMapping("/api/vcard")
    public ResponseEntity<byte[]> downloadVCard() {
        String vcard = """
                BEGIN:VCARD
                VERSION:3.0
                FN:Jawad Ali
                N:Ali;Jawad;;;
                TITLE:Software Engineer
                ORG:SoftSolutions! S.r.l.
                EMAIL;TYPE=INTERNET:jawadali.pieas@gmail.com
                TEL;TYPE=CELL:+923355668145
                ADR;TYPE=WORK:;;Bergamo;;;Italy
                URL:https://linkedin.com/in/jawadali21/
                NOTE:Software Engineer - Fixed Income Trading Platforms & Defense Systems
                END:VCARD
                """;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=jawad-ali.vcf")
                .contentType(MediaType.valueOf("text/vcard"))
                .body(vcard.getBytes());
    }

    private void persistCount(long count) {
        try {
            Files.writeString(COUNTER_FILE, String.valueOf(count));
        } catch (IOException ignored) {}
    }
}
