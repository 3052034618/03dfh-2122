import type { GameSpot } from '@/types'

export const TWO_HOURS_MS = 2 * 60 * 60 * 1000

export function isValidSpot(spot: GameSpot): boolean {
  const now = Date.now()
  const startTime = new Date(spot.startTime).getTime()
  const diff = startTime - now

  if (diff <= 0) return false
  if (diff > TWO_HOURS_MS) return false
  if (spot.missingCount <= 0) return false

  return true
}

export function sortSpotsByUrgency(spots: GameSpot[]): GameSpot[] {
  return [...spots].sort((a, b) => {
    const timeA = new Date(a.startTime).getTime()
    const timeB = new Date(b.startTime).getTime()
    return timeA - timeB
  })
}

export function getSpotUrgencyLevel(spot: GameSpot): 'critical' | 'urgent' | 'normal' {
  const now = Date.now()
  const diff = new Date(spot.startTime).getTime() - now
  if (diff < 30 * 60 * 1000) return 'critical'
  if (diff < 60 * 60 * 1000) return 'urgent'
  return 'normal'
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function calculateArrivalTime(distanceKm: number, speedKmh: number = 30): Date {
  const minutesToTravel = Math.ceil((distanceKm / speedKmh) * 60) + 5
  return new Date(Date.now() + minutesToTravel * 60000)
}

export function calculateDepartureTime(distanceKm: number, startTime: string, speedKmh: number = 30): Date {
  const start = new Date(startTime).getTime()
  const travelMs = (distanceKm / speedKmh) * 60 * 60 * 1000
  const bufferMs = 10 * 60 * 1000
  return new Date(start - travelMs - bufferMs)
}

export function isAtRiskOfLate(distanceKm: number, startTime: string): { isLate: boolean; minutesNeeded: number } {
  const now = Date.now()
  const start = new Date(startTime).getTime()
  const travelMinutes = Math.ceil((distanceKm / 30) * 60) + 10
  const availableMinutes = Math.floor((start - now) / 60000)
  return {
    isLate: availableMinutes < travelMinutes,
    minutesNeeded: travelMinutes,
  }
}
