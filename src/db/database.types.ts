import { z } from 'zod'

// ============================================================================
// CONSTANTS AND ENUMS
// ============================================================================

/**
 * Note workflow status enumeration
 * - draft: Initial creation, user input phase
 * - processed: AI analysis completed
 * - committed: Submitted to OpenStreetMap
 */
export const NoteStatus = {
	DRAFT: 'draft',
	PROCESSED: 'processed',
	COMMITTED: 'committed'
} as const

/**
 * Data source type enumeration
 * - text: Direct text input
 * - audio: Transcribed from audio recording
 * - image: Extracted via OCR from image
 * - meta: AI-generated analysis or metadata
 */
export const DataSourceType = {
	TEXT: 'text',
	AUDIO: 'audio',
	IMAGE: 'image',
	META: 'meta'
} as const

/**
 * OpenStreetMap object types
 */
export const OsmObjectType = {
	NODE: 'node',
	WAY: 'way',
	RELATION: 'relation'
} as const

// Type aliases for easier use
export type NoteStatusType = typeof NoteStatus[keyof typeof NoteStatus]
export type DataSourceTypeType = typeof DataSourceType[keyof typeof DataSourceType]
export type OsmObjectTypeType = typeof OsmObjectType[keyof typeof OsmObjectType]

// ============================================================================
// SURREALDB HELPER TYPES
// ============================================================================

/**
 * Typed SurrealDB Record ID
 * Provides type safety for record references while maintaining string compatibility
 */
export type RecordId<T = unknown> = string & { __table?: T }

/**
 * SurrealDB query result wrapper
 */
export interface QueryResult<T> {
	status: 'OK' | 'ERR'
	time: string
	result: T[]
}

/**
 * Helper function to create typed RecordId
 */
export function recordId<T>(id: string): RecordId<T> {
	return id as RecordId<T>
}

// ============================================================================
// DECRYPTED CONTENT TYPES
// ============================================================================

/**
 * OpenStreetMap object reference
 */
export interface OsmObject {
	type: OsmObjectTypeType
	id: string
	version?: number
}

/**
 * Geographic location coordinates
 */
export interface Location {
	lat: number // Latitude: -90 to 90
	lng: number // Longitude: -180 to 180
}

/**
 * Decrypted note content (stored encrypted in database)
 */
export interface NoteContent {
	osm_object: OsmObject
	location: Location
	title: string
}

/**
 * Processing metadata for AI-generated content
 */
export interface ProcessingMeta {
	api_model?: string
	processing_time?: Date
	original_filename?: string
}

/**
 * Decrypted data content (stored encrypted in database)
 */
export interface DataContent {
	content: string
	confidence?: number // 0.0 to 1.0
	processing_meta?: ProcessingMeta
}

// ============================================================================
// DATABASE RECORD TYPES
// ============================================================================

/**
 * User record - SurrealDB user table
 * Stores OSM authentication and optional encrypted OpenAI key
 */
export interface UserRecord {
	id: RecordId<UserRecord>
	osm_id: string
	password: string // Argon2 hash of PBKDF2-derived password
	encrypted_openai_key: Uint8Array | null
	created_at: Date
	last_login_at: Date | null
}

/**
 * Note record - SurrealDB note table
 * Stores encrypted note metadata and workflow status
 */
export interface NoteRecord {
	id: RecordId<NoteRecord>
	user_id: RecordId<UserRecord>
	status: NoteStatusType
	encrypted_content: Uint8Array // AES-256-GCM encrypted NoteContent
	created_at: Date
	updated_at: Date
}

/**
 * Data record - SurrealDB data table
 * Stores encrypted processed content fragments
 */
export interface DataRecord {
	id: RecordId<DataRecord>
	note_id: RecordId<NoteRecord>
	source_type: DataSourceTypeType
	encrypted_content: Uint8Array // AES-256-GCM encrypted DataContent
	created_at: Date
	updated_at: Date
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * SurrealDB signup parameters
 */
export interface SignupParams {
	NS: string
	DB: string
	AC: 'user'
	osm_id: string
	password: number[] // Uint8Array converted to number[] for JSON
	encrypted_openai_key: number[] | null
}

/**
 * SurrealDB signin parameters
 */
export interface SigninParams {
	NS: string
	DB: string
	AC: 'user'
	osm_id: string
	password: number[] // Uint8Array converted to number[] for JSON
}

/**
 * JWT authentication token
 */
export type AuthToken = string

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Location coordinates validation
 * Ensures latitude/longitude are within valid ranges
 */
export const LocationSchema = z.object({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180)
})

/**
 * OSM object validation
 */
export const OsmObjectSchema = z.object({
	type: z.enum(['node', 'way', 'relation']),
	id: z.string().min(1),
	version: z.number().int().positive().optional()
})

