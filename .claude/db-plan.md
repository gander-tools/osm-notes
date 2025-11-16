# Database Planning Summary for OSM Notes MVP

This document summarizes the comprehensive database planning conversation and decisions made for the OSM Notes application MVP.

## Conversation Summary

### Key Decisions Made

1. **Authentication Architecture**: Implementation of double hashing - PBKDF2 hash (310k iterations) as client-side encryption key, followed by Argon2 hash of that PBKDF2 in SurrealDB using DEFINE ACCESS
2. **Encrypted Content Data Type**: Use of `bytes` type instead of `string` for `encrypted_content` fields to save space (~33%) and improve performance
3. **Data Source Classification**: `source_type` field with values: 'text', 'audio', 'image', 'meta' instead of `data_type`, since database stores processed content (transcriptions, OCR)
4. **Relationship Structure**: Simple 1:N relationship between Note and Data without intermediary table - one note can contain multiple data fragments
5. **OSM Object Metadata**: Store minimal metadata (type, id, version) in encrypted note content, fetch fresh data from OSM API for each commit
6. **Workflow Status**: Implementation of `status` field with values: 'draft', 'processed', 'committed' for tracking note progress
7. **Encryption Key Management**: Zero encryption keys on server-side - always derive from password at login following zero-knowledge architecture
8. **Performance Optimization**: Create indexes on user_id, created_at, updated_at for query optimization
9. **OpenAI Key Storage**: Separate `encrypted_openai_key` field as `option<bytes>` (nullable) instead of JSON
10. **Deletion Strategy**: Hard delete for MVP instead of soft delete for architecture simplification

### Matched Recommendations

1. **Zero-knowledge encryption**: Client-side encryption implementation with AES-256-GCM where server never has access to decryption keys
2. **PBKDF2 + Argon2 security model**: Double hashing ensuring function separation - encryption key ≠ database password
3. **Minimalistic MVP approach**: Avoiding over-engineering by eliminating OSM data caching and complex relational structures
4. **Data type optimization**: Choice of `bytes` type for encrypted data to save space and improve performance
5. **"Server as weakest link" philosophy**: Design assuming VPS can be compromised but data remains secure
6. **Performance indexing**: Strategic placement of indexes on frequently used fields without excessive optimization
7. **Separation of concerns**: Store large files (audio, images) in IndexedDB locally, only processed content in SurrealDB

### Database Planning Summary

#### Main Database Schema Requirements

The OSM Notes application requires a zero-knowledge architecture with full client-side encryption. Key requirements include:
- **Security**: AES-256-GCM encryption of all user data
- **Scalability**: Support for 10-50 concurrent users in MVP
- **Performance**: Optimization for mobile browsers with <100KiB per record limitation
- **Integrity**: Minimal metadata for tracking OSM object versions

#### Key Entities and Relationships

**User Table**:
- `osm_id` (string, unique) - OpenStreetMap identifier
- `password` (string) - Argon2 hash from PBKDF2
- `encrypted_openai_key` (option<bytes>) - optional encrypted API key
- Timestamps: created_at, last_login_at

**Note Table** (1:N with Data):
- `user_id` (record<user>) - note owner
- `status` (enum: draft/processed/committed) - workflow status
- `encrypted_content` (bytes) - JSON with OSM metadata, location, title
- Timestamps: created_at, updated_at

**Data Table** (N:1 with Note):
- `note_id` (record<note>) - note association
- `source_type` (enum: text/audio/image/meta) - processed content source
- `encrypted_content` (bytes) - processed content (transcriptions, OCR, text)
- Timestamps: created_at, updated_at

#### Critical Security and Scalability Considerations

**Security**:
- **Double hashing**: PBKDF2 (310k iterations) → encryption key + Argon2 → authentication
- **Key separation**: Encryption key never leaves browser
- **Assumption of breach**: Design assumes VPS server compromise
- **Performance indexes**: Compound indexes on user_id + created_at for fast queries

**Scalability**:
- **Single SurrealDB instance**: Sufficient for MVP (50 users)
- **Local storage strategy**: Audio/images in IndexedDB, only text in SurrealDB
- **Efficient data types**: `bytes` instead of base64 strings saves ~33% space

#### Authentication Architecture

```sql
DEFINE ACCESS user ON DATABASE TYPE RECORD
  SIGNUP (CREATE user CONTENT {
    osm_id: $osm_id,
    password: crypto::argon2::generate($password), -- PBKDF2 hash from client
    encrypted_openai_key: $encrypted_openai_key
  })
  SIGNIN (SELECT * FROM user WHERE osm_id = $osm_id
    AND crypto::argon2::compare(password, $password))
```

#### Data Flow

1. **Client**: `userPassword` → PBKDF2 → `encryptionKey` (memory) + `authPassword` (SurrealDB)
2. **Encryption**: JSON → AES-256-GCM → `bytes` → SurrealDB
3. **OSM Integration**: Fetch fresh data from OSM API, compare versions for conflicts
4. **AI Processing**: Audio/images → OpenAI API → text → encryption → database

### Unresolved Issues

1. **Backup and disaster recovery**: No strategy defined for automated encrypted data backups
2. **Rate limiting**: Missing specifications for SurrealDB API limits and external service integrations
3. **Migration strategy**: Schema migration process for future versions not defined
4. **Performance monitoring**: No metrics defined for monitoring encryption/decryption performance in production
5. **Salt generation**: Exact PBKDF2 salt generation mechanism not specified (from osm_id or random)
6. **Session timeout handling**: Strategy for session expiration and key re-encryption not defined
7. **Bulk operations**: No strategy for batch operations on multiple notes simultaneously

## Next Steps

1. **Implementation Phase**: Begin implementing the defined schema in development environment
2. **Security Review**: Conduct thorough security audit of encryption implementation
3. **Performance Testing**: Benchmark encryption/decryption operations on target devices
4. **Backup Strategy**: Define and implement automated backup procedures
5. **Migration Planning**: Create versioning strategy for future schema changes

---

**Document Version**: 1.0.0
**Last Updated**: November 16, 2025
**Based on**: Database planning conversation and schema design session
**Related Documents**: [db-schema.md](./.claude/db-schema.md), [tech-stack.md](./.claude/tech-stack.md)