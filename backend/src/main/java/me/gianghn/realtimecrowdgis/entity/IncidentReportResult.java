package me.gianghn.realtimecrowdgis.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.generator.EventType;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "t_incident_report_results")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class IncidentReportResult {
    public enum ResultRating {
        pending_rating, dissatisfied, acceptable, satisfied
    }

    @Id
    @Generated(event = EventType.INSERT)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_report_id", referencedColumnName = "id")
    private IncidentReport incidentReport;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolver_id", referencedColumnName = "id")
    private User resolver;

    @Column(nullable = false)
    private String description;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "image_urls")
    private List<String> imageUrls;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode((SqlTypes.NAMED_ENUM))
    @Column(name = "satisfaction_rating")
    private ResultRating satisfactionRating = ResultRating.pending_rating;

    @Column(name = "satisfaction_comment")
    private String satisfactionComment;

    @UpdateTimestamp
    @Column(name = "rated_at")
    private Instant ratedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
