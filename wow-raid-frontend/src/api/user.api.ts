import client from './client'
import type { WowClass, WowSpec } from '@/types/enums'

export interface CharacterResponse {
  id: string
  characterName: string
  wowClass: WowClass
  wowSpec: WowSpec
  isMain: boolean
}

export interface CharacterRequest {
  characterName: string
  wowClass: WowClass
  wowSpec: WowSpec
}

export const userApi = {
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    client.patch<void, void>('/api/users/me/password', data),

  withdraw: () =>
    client.delete<void, void>('/api/users/me'),

  getCharacters: () =>
    client.get<void, CharacterResponse[]>('/api/users/me/characters'),

  addCharacter: (data: CharacterRequest) =>
    client.post<void, CharacterResponse>('/api/users/me/characters', data),

  setMainCharacter: (id: string) =>
    client.patch<void, void>(`/api/users/me/characters/${id}/main`),

  deleteCharacter: (id: string) =>
    client.delete<void, void>(`/api/users/me/characters/${id}`),
}
