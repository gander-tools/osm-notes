-- ============================================================================
-- OSM Notes MVP Database Schema Migration
-- ============================================================================
-- Purpose: Create zero-knowledge encryption architecture for OSM Notes application
-- Tables: user, note, data
-- Features: PBKDF2 + Argon2 authentication, AES-256-GCM encrypted content
-- Security: Row Level Security with user isolation
-- Performance: Optimized indexes for mobile browsers
-- Version: 1.0.0
-- Date: 2024-11-16
-- ============================================================================

-- ============================================================================
-- USER TABLE: Authentication and OpenAI key storage
-- ============================================================================

DEFINE TABLE user SCHEMAFULL
	PERMISSIONS
		FOR select, update WHERE id = $auth.id
		FOR create, delete NONE;

-- Primary identifier: OpenStreetMap user ID (unique)
DEFINE FIELD osm_id ON TABLE user TYPE string
	ASSERT $value != NONE AND string::len($value) > 0
	PERMISSIONS FULL;

-- Authentication: Argon2 hash of PBKDF2-derived password
DEFINE FIELD password ON TABLE user TYPE string
	ASSERT $value != NONE AND string::len($value) > 0
	PERMISSIONS FOR create, update NONE;

-- Optional encrypted OpenAI API key
DEFINE FIELD encrypted_openai_key ON TABLE user TYPE option<bytes>
	PERMISSIONS FOR select, update WHERE id = $auth.id;

-- Account creation timestamp
DEFINE FIELD created_at ON TABLE user TYPE datetime
	VALUE $before OR time::now()
	PERMISSIONS FOR create, update NONE;

-- Last successful authentication timestamp
DEFINE FIELD last_login_at ON TABLE user TYPE datetime
	PERMISSIONS FOR create, update NONE;

-- Unique constraint on OSM ID
DEFINE INDEX osm_id_unique ON TABLE user COLUMNS osm_id UNIQUE;

-- ============================================================================
-- NOTE TABLE: Core note storage with encrypted metadata
-- ============================================================================

DEFINE TABLE note SCHEMAFULL
	PERMISSIONS
		FOR select, create, update, delete WHERE user_id = $auth.id;

-- Foreign key to note owner
DEFINE FIELD user_id ON TABLE note TYPE record<user>
	ASSERT $value != NONE
	PERMISSIONS FOR create NONE, FOR update NONE;

-- Workflow tracking: draft → processed → committed
DEFINE FIELD status ON TABLE note TYPE string
	ASSERT $value IN ['draft', 'processed', 'committed']
	DEFAULT 'draft'
	PERMISSIONS FULL;

-- Encrypted note content
DEFINE FIELD encrypted_content ON TABLE note TYPE bytes
	ASSERT $value != NONE
	PERMISSIONS FULL;

-- Note creation timestamp
DEFINE FIELD created_at ON TABLE note TYPE datetime
	VALUE $before OR time::now()
	PERMISSIONS FOR create, update NONE;

-- Last modification timestamp
DEFINE FIELD updated_at ON TABLE note TYPE datetime
	VALUE time::now()
	PERMISSIONS FOR create, update NONE;

-- Performance indexes
DEFINE INDEX user_created_idx ON TABLE note COLUMNS user_id, created_at;
DEFINE INDEX user_updated_idx ON TABLE note COLUMNS user_id, updated_at;
DEFINE INDEX user_status_idx ON TABLE note COLUMNS user_id, status;

-- ============================================================================
-- DATA TABLE: Processed content fragments
-- ============================================================================

DEFINE TABLE data SCHEMAFULL
	PERMISSIONS
		FOR select, create, update, delete WHERE note_id.user_id = $auth.id;

-- Foreign key to parent note
DEFINE FIELD note_id ON TABLE data TYPE record<note>
	ASSERT $value != NONE
	PERMISSIONS FOR create NONE, FOR update NONE;

-- Source type of processed content
DEFINE FIELD source_type ON TABLE data TYPE string
	ASSERT $value IN ['text', 'audio', 'image', 'meta']
	PERMISSIONS FULL;

-- Encrypted processed content
DEFINE FIELD encrypted_content ON TABLE data TYPE bytes
	ASSERT $value != NONE
	PERMISSIONS FULL;

-- Content creation timestamp
DEFINE FIELD created_at ON TABLE data TYPE datetime
	VALUE $before OR time::now()
	PERMISSIONS FOR create, update NONE;

-- Last modification timestamp
DEFINE FIELD updated_at ON TABLE data TYPE datetime
	VALUE time::now()
	PERMISSIONS FOR create, update NONE;

-- Performance indexes
DEFINE INDEX note_created_idx ON TABLE data COLUMNS note_id, created_at;
DEFINE INDEX note_source_idx ON TABLE data COLUMNS note_id, source_type;

-- ============================================================================
-- AUTHENTICATION ACCESS CONTROL
-- ============================================================================

DEFINE ACCESS user ON DATABASE TYPE RECORD
	SIGNUP (
		CREATE user CONTENT {
			osm_id: $osm_id,
			password: crypto::argon2::generate($password),
			encrypted_openai_key: $encrypted_openai_key,
			created_at: time::now(),
			last_login_at: time::now()
		}
	)
	SIGNIN (
		SELECT * FROM user WHERE osm_id = $osm_id
		AND crypto::argon2::compare(password, $password)
	)
	DURATION FOR TOKEN 24h, FOR SESSION 7d;

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================
