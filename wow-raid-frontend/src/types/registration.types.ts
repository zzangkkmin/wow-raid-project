import type { RaidRole, RegistrationStatus, WowClass, WowSpec } from './enums'

export interface RegistrationResponse {
  id: string
  displayName: string
  isGuest: boolean
  characterName: string
  wowClass: WowClass
  wowSpec: WowSpec
  role: RaidRole
  status: RegistrationStatus
  absenceReason: string | null
  createdAt: string
}

export interface RegistrationRequest {
  characterName: string
  wowClass: WowClass
  wowSpec: WowSpec
  role: RaidRole
}

export interface GuestRegistrationRequest {
  guestName: string
  guestPassword: string
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
