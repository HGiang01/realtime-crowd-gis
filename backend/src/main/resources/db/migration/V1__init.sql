-- Create extensions
create extension if not exists postgis;
create extension if not exists unaccent;

-- Define enums
create type user_role as enum ('admin', 'user');
create type user_status as enum ('pending_verification','active', 'repeat_false_report', 'spam_reporting', 'inappropriate_language');
create type report_status as enum ('pending_review', 'processing', 'approved', 'rejected');
create type incident_report_category as enum ('infrastructure', 'traffic', 'environment', 'noise',
    'security', 'healthy_safety', 'administrative', 'other');
create type location_report_category as enum ('education', 'government', 'landmark', 'market',
    'medical', 'museum', 'park', 'police', 'religion', 'restroom', 'tourism', 'other');
create type level as enum ('low', 'medium', 'high');
create type satisfaction_rating_1 as enum ('pending_rating','dissatisfied', 'acceptable', 'satisfied');
create type satisfaction_rating_2 as enum ('dissatisfied', 'acceptable', 'satisfied');

-- Define tables
create table if not exists t_users
(
    id         uuid primary key      default uuidv7(),
    username   varchar(255) not null unique,
    password   varchar(255),
    role       user_role    not null default 'user',
    email      varchar(255) unique,
    phone      varchar(20) unique,
    dob        date,
    status     user_status           default 'pending_verification',
    created_at timestamp             default now(),
    updated_at timestamp             default now()
);

create table if not exists t_user_auth_providers
(
    id               uuid primary key default uuidv7(),
    user_id          uuid references t_users (id) on delete cascade,
    provider         varchar(255) not null,
    provider_user_id varchar(255) not null,
    created_at       timestamp        default now()
);

create table if not exists t_refresh_tokens
(
    id           uuid primary key default uuidv7(),
    user_id      uuid references t_users (id) on delete cascade,
    token        varchar(500) not null unique, -- Each user can have 3 refresh tokens for 3 devices
    is_revoked   boolean          default false,
    last_used_at timestamp,
    expires_at   timestamp    not null,
    created_at   timestamp        default now()
);

create table if not exists t_locations
(
    id         uuid primary key default uuidv7(),
    created_at timestamp        default now(),
    updated_at timestamp        default now()
);

create table if not exists t_location_revisions
(
    id                uuid primary key default uuidv7(),
    location_id       uuid references t_locations (id) on delete cascade,
    name              varchar(255)          not null,
    formatted_address varchar(255)          not null,
    category          location_report_category,
    phone             varchar(20),
    website           text,
    operating_hours   text,
    google_maps_url   text,
    geom_point        geometry(Point, 4326) not null,
    image_urls        text[],
    created_at        timestamp        default now()
);

alter table t_locations
    add column current_revision_id uuid references t_location_revisions (id) on delete set null;

create table if not exists t_location_reports
(
    id                uuid primary key         default uuidv7(),
    user_id           uuid references t_users (id) on delete cascade,
    location_id       uuid references t_locations (id) on delete cascade,
    resolver_id       uuid                  references t_users (id) on delete set null,
    status            report_status            default 'pending_review',
    name              varchar(255)          not null,
    formatted_address varchar(255)          not null,
    category          location_report_category default 'other',
    phone             varchar(20),
    website           text,
    operating_hours   text,
    google_maps_url   text,
    image_urls        text[],
    geom_point        geometry(Point, 4326) not null,
    created_at        timestamp                default now()
);

create table if not exists t_incident_reports
(
    id          uuid primary key                  default uuidv7(),
    user_id     uuid references t_users (id) on delete cascade,
    resolver_id uuid                     references t_users (id) on delete set null,
    description text                     not null,
    image_urls  text[],
    category    incident_report_category not null default 'other',
    status      report_status                     default 'pending_review',
    level       level                             default 'low',
    geom_point  geometry(Point, 4326)    not null,
    created_at  timestamp                         default now()
);

create table if not exists t_incident_report_results
(
    id                   uuid primary key      default uuidv7(),
    incident_report_id   uuid references t_incident_reports (id) on delete cascade,
    resolver_id          uuid   references t_users (id) on delete set null,
    description          text   not null,
    image_urls           text[] not null,
    satisfaction_rating  satisfaction_rating_1 default 'pending_rating',
    satisfaction_comment text,
    rated_at             timestamp,
    created_at           timestamp             default now(),
    updated_at           timestamp             default now()
);

create table if not exists t_reputation
(
    id                 uuid primary key default uuidv7(),
    user_id            uuid references t_users (id) on delete cascade,
    location_report_id uuid references t_location_reports (id) on delete cascade,
    incident_report_id uuid references t_incident_reports (id) on delete cascade,
    created_at         timestamp        default now()
        check (
            (location_report_id is not null and incident_report_id is null) or
            (location_report_id is null and incident_report_id is not null)
            )
);

create table if not exists t_feedback
(
    id                  uuid primary key default uuidv7(),
    user_id             uuid references t_users (id) on delete cascade,
    description         text,
    satisfaction_rating satisfaction_rating_2,
    created_at          timestamp        default now()
);

create index if not exists idx_location_geom on t_location_reports using gist (geom_point);
create index if not exists idx_incident_geom on t_incident_reports using gist (geom_point);
create index if not exists idx_revision_geom on t_location_revisions using gist (geom_point);
create index if not exists idx_locations_current_revision_id on t_locations (current_revision_id);

-- Define Views
create or replace view current_locations_view(id, geom_point, category) as
SELECT l.id,
       r.geom_point,
       r.category
FROM t_locations l
         JOIN t_location_revisions r ON l.current_revision_id = r.id;

create or replace view pending_incident_view(id, description, image_urls, category, level, geom_point, created_at) as
SELECT id,
       description,
       image_urls,
       category,
       level,
       geom_point,
       created_at
FROM t_incident_reports
WHERE status = 'pending_review'::report_status;

create or replace view processing_incident_view(id, description, image_urls, category, level, geom_point, created_at) as
SELECT id,
       description,
       image_urls,
       category,
       level,
       geom_point,
       created_at
FROM t_incident_reports
WHERE status = 'processing'::report_status;
