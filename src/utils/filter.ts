import type { GameSpot } from '@/types'

export const TWO_HOURS_MS = 2 * 60 * 60 * 1000
export const TRAVEL_SPEED_KMH = 30
export const BUFFER_MINUTES = 10
export const LOCK_WARNING_MINUTES = 15
export const URGENT_MINUTES = 30

export function isValidSpot(spot: GameSpot): boolean {
  const now = Date.now()
  const startTime = new Date(spot.startTime).getTime()
  const diff = startTime - now

  if (diff <= 0) return false
  if (diff > TWO_HOURS_MS) return false
  if (spot.missingCount <= 0) return false
  if (spot.isFilled) return false

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

export function calculateTravelMinutes(distanceKm: number): number {
  return Math.ceil((distanceKm / TRAVEL_SPEED_KMH) * 60) + BUFFER_MINUTES
}

export function calculateArrivalTime(distanceKm: number): Date {
  const minutesToTravel = calculateTravelMinutes(distanceKm)
  return new Date(Date.now() + minutesToTravel * 60000)
}

export function calculateDepartureTime(distanceKm: number, startTime: string): Date {
  const start = new Date(startTime).getTime()
  const travelMs = (distanceKm / TRAVEL_SPEED_KMH) * 60 * 60 * 1000
  const bufferMs = BUFFER_MINUTES * 60 * 1000
  return new Date(start - travelMs - bufferMs)
}

export function isAtRiskOfLate(distanceKm: number, startTime: string): { isLate: boolean; minutesNeeded: number } {
  const now = Date.now()
  const start = new Date(startTime).getTime()
  const travelMinutes = calculateTravelMinutes(distanceKm)
  const availableMinutes = Math.floor((start - now) / 60000)
  return {
    isLate: availableMinutes < travelMinutes,
    minutesNeeded: travelMinutes,
  }
}

export function getTravelPlan(distanceKm: number, startTime: string) {
  const departureTime = calculateDepartureTime(distanceKm, startTime)
  const arrivalTime = calculateArrivalTime(distanceKm)
  const lateRisk = isAtRiskOfLate(distanceKm, startTime)
  const startDiff = new Date(startTime).getTime() - Date.now()
  const minutesToStart = Math.max(0, Math.floor(startDiff / 60000))
  const travelMinutes = calculateTravelMinutes(distanceKm)

  return {
    departureTime,
    arrivalTime,
    lateRisk,
    minutesToStart,
    travelMinutes,
  }
}

export function isLockingSoon(lockTime: string): boolean {
  const diff = new Date(lockTime).getTime() - Date.now()
  return diff > 0 && diff < LOCK_WARNING_MINUTES * 60 * 1000
}

export function isStartingSoon(startTime: string): boolean {
  const diff = new Date(startTime).getTime() - Date.now()
  return diff > 0 && diff < URGENT_MINUTES * 60 * 1000
}
