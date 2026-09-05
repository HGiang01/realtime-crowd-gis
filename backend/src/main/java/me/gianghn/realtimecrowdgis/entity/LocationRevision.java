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
@Table(name = "t_location_revisions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LocationRevision {
    @Id
    @Generated(event = EventType.INSERT)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", referencedColumnName = "id")
    private Location location;
    
    @Column(nullable = false)
    private String name;

    @Column(name = "formatted_address", nullable = false)
    private String formattedAddress;

    @Column(name = "geom_point", nullable = false)
    private Point geomPoint;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "image_urls")
    private List<String> imageUrls;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode((SqlTypes.NAMED_ENUM))
    private LocationReport.Category category;

    private String phone;

    private String website;

    @Column(name = "operating_hours")
    private String operatingHours;

    @Column(name = "google_maps_url")
    private String googleMapsUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
