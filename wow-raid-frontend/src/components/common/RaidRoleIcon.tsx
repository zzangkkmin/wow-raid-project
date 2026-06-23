import React from 'react'
import { RaidRole } from '@/types/enums'
import { RAID_ROLE_KR } from '@/utils/wowClass.util'

interface Props {
  role: RaidRole
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const PX: Record<'sm' | 'md' | 'lg', number> = { sm: 16, md: 22, lg: 32 }

const COLOR: Record<RaidRole, string> = {
  [RaidRole.TANK]:   '#3b82f6',
  [RaidRole.HEALER]: '#22c55e',
  [RaidRole.DPS]:    '#ef4444',
}

// ── 방패 (탱커) ─────────────────────────────────────────────────────────────
function ShieldSvg({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10.5" stroke={c} strokeWidth="1.6" />
      {/* 원래 크기의 0.8× 축소, 채움 */}
      <path
        d="M7.2 6 H16.8 V12.8 Q16.8 18.8 12 20 Q7.2 18.8 7.2 12.8 Z"
        fill={c}
      />
    </svg>
  )
}

// ── 십자가 (힐러) ─────────────────────────────────────────────────────────
function CrossSvg({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10.5" stroke={c} strokeWidth="1.6" />
      {/* 십자가: 채움 */}
      <path
        d="M10 4.5 H14 V10 H19.5 V14 H14 V19.5 H10 V14 H4.5 V10 H10 Z"
        fill={c}
      />
    </svg>
  )
}

// ── 검 대각선 (딜러) ───────────────────────────────────────────────────────
function SwordSvg({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10.5" stroke={c} strokeWidth="1.6" />
      {/* 검날: 왼쪽 하단 → 오른쪽 상단 */}
      <line x1="7.5" y1="17.5" x2="17.5" y2="7.5"
            stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      {/* 손잡이 가드: 검날과 직각, 하단 1/3 지점 */}
      <line x1="8.5" y1="12.5" x2="13" y2="17"
            stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      {/* 손잡이 끝(폼멜) */}
      <rect x="5.5" y="16.5" width="2.8" height="2.8" rx="0.6" fill={c} />
    </svg>
  )
}

const ICONS: Record<RaidRole, (c: string) => React.ReactElement> = {
  [RaidRole.TANK]:   (c) => <ShieldSvg c={c} />,
  [RaidRole.HEALER]: (c) => <CrossSvg  c={c} />,
  [RaidRole.DPS]:    (c) => <SwordSvg  c={c} />,
}

export default function RaidRoleIcon({ role, size = 'md', className = '' }: Props) {
  const px    = PX[size]
  const color = COLOR[role]

  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label={RAID_ROLE_KR[role]}
    >
      {ICONS[role](color)}
    </span>
  )
}
