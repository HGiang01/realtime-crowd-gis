package me.gianghn.realtimecrowdgis.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.dto.ApiResponse;
import me.gianghn.realtimecrowdgis.dto.FeedbackDTO;
import me.gianghn.realtimecrowdgis.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService service;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createFeedback(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody FeedbackDTO.CreateFeedbackRequest request
    ) {
        service.createFeedback(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(ApiResponse.success("Feedback created successfully"));
    }
}
