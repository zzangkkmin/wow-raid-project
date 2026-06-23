import client from './client'
import type {
  AbsenceRequest,
  GuestAuthRequest,
  GuestRegistrationRequest,
  RegistrationRequest,
  RegistrationResponse,
} from '@/types/registration.types'

export const registrationApi = {
  register: (raidId: string, data: RegistrationRequest) =>
    client.post<void, RegistrationResponse>(`/api/raids/${raidId}/registrations`, data),

  update: (raidId: string, data: RegistrationRequest) =>
    client.put<void, RegistrationResponse>(`/api/raids/${raidId}/registrations/me`, data),

  cancel: (raidId: string) =>
    client.delete<void, void>(`/api/raids/${raidId}/registrations/me`),

  reportAbsence: (raidId: string, data: AbsenceRequest) =>
    client.patch<void, void>(`/api/raids/${raidId}/registrations/me/absence`, data),
}

export const guestRegistrationApi = {
  register: (raidId: string, data: GuestRegistrationRequest) =>
    client.post<void, RegistrationResponse>(`/api/raids/${raidId}/guest-registrations`, data),

  update: (raidId: string, id: string, data: GuestAuthRequest) =>
    client.put<void, RegistrationResponse>(`/api/raids/${raidId}/guest-registrations/${id}`, data),

  cancel: (raidId: string, id: string, data: GuestAuthRequest) =>
    client.delete<void, void>(`/api/raids/${raidId}/guest-registrations/${id}`, { data }),

  reportAbsence: (raidId: string, id: string, data: GuestAuthRequest) =>
    client.patch<void, void>(`/api/raids/${raidId}/guest-registrations/${id}/absence`, data),
}
