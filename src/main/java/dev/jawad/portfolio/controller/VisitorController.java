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
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
public class VisitorController {

    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final AtomicInteger activeVisitors = new AtomicInteger(0);
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public VisitorController() {
        scheduler.scheduleAtFixedRate(this::broadcastCount, 0, 3, TimeUnit.SECONDS);
    }

    private static final long SSE_TIMEOUT = 5 * 60 * 1000L; // 5 minutes
    private static final int MAX_CONNECTIONS = 50;

    @GetMapping(value = "/api/visitors/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamVisitors() {
        // Reject if too many connections
        if (emitters.size() >= MAX_CONNECTIONS) {
            SseEmitter rejected = new SseEmitter(0L);
            rejected.complete();
            return rejected;
        }

        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        AtomicBoolean removed = new AtomicBoolean(false);

        emitters.add(emitter);
        int count = activeVisitors.incrementAndGet();

        try {
            emitter.send(SseEmitter.event().name("visitors").data(Math.max(count, 1)));
        } catch (IOException e) {
            cleanup(emitter, removed);
            return emitter;
        }

        Runnable onDone = () -> cleanup(emitter, removed);

        emitter.onCompletion(onDone);
        emitter.onTimeout(onDone);
        emitter.onError(e -> onDone.run());

        return emitter;
    }

    private void cleanup(SseEmitter emitter, AtomicBoolean removed) {
        // Guard: only decrement once per emitter
        if (removed.compareAndSet(false, true)) {
            emitters.remove(emitter);
            activeVisitors.updateAndGet(v -> Math.max(v - 1, 0));
        }
    }

    private void broadcastCount() {
        int count = Math.max(activeVisitors.get(), 1); // always show at least 1
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("visitors").data(count));
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }
}