/**
 * Processing metadata validation
 */
export const ProcessingMetaSchema = z.object({
	api_model: z.string().optional(),
	processing_time: z.date().optional(),
	original_filename: z.string().optional()
}).optional()

/**
 * Decrypted note content validation
 */
export const NoteContentSchema = z.object({
	osm_object: OsmObjectSchema,
	location: LocationSchema,
	title: z.string().min(1)
})

/**
 * Decrypted data content validation
 */
export const DataContentSchema = z.object({
	content: z.string(),
	confidence: z.number().min(0).max(1).optional(),
	processing_meta: ProcessingMetaSchema
})

/**
 * User record validation
 */
export const UserRecordSchema = z.object({
	id: z.string(),
	osm_id: z.string().min(1),
	password: z.string().min(1),
	encrypted_openai_key: z.instanceof(Uint8Array).nullable(),
	created_at: z.date(),
	last_login_at: z.date().nullable()
})

/**
 * Note record validation
 */
export const NoteRecordSchema = z.object({
	id: z.string(),
	user_id: z.string(),
	status: z.enum(['draft', 'processed', 'committed']),
	encrypted_content: z.instanceof(Uint8Array),
	created_at: z.date(),
	updated_at: z.date()
})

/**
 * Data record validation
 */
export const DataRecordSchema = z.object({
	id: z.string(),
	note_id: z.string(),
	source_type: z.enum(['text', 'audio', 'image', 'meta']),
	encrypted_content: z.instanceof(Uint8Array),
	created_at: z.date(),
	updated_at: z.date()
})

/**
 * Signup parameters validation
 */
export const SignupParamsSchema = z.object({
	NS: z.string(),
	DB: z.string(),
	AC: z.literal('user'),
	osm_id: z.string().min(1),
	password: z.array(z.number()),
	encrypted_openai_key: z.array(z.number()).nullable()
})

/**
 * Signin parameters validation
 */
export const SigninParamsSchema = z.object({
	NS: z.string(),
	DB: z.string(),
	AC: z.literal('user'),
	osm_id: z.string().min(1),
	password: z.array(z.number())
})

/**
 * Auth token validation
 */
export const AuthTokenSchema = z.string()

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Type guard to check if a value is a valid NoteStatus
 */
export function isNoteStatus(value: string): value is NoteStatusType {
	return Object.values(NoteStatus).includes(value as NoteStatusType)
}

/**
 * Type guard to check if a value is a valid DataSourceType
 */
export function isDataSourceType(value: string): value is DataSourceTypeType {
	return Object.values(DataSourceType).includes(value as DataSourceTypeType)
}

/**
 * Type guard to check if a value is a valid OsmObjectType
 */
export function isOsmObjectType(value: string): value is OsmObjectTypeType {
	return Object.values(OsmObjectType).includes(value as OsmObjectTypeType)
}

/**
 * Utility to validate and parse user record
 */
export function parseUserRecord(data: unknown): UserRecord {
	return UserRecordSchema.parse(data) as UserRecord
}

/**
 * Utility to validate and parse note record
 */
export function parseNoteRecord(data: unknown): NoteRecord {
	return NoteRecordSchema.parse(data) as NoteRecord
}

/**
 * Utility to validate and parse data record
 */
export function parseDataRecord(data: unknown): DataRecord {
	return DataRecordSchema.parse(data) as DataRecord
}

/**
 * Utility to validate and parse note content
 */
export function parseNoteContent(data: unknown): NoteContent {
	return NoteContentSchema.parse(data)
}

/**
 * Utility to validate and parse data content
 */
export function parseDataContent(data: unknown): DataContent {
	return DataContentSchema.parse(data)
}

// ============================================================================
// BRANDED TYPES FOR ENHANCED TYPE SAFETY
// ============================================================================

/**
 * Branded type for decrypted note with content
 */
export interface DecryptedNote extends Omit<NoteRecord, 'encrypted_content'> {
	content: NoteContent
	readonly __brand: 'DecryptedNote'
}

/**
 * Branded type for decrypted data with content
 */
export interface DecryptedData extends Omit<DataRecord, 'encrypted_content'> {
	content: DataContent
	readonly __brand: 'DecryptedData'
}

/**
 * Helper to create a DecryptedNote
 */
export function createDecryptedNote(
	record: NoteRecord,
	content: NoteContent
): DecryptedNote {
	return {
		...record,
		content,
		__brand: 'DecryptedNote'
	} as DecryptedNote
}

/**
 * Helper to create a DecryptedData
 */
export function createDecryptedData(
	record: DataRecord,
	content: DataContent
): DecryptedData {
	return {
		...record,
		content,
		__brand: 'DecryptedData'
	} as DecryptedData
}