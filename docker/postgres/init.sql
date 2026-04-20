-- ══════════════════════════════════════════════════════════════
--  ABA Talent Management – PostgreSQL Initialization
-- ══════════════════════════════════════════════════════════════

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- fuzzy text search

-- Set timezone
SET timezone = 'UTC';

-- Grant privileges (already handled by POSTGRES_USER env)
GRANT ALL PRIVILEGES ON DATABASE aba_hrm TO aba_user;
