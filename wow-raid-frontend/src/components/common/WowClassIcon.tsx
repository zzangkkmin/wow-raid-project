import { WowClass } from '@/types/enums'
import { WOW_CLASS_ICON, WOW_CLASS_KR, wowIconUrl } from '@/utils/wowClass.util'

interface Props {
  wowClass: WowClass
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const PX: Record<'sm' | 'md' | 'lg', number> = { sm: 18, md: 28, lg: 40 }
const CDN_SIZE: Record<'sm' | 'md' | 'lg', 'small' | 'medium' | 'large'> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
}

export default function WowClassIcon({ wowClass, size = 'md', className = '' }: Props) {
  const px = PX[size]
  return (
    <img
      src={wowIconUrl(WOW_CLASS_ICON[wowClass], CDN_SIZE[size])}
      alt={WOW_CLASS_KR[wowClass]}
      width={px}
      height={px}
      className={`rounded shrink-0 ${className}`}
    />
  )
}
