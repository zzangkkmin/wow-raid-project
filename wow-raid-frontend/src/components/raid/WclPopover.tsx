import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { wclApi } from '@/api/wcl.api'
import { ExternalLink, BarChart2, Loader2 } from 'lucide-react'

// WCL 파싱 점수 → 색상 (WCL 공식 기준)
function parseColor(pct: number): string {
  if (pct >= 95) return '#ff8000' // 전설
  if (pct >= 75) return '#a335ee' // 에픽
  if (pct >= 50) return '#0070dd' // 레어
  if (pct >= 25) return '#1eff00' // 일반
  return '#9d9d9d'                // 일반 이하
}

// 한글 서버명 → WCL URL 슬러그
const SERVER_SLUG: Record<string, string> = {
  '아즈샤라':    'azshara',
  '가로나':      'garona',
  '노르간논':    'norgannon',
  '달라란':      'dalaran',
  '데스윙':      'deathwing',
  '듀로탄':      'durotan',
  '렉사르':      'rexxar',
  '말퓨리온':    'malfurion',
  '불타는 군단': 'burning-legion',
  '세나리우스':  'cenarius',
  '스톰레이지':  'stormrage',
  '알렉스트라자':'alexstrasza',
  '와일드해머':  'wildhammer',
  '윈드러너':    'windrunner',
  '하이잘':      'hyjal',
  '헬스크림':    'hellscream',
}

interface Props {
  server: string
  characterName: string
  classColor: string
}

export default function WclPopover({ server, characterName, classColor }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['wcl', server, characterName],
    queryFn: () => wclApi.getCharacterRankings(server, characterName),
    enabled: open,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  // 디버그 로그
  if (data) console.log('[WCL] data:', data)
  if (error) console.error('[WCL] error:', error)

  const serverSlug = SERVER_SLUG[server] ?? server.toLowerCase()
  const wclUrl = `https://www.warcraftlogs.com/character/kr/${serverSlug}/${characterName}`

  const avg = data?.bestPerformanceAverage != null
    ? Math.round(data.bestPerformanceAverage * 10) / 10
    : null

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Warcraft Logs 보기"
        className={`flex items-center justify-center w-5 h-5 rounded transition-colors ${
          open
            ? 'bg-orange-500/20 text-orange-400'
            : 'text-gray-600 hover:text-orange-400 hover:bg-orange-500/10'
        }`}
      >
        <BarChart2 className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-30 w-56 bg-gray-900 border border-gray-600 rounded-xl shadow-2xl overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-700">
            <div className="min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: classColor }}>{characterName}</p>
              <p className="text-[10px] text-gray-500">{server}</p>
            </div>
            <a
              href={wclUrl}
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-orange-400 transition-colors shrink-0 ml-2"
              title="WCL에서 전체 보기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 본문 */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">로딩 중...</span>
            </div>
          )}

          {isError && (
            <div className="py-4 px-3 text-center">
              <p className="text-xs text-gray-500">데이터를 불러올 수 없습니다.</p>
              <a href={wclUrl} target="_blank" rel="noreferrer"
                className="text-[11px] text-orange-400 hover:underline mt-1 inline-block">
                WCL에서 직접 확인 →
              </a>
            </div>
          )}

          {data && data.rankings.length === 0 && (
            <div className="py-4 px-3 text-center">
              <p className="text-xs text-gray-500">현재 레이드 기록이 없습니다.</p>
              <a href={wclUrl} target="_blank" rel="noreferrer"
                className="text-[11px] text-orange-400 hover:underline mt-1 inline-block">
                WCL에서 확인 →
              </a>
            </div>
          )}

          {data && data.rankings.length > 0 && (
            <>
              <div className="px-3 py-2 space-y-1.5 max-h-52 overflow-y-auto">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">최근 레이드 로그 점수</p>
                {data.rankings.map((r) => {
                  const pct = Math.round(r.rankPercent)
                  const color = parseColor(pct)
                  return (
                    <div key={r.encounterName} className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 truncate flex-1">{r.encounterName}</span>
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <span
                        className="text-[11px] font-bold w-6 text-right shrink-0 font-variant-numeric tabular-nums"
                        style={{ color }}
                      >
                        {pct}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* 평균 */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-800/60 border-t border-gray-700">
                <span className="text-[11px] text-gray-500">Best Perf. Avg</span>
                <span className="text-sm font-bold" style={{ color: avg != null ? parseColor(avg) : '#9d9d9d' }}>
                  {avg != null ? avg.toFixed(1) : '-'}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
