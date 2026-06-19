import { useState, useEffect, useCallback } from 'react'

export function useCountdown(targetTime: string) {
  const calculateTimeLeft = useCallback(() => {
    const target = new Date(targetTime).getTime()
    const now = Date.now()
    const diff = target - now
    if (diff <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isUrgent: false }
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    const isUrgent = diff < 1800000
    return { total: diff, hours, minutes, seconds, isExpired: false, isUrgent }
  }, [targetTime])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  return timeLeft
}

export function useCountdownShort(targetTime: string) {
  const calculateTimeLeft = useCallback(() => {
    const target = new Date(targetTime).getTime()
    const now = Date.now()
    const diff = target - now
    if (diff <= 0) return { total: 0, minutes: 0, seconds: 0, isExpired: true, isUrgent: false }
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    const isUrgent = diff < 1800000
    return { total: diff, minutes, seconds, isExpired: false, isUrgent }
  }, [targetTime])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  return timeLeft
}
