-- Define enums
create type user_role as enum ('admin', 'user');
create type user_status as enum ('pending_verification','active', 'repeat_false_report', 'spam_reporting', 'inappropriate_language');
create type report_status as enum ('pending_review', 'processing', 'approved', 'rejected');
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
    id          uuid primary key default uuidv7(),
    location_id uuid references t_locations (id) on delete cascade,
    name        varchar(255)          not null,
    address     varchar(255)          not null,
    metadata    jsonb, -- operating hours, phone, etc.
    geom_point  geometry(Point, 4326) not null,
    image_urls  text[],
    created_at  timestamp        default now()
);

alter table t_locations
    add column current_revision_id uuid references t_location_revisions (id) on delete set null;

create table if not exists t_location_reports
(
    id               uuid primary key default uuidv7(),
    user_id          uuid references t_users (id) on delete cascade,
    location_id      uuid references t_locations (id) on delete cascade,
    proposed_changes jsonb, -- proposed changes to location details
    status           report_status    default 'pending_review',
    created_at       timestamp        default now()
);

create table if not exists t_incident_reports
(
    id          uuid primary key default uuidv7(),
    user_id     uuid references t_users (id) on delete cascade,
    description text                  not null,
    image_urls  text[],
    category    varchar(50)           not null, --'INFRASTRUCTURE', 'ENVIRONMENT', 'SECURITY', 'NOISE', 'HEALTH_SAFETY', 'ADMINISTRATIVE', 'OTHER'
    status      report_status    default 'pending_review',
    level       level            default 'low',
    geom_point  geometry(Point, 4326) not null,
    created_at  timestamp        default now()
);

create table if not exists t_incident_report_results
(
    id                  uuid primary key      default uuidv7(),
    incident_report_id  uuid references t_incident_reports (id) on delete cascade,
    approver_id         uuid references t_users (id) on delete set null,
    description         text not null,
    image_urls          text[],
    satisfaction_rating satisfaction_rating_1 default 'pending_rating',
    created_at          timestamp             default now(),
    updated_at          timestamp             default now()
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
