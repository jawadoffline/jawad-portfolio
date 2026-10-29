package dev.jawad.portfolio.model;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record RideStory(
        BlogPost post,
        int episode,
        LocalDate rideDate,
        String motorcycle,
        String location,
        String coverImage,
        String coverAlt,
        String videoUrl,
        OffsetDateTime videoAvailableAt
) {
    public boolean isVideoAvailable(Instant now) {
        return !videoUrl.isBlank() && (videoAvailableAt == null || !now.isBefore(videoAvailableAt.toInstant()));
    }
}
