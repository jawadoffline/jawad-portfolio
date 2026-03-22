package dev.jawad.portfolio.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
public class VisitorController {

    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final AtomicInteger activeVisitors = new AtomicInteger(0);
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public VisitorController() {
        // Broadcast visitor count every 3 seconds
        scheduler.scheduleAtFixedRate(this::broadcastCount, 0, 3, TimeUnit.SECONDS);
    }

    @GetMapping(value = "/api/visitors/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamVisitors() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        int count = activeVisitors.incrementAndGet();

        emitters.add(emitter);

        // Send initial count immediately
        try {
            emitter.send(SseEmitter.event().name("visitors").data(count));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        Runnable onDone = () -> {
            emitters.remove(emitter);
            activeVisitors.decrementAndGet();
        };

        emitter.onCompletion(onDone);
        emitter.onTimeout(onDone);
        emitter.onError(e -> onDone.run());

        return emitter;
    }

    private void broadcastCount() {
        int count = activeVisitors.get();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("visitors").data(count));
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }
}
