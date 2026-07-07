CREATE INDEX idx_revisions_location_created ON t_location_revisions (location_id, created_at DESC);

CREATE OR REPLACE VIEW current_locations_view(id, geom_point, category, name) AS
SELECT l.id,
       r.geom_point,
       r.category,
       r.name
FROM t_locations l
JOIN t_location_revisions r ON l.current_revision_id = r.id;