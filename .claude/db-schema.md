# SurrealDB Schema for OSM Notes MVP

This document defines the complete SurrealDB schema for the OSM Notes application, implementing zero-knowledge encryption architecture with client-side data processing.

## Schema Overview

### Design Principles
- **Zero-knowledge encryption**: All sensitive data encrypted client-side using AES-256-GCM
- **Minimal server storage**: Server stores only encrypted bytes, never plaintext
- **PBKDF2 + Argon2 security**: Double-hashed passwords for maximum security
- **Simple MVP structure**: Clean relational design without over-engineering

### Authentication Flow
1. User password → PBKDF2 hash (client-side, 310k iterations) → encryption key (stays in browser)
2. PBKDF2 hash → sent to SurrealDB → Argon2 hash (server-side) → stored in database
3. Session authentication uses Argon2 comparison, encryption uses PBKDF2-derived key

## Database Schema Definition

### User Access Method

```sql
-- Define record access for user authentication
DEFINE ACCESS user ON DATABASE TYPE RECORD
  SIGNUP (
    CREATE user CONTENT {
      osm_id: $osm_id,
      password: crypto::argon2::generate($password), -- $password = PBKDF2 hash from client
      encrypted_openai_key: $encrypted_openai_key,   -- Optional, nullable
      created_at: time::now(),
      last_login_at: NONE
    }
  )
  SIGNIN (
    SELECT * FROM user
    WHERE osm_id = $osm_id
    AND crypto::argon2::compare(password, $password)
    THEN (
      UPDATE $auth SET last_login_at = time::now()
    )
  )
  DURATION FOR TOKEN 24h, FOR SESSION 12h
;
```

### Tables Definition

```sql
-- User table for account management
DEFINE TABLE user SCHEMAFULL
  PERMISSIONS FOR select, update, delete
  WHERE id = $auth;

DEFINE FIELD osm_id ON user TYPE string ASSERT string::len($value) > 0;
DEFINE FIELD password ON user TYPE string; -- Argon2 hash of PBKDF2 hash
DEFINE FIELD encrypted_openai_key ON user TYPE option<bytes>; -- Encrypted OpenAI API key (nullable)
DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now();
DEFINE FIELD last_login_at ON user TYPE option<datetime>;

-- Note container table
DEFINE TABLE note SCHEMAFULL
  PERMISSIONS FOR select, create, update, delete
  WHERE user_id = $auth;

DEFINE FIELD user_id ON note TYPE record(user) DEFAULT $auth;
DEFINE FIELD status ON note TYPE string ASSERT $value IN ['draft', 'processed', 'committed'] DEFAULT 'draft';
DEFINE FIELD encrypted_content ON note TYPE bytes; -- JSON: {osm_object: {type, id, version}, location: {lat, lng}, title}
DEFINE FIELD created_at ON note TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON note TYPE datetime DEFAULT time::now();

-- Data fragments table (text, transcriptions, OCR results)
DEFINE TABLE data SCHEMAFULL
  PERMISSIONS FOR select, create, update, delete
  WHERE note_id.user_id = $auth;

DEFINE FIELD note_id ON data TYPE record(note);
DEFINE FIELD source_type ON data TYPE string ASSERT $value IN ['text', 'audio', 'image', 'meta'];
DEFINE FIELD encrypted_content ON data TYPE bytes; -- Processed text content (transcriptions, OCR, etc.)
DEFINE FIELD created_at ON data TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON data TYPE datetime DEFAULT time::now();
```

### Indexes for Performance

```sql
-- User lookup optimization
DEFINE INDEX user_osm_id ON user FIELDS osm_id UNIQUE;

-- Note queries optimization
DEFINE INDEX note_user_created ON note FIELDS user_id, created_at;
DEFINE INDEX note_user_status ON note FIELDS user_id, status;
DEFINE INDEX note_updated ON note FIELDS updated_at;

-- Data queries optimization
DEFINE INDEX data_note_type ON data FIELDS note_id, source_type;
DEFINE INDEX data_note_created ON data FIELDS note_id, created_at;
```

## Data Structure Examples

### Encrypted Content Structures

#### Note.encrypted_content (JSON before encryption)
```json
{
  "osm_object": {
    "type": "node",           // node/way/relation
    "id": "123456789",        // OSM object ID
    "version": 42             // OSM version when note was created (optional)
  },
  "location": {
    "lat": 52.5200,
    "lng": 13.4050
  },
  "title": "Bridge inspection - Spree River crossing"
}
```

#### Data.encrypted_content (JSON before encryption)
```json
{
  "content": "Opening hours: Mo-Fr 09:00-18:00, Sa 10:00-16:00", // Processed text
  "confidence": 0.95,        // AI confidence score (0-1)
  "processing_meta": {       // Optional metadata
    "api_model": "whisper-1",
    "processing_time": "2024-01-15T10:30:00Z",
    "original_filename": "audio_001.webm"
  }
}
```

## Client-Side Integration

### Using with SurrealDB npm package

```typescript
import { Surreal } from 'surrealdb';

// Database connection
const db = new Surreal();
await db.connect('wss://your-surrealdb-server.com/rpc');

// User registration
async function registerUser(osmId: string, masterPassword: string, openaiKey?: string) {
  // 1. Derive encryption key (PBKDF2)
  const encryptionKey = await deriveKeyPBKDF2(masterPassword, saltFromOsmId(osmId), 310000);

  // 2. Encrypt OpenAI key if provided
  let encryptedOpenaiKey = null;
  if (openaiKey) {
    encryptedOpenaiKey = await encryptAES256GCM(openaiKey, encryptionKey);
  }

  // 3. Sign up (PBKDF2 hash sent as password)
  await db.signup({
    NS: 'osm_notes',
    DB: 'production',
    AC: 'user',
    osm_id: osmId,
    password: Array.from(encryptionKey), // PBKDF2 hash as Uint8Array
    encrypted_openai_key: encryptedOpenaiKey
  });
}

// User authentication
async function loginUser(osmId: string, masterPassword: string) {
  const encryptionKey = await deriveKeyPBKDF2(masterPassword, saltFromOsmId(osmId), 310000);

  const token = await db.signin({
    NS: 'osm_notes',
    DB: 'production',
    AC: 'user',
    osm_id: osmId,
    password: Array.from(encryptionKey)
  });

  // Store encryption key in memory for session
  sessionStorage.setItem('encryptionKey', Array.from(encryptionKey).toString());

  return token;
}

// Create encrypted note
async function createNote(title: string, osmObject: any, location: any) {
  const encryptionKey = getSessionEncryptionKey();

  const noteContent = {
    osm_object: osmObject,
    location: location,
    title: title
  };

  const encryptedContent = await encryptAES256GCM(JSON.stringify(noteContent), encryptionKey);

  const [note] = await db.create('note', {
    encrypted_content: Array.from(encryptedContent)
  });

  return note;
}

// Query user's notes
async function getUserNotes(status?: string) {
  let query = 'SELECT * FROM note WHERE user_id = $auth';
  if (status) {
    query += ` AND status = $status`;
  }
  query += ' ORDER BY created_at DESC';

  const notes = await db.query(query, { status });

  // Decrypt notes on client side
  const encryptionKey = getSessionEncryptionKey();
  return notes.map(note => ({
    ...note,
    decrypted_content: JSON.parse(decryptAES256GCM(note.encrypted_content, encryptionKey))
  }));
}
```

## Security Considerations

### Encryption Implementation
- **Algorithm**: AES-256-GCM for authenticated encryption
- **Key Derivation**: PBKDF2-HMAC-SHA256, 310,000 iterations
- **Salt**: Derived from OSM user ID (deterministic but unique per user)
- **IV/Nonce**: Randomly generated for each encryption operation

### Server Security
- Server never has access to encryption keys or plaintext data
- Even with full server compromise, user data remains encrypted
- Argon2 protects against rainbow table attacks on authentication
- VPS compromise = encrypted data dump only

### Session Management
- Encryption key stored only in sessionStorage (cleared on browser close)
- SurrealDB tokens expire after 24h (configurable)
- Re-authentication required for sensitive operations

## Migration Scripts

### Initial Schema Setup
```sql
-- Run this script to initialize the database schema
-- This creates all tables, fields, indexes, and access methods

-- Create namespace and database
USE NS osm_notes DB production;

-- Include all schema definitions from above
-- (Access method, tables, fields, indexes)
```

### Schema Updates (Future)
```sql
-- Example migration for adding new fields
-- Version 1.1.0 - Add OSM changeset tracking

DEFINE FIELD osm_changeset_id ON note TYPE option<string>;
DEFINE FIELD committed_at ON note TYPE option<datetime>;

-- Update existing notes to have null values for new fields
UPDATE note SET osm_changeset_id = NONE, committed_at = NONE;
```

## Performance Considerations

### Query Optimization
- Compound indexes on frequently queried field combinations
- Limit result sets with LIMIT clause for large datasets
- Use SELECT specific fields instead of SELECT * when possible

### Storage Efficiency
- Audio/image blobs stored in IndexedDB (client-side), not SurrealDB
- Only processed text content stored in database
- Automatic cleanup of old data fragments

### Scaling Notes
- Current schema designed for MVP (10-50 concurrent users)
- Single SurrealDB instance sufficient for MVP requirements
- Horizontal scaling possible with SurrealDB clustering (future consideration)

---

**Schema Version**: 1.0.0
**Last Updated**: November 16, 2025
**Compatible with**: SurrealDB 2.3+, surrealdb npm package latest