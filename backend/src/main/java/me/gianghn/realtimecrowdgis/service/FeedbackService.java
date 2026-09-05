package me.gianghn.realtimecrowdgis.service;

import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.FeedbackDTO;
import me.gianghn.realtimecrowdgis.entity.Feedback;
import me.gianghn.realtimecrowdgis.entity.User;
import me.gianghn.realtimecrowdgis.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final UserService userService;
    private final FeedbackRepository feedbackRepository;

    public void createFeedback(FeedbackDTO.CreateFeedbackRequest request, UUID userId) {
        User user = userService.findById(userId);

        Feedback feedback = Feedback.builder()
                                    .user(user)
                                    .description(request.description())
                                    .satisfactionRating(request.satisfactionRating())
                                    .build();

        feedbackRepository.save(feedback);
    }
}
