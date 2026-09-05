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
@Table(name = "t_location_reports")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LocationReport {
    public enum Status {
        pending_review, processing, approved, rejected
    }

    public enum Category {
        education, government, landmark, market,
        medical, museum, park, police, religion, restroom, tourism, other
    }

    @Id
    @Column(name = "id", insertable = false, updatable = false)
    @Generated(event = EventType.INSERT)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolver_id", referencedColumnName = "id")
    private User resolver;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", referencedColumnName = "id", nullable = true)
    private Location location;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode((SqlTypes.NAMED_ENUM))
    private Status status = Status.pending_review;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private String name;

    @Column(name = "formatted_address", nullable = false)
    private String formattedAddress;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode((SqlTypes.NAMED_ENUM))
    private Category category = Category.other;

    private String phone;

    private String website;

    @Column(name = "operating_hours")
    private String operatingHours;

    @Column(name = "google_maps_url")
    private String googleMapsUrl;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "image_urls")
    private List<String> imageUrls;

    @Column(name = "geom_point", nullable = false)
    private Point geomPoint;
}
