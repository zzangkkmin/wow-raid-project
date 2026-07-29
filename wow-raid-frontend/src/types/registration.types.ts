import type { RaidRole, RegistrationStatus, WowClass, WowSpec } from './enums'

export interface RegistrationResponse {
  id: string
  displayName: string
  isGuest: boolean
  server: string
  characterName: string
  wowClass: WowClass
  wowSpec: WowSpec
  role: RaidRole
  status: RegistrationStatus
  absenceReason: string | null
  createdAt: string
}

export interface RegistrationRequest {
  server: string
  characterName: string
  wowClass: WowClass
  wowSpec: WowSpec
  role: RaidRole
}

export interface GuestRegistrationRequest {
  guestName: string
  guestPassword: string
  server: string
  characterName: string
  wowClass: WowClass
  wowSpec: WowSpec
  role: RaidRole
}

export interface GuestAuthRequest {
  guestName: string
  guestPassword: string
  characterName?: string
  wowClass?: WowClass
  wowSpec?: WowSpec
  role?: RaidRole
  reason?: string
}

export interface AbsenceRequest {
  reason: string
}
