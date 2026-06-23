import type { Difficulty, RaidRole, RaidStatus, WowClass } from './enums'
import type { RegistrationResponse } from './registration.types'

export interface RaidListResponse {
  id: string
  title: string
  raidDate: string
  difficulty: Difficulty
  maxTanks: number
  maxHealers: number
  maxDps: number
  confirmedTanks: number
  confirmedHealers: number
  confirmedDps: number
  status: RaidStatus
  createdBy: string
  createdAt: string
}

export interface RoleStats {
  confirmed: number
  waiting: number
  maxSlots: number
  classCounts: Record<WowClass, number>
  missingClasses: WowClass[]
}

export interface RaidStatsResponse {
  tanks: RoleStats
  healers: RoleStats
  dps: RoleStats
}

export interface RaidDetailResponse extends RaidListResponse {
  notes: string | null
  registrations: RegistrationResponse[]
  stats: RaidStatsResponse
}

export interface RaidRequest {
  title: string
  raidDate: string
  difficulty: Difficulty
  maxTanks: number
  maxHealers: number
  maxDps: number
  notes?: string
}

export interface RaidListParams {
  status?: RaidStatus
  page?: number
  size?: number
}

export type RoleType = RaidRole.TANK | RaidRole.HEALER | RaidRole.DPS
