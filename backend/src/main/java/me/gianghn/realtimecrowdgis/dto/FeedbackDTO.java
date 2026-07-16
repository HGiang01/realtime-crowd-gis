package me.gianghn.realtimecrowdgis.dto;

import jakarta.validation.constraints.NotNull;
import me.gianghn.realtimecrowdgis.entity.Feedback;

public interface FeedbackDTO {
    record CreateFeedbackRequest(
            String description,

            @NotNull(message = "Satisfaction rating is required")
            Feedback.FeedbackRating satisfactionRating
    ) {
    }
}
