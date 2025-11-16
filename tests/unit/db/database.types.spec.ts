import { describe, it, expect } from 'vitest'
import {
	UserRecordSchema,
	NoteRecordSchema,
	DataRecordSchema,
	NoteContentSchema,
	DataContentSchema,
	SignupParamsSchema,
	SigninParamsSchema,
	OsmObjectSchema,
	LocationSchema,
	NoteStatus,
	DataSourceType,
	type UserRecord,
	type NoteRecord,
	type DataRecord,
	type NoteContent,
	type DataContent
} from '@/db/database.types'

describe('Database Types Validation', () => {
	describe('UserRecordSchema', () => {
		it('validates correct user record', () => {
			const validUser: UserRecord = {
				id: 'user:123',
				osm_id: '12345',
				password: 'hashed_password',
				encrypted_openai_key: new Uint8Array([1, 2, 3]),
				created_at: new Date(),
				last_login_at: new Date()
			}

			const result = UserRecordSchema.safeParse(validUser)
			expect(result.success).toBe(true)
		})

		it('validates user with null encrypted_openai_key', () => {
			const validUser: UserRecord = {
				id: 'user:123',
				osm_id: '12345',
				password: 'hashed_password',
				encrypted_openai_key: null,
				created_at: new Date(),
				last_login_at: new Date()
			}

			const result = UserRecordSchema.safeParse(validUser)
			expect(result.success).toBe(true)
		})

		it('validates user with null last_login_at', () => {
			const validUser: UserRecord = {
				id: 'user:123',
				osm_id: '12345',
				password: 'hashed_password',
				encrypted_openai_key: new Uint8Array([1, 2, 3]),
				created_at: new Date(),
				last_login_at: null
			}

			const result = UserRecordSchema.safeParse(validUser)
			expect(result.success).toBe(true)
		})

		it('rejects user with empty osm_id', () => {
			const invalidUser = {
				id: 'user:123',
				osm_id: '',
				password: 'hashed_password',
				encrypted_openai_key: null,
				created_at: new Date(),
				last_login_at: null
			}

			const result = UserRecordSchema.safeParse(invalidUser)
			expect(result.success).toBe(false)
		})

		it('rejects user with empty password', () => {
			const invalidUser = {
				id: 'user:123',
				osm_id: '12345',
				password: '',
				encrypted_openai_key: null,
				created_at: new Date(),
				last_login_at: null
			}

			const result = UserRecordSchema.safeParse(invalidUser)
			expect(result.success).toBe(false)
		})
	})

	describe('NoteRecordSchema', () => {
		it('validates correct note record', () => {
			const validNote: NoteRecord = {
				id: 'note:456',
				user_id: 'user:123',
				status: 'draft',
				encrypted_content: new Uint8Array([10, 20, 30]),
				created_at: new Date(),
				updated_at: new Date()
			}

			const result = NoteRecordSchema.safeParse(validNote)
			expect(result.success).toBe(true)
		})

		it('validates all status enum values', () => {
			const statuses = ['draft', 'processed', 'committed'] as const

			for (const status of statuses) {
				const note = {
					id: 'note:456',
					user_id: 'user:123',
					status,
					encrypted_content: new Uint8Array([10, 20, 30]),
					created_at: new Date(),
					updated_at: new Date()
				}

				const result = NoteRecordSchema.safeParse(note)
				expect(result.success).toBe(true)
			}
		})

		it('rejects note with invalid status', () => {
			const invalidNote = {
				id: 'note:456',
				user_id: 'user:123',
				status: 'invalid_status',
				encrypted_content: new Uint8Array([10, 20, 30]),
				created_at: new Date(),
				updated_at: new Date()
			}

			const result = NoteRecordSchema.safeParse(invalidNote)
			expect(result.success).toBe(false)
		})
	})

	describe('DataRecordSchema', () => {
		it('validates correct data record', () => {
			const validData: DataRecord = {
				id: 'data:789',
				note_id: 'note:456',
				source_type: 'text',
				encrypted_content: new Uint8Array([40, 50, 60]),
				created_at: new Date(),
				updated_at: new Date()
			}

			const result = DataRecordSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('validates all source_type enum values', () => {
			const sourceTypes = ['text', 'audio', 'image', 'meta'] as const

			for (const sourceType of sourceTypes) {
				const data = {
					id: 'data:789',
					note_id: 'note:456',
					source_type: sourceType,
					encrypted_content: new Uint8Array([40, 50, 60]),
					created_at: new Date(),
					updated_at: new Date()
				}

				const result = DataRecordSchema.safeParse(data)
				expect(result.success).toBe(true)
			}
		})

		it('rejects data with invalid source_type', () => {
			const invalidData = {
				id: 'data:789',
				note_id: 'note:456',
				source_type: 'invalid_type',
				encrypted_content: new Uint8Array([40, 50, 60]),
				created_at: new Date(),
				updated_at: new Date()
			}

			const result = DataRecordSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})
	})

	describe('NoteContentSchema', () => {
		it('validates correct note content', () => {
			const validContent: NoteContent = {
				osm_object: {
					type: 'node',
					id: '123456',
					version: 1
				},
				location: {
					lat: 52.5200,
					lng: 13.4050
				},
				title: 'Bridge inspection'
			}

			const result = NoteContentSchema.safeParse(validContent)
			expect(result.success).toBe(true)
		})

		it('validates note content with optional version', () => {
			const validContent: NoteContent = {
				osm_object: {
					type: 'way',
					id: '654321'
				},
				location: {
					lat: -12.3456,
					lng: 45.6789
				},
				title: 'Road survey'
			}

			const result = NoteContentSchema.safeParse(validContent)
			expect(result.success).toBe(true)
		})

		it('rejects note content with empty title', () => {
			const invalidContent = {
				osm_object: {
					type: 'node',
					id: '123456'
				},
				location: {
					lat: 52.5200,
					lng: 13.4050
				},
				title: ''
			}

			const result = NoteContentSchema.safeParse(invalidContent)
			expect(result.success).toBe(false)
		})
	})

	describe('LocationSchema', () => {
		it('validates coordinates within valid range', () => {
			const validLocations = [
				{ lat: 0, lng: 0 },
				{ lat: 90, lng: 180 },
				{ lat: -90, lng: -180 },
				{ lat: 52.5200, lng: 13.4050 }
			]

			for (const location of validLocations) {
				const result = LocationSchema.safeParse(location)
				expect(result.success).toBe(true)
			}
		})

		it('rejects coordinates outside valid range', () => {
			const invalidLocations = [
				{ lat: 91, lng: 0 },
				{ lat: -91, lng: 0 },
				{ lat: 0, lng: 181 },
				{ lat: 0, lng: -181 }
			]

			for (const location of invalidLocations) {
				const result = LocationSchema.safeParse(location)
				expect(result.success).toBe(false)
			}
		})
	})

	describe('OsmObjectSchema', () => {
		it('validates all OSM object types', () => {
			const osmTypes = ['node', 'way', 'relation'] as const

			for (const type of osmTypes) {
				const osmObject = {
					type,
					id: '123456',
					version: 1
				}

				const result = OsmObjectSchema.safeParse(osmObject)
				expect(result.success).toBe(true)
			}
		})

		it('validates OSM object without version', () => {
			const osmObject = {
				type: 'node',
				id: '123456'
			}

			const result = OsmObjectSchema.safeParse(osmObject)
			expect(result.success).toBe(true)
		})

		it('rejects invalid OSM object type', () => {
			const invalidOsmObject = {
				type: 'invalid_type',
				id: '123456'
			}

			const result = OsmObjectSchema.safeParse(invalidOsmObject)
			expect(result.success).toBe(false)
		})
	})

	describe('DataContentSchema', () => {
		it('validates data content with all optional fields', () => {
			const validContent: DataContent = {
				content: 'Transcribed audio content',
				confidence: 0.95,
				processing_meta: {
					api_model: 'whisper-1',
					processing_time: new Date(),
					original_filename: 'recording.wav'
				}
			}

			const result = DataContentSchema.safeParse(validContent)
			expect(result.success).toBe(true)
		})

		it('validates minimal data content', () => {
			const validContent: DataContent = {
				content: 'Some text content'
			}

			const result = DataContentSchema.safeParse(validContent)
			expect(result.success).toBe(true)
		})

		it('rejects confidence outside 0-1 range', () => {
			const invalidContent = {
				content: 'Some content',
				confidence: 1.5
			}

			const result = DataContentSchema.safeParse(invalidContent)
			expect(result.success).toBe(false)
		})
	})

	describe('Authentication Schemas', () => {
		it('validates signup parameters', () => {
			const signupParams = {
				NS: 'osm_notes',
				DB: 'production',
				AC: 'user' as const,
				osm_id: '12345',
				password: Array.from(new Uint8Array([1, 2, 3, 4, 5])),
				encrypted_openai_key: Array.from(new Uint8Array([6, 7, 8, 9]))
			}

			const result = SignupParamsSchema.safeParse(signupParams)
			expect(result.success).toBe(true)
		})

		it('validates signin parameters', () => {
			const signinParams = {
				NS: 'osm_notes',
				DB: 'production',
				AC: 'user' as const,
				osm_id: '12345',
				password: Array.from(new Uint8Array([1, 2, 3, 4, 5]))
			}

			const result = SigninParamsSchema.safeParse(signinParams)
			expect(result.success).toBe(true)
		})
	})

	describe('Constants', () => {
		it('exports correct NoteStatus values', () => {
			expect(NoteStatus.DRAFT).toBe('draft')
			expect(NoteStatus.PROCESSED).toBe('processed')
			expect(NoteStatus.COMMITTED).toBe('committed')
		})

		it('exports correct DataSourceType values', () => {
			expect(DataSourceType.TEXT).toBe('text')
			expect(DataSourceType.AUDIO).toBe('audio')
			expect(DataSourceType.IMAGE).toBe('image')
			expect(DataSourceType.META).toBe('meta')
		})
	})
})