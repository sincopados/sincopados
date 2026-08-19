// Alias legibles sobre los tipos generados por Supabase.
//
// `database.types.ts` es un archivo generado: no lo edites a mano, regenéralo con
//   supabase gen types typescript --project-id <ref> --schema public > app/types/database.types.ts
// Los alias viven aquí para que regenerar nunca los borre.
import type { Enums, Tables } from './database.types'

export type { Database, Json } from './database.types'

export type UserRole = Enums<'user_role'>
export type ReferralStatus = Enums<'referral_status'>
export type EnrollmentStatus = Enums<'enrollment_status'>
export type ServiceStatus = Enums<'service_status'>

export type Profile = Tables<'profiles'>
export type Service = Tables<'services'>
export type Course = Tables<'courses'>
export type ClientService = Tables<'client_services'>
export type Enrollment = Tables<'enrollments'>
export type ReferralEarning = Tables<'referral_earnings'>
export type ReferralSummary = Tables<'referral_summary'>
