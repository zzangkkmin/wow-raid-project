import client from './client'

export interface WclEncounterRanking {
  encounterName: string
  rankPercent: number
}

export interface WclRankingResponse {
  characterName: string
  server: string
  bestPerformanceAverage: number | null
  rankings: WclEncounterRanking[]
}

export const wclApi = {
  getCharacterRankings: (server: string, name: string) =>
    client.get<void, WclRankingResponse>('/api/wcl/character', { params: { server, name } }),
}
