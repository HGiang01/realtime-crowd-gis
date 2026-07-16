package me.gianghn.realtimecrowdgis.repository;

import me.gianghn.realtimecrowdgis.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
}
