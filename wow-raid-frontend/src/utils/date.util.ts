import { format, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export const formatDate = (dateStr: string) =>
  format(new Date(dateStr), 'yyyy.MM.dd (EEE) HH:mm', { locale: ko })

export const formatDateShort = (dateStr: string) =>
  format(new Date(dateStr), 'MM/dd HH:mm')

export const formatRelative = (dateStr: string) =>
  formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ko })
