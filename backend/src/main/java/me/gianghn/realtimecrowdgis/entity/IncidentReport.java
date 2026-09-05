package me.gianghn.realtimecrowdgis.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.generator.EventType;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "t_incident_reports")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class IncidentReport {
    public enum Status {
        pending_review, processing, approved, rejected
    }

    public enum Level {
        low, medium, high
    }

    public enum Category {
        infrastructure, traffic, environment, noise,
        security, healthy_safety, administrative, other
    }

    @Id
    @Generated(event = EventType.INSERT)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolver_id", referencedColumnName = "id")
    private User resolver;

    @Column(nullable = false)
    private String description;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "image_urls")
    private List<String> imageUrls;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode((SqlTypes.NAMED_ENUM))
    private Category category;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode((SqlTypes.NAMED_ENUM))
    private Status status = Status.pending_review;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode((SqlTypes.NAMED_ENUM))
    private Level level = Level.low;

    @Column(name = "geom_point", nullable = false)
    private Point geomPoint;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
