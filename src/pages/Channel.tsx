import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import SpotCard from '@/components/SpotCard'
import { GENRE_TYPES } from '@/data/mock'
import type { GenreType } from '@/types'
import { useAppStore } from '@/store'

const GENRE_EMOJI: Record<GenreType, string> = {
  '欢乐': '😆', '恐怖': '👻', '情感': '💔', '硬核': '🧠',
  '阵营': '⚔️', '机制': '⚙️', '还原': '🔍', '其他': '🎲',
}

export default function Channel() {
  const { spots, preference, activeGenreFilter, setActiveGenreFilter } = useAppStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredSpots = spots.filter(spot => {
    if (activeGenreFilter && !spot.genreTypes.includes(activeGenreFilter)) return false
    if (preference.districts.length > 0 && !preference.districts.includes(spot.district)) return false
    if (spot.distance > preference.maxDistance) return false
    if (preference.genreTypes.length > 0 && !spot.genreTypes.some(g => preference.genreTypes.includes(g))) return false
    if (preference.durationRange.length > 0) {
      const durationMatch = preference.durationRange.some(range => {
        if (range === '3h以内') return spot.duration <= 3
        if (range === '3-5h') return spot.duration > 3 && spot.duration <= 5
        if (range === '5-7h') return spot.duration > 5 && spot.duration <= 7
        if (range === '7h+') return spot.duration > 7
        return true
      })
      if (!durationMatch) return false
    }
    if (!preference.acceptCrossGender && !spot.acceptCrossGender) return false
    return true
  })

  const nearestSpot = filteredSpots.length > 0 ? filteredSpots[0] : null
  const [nearestTime, setNearestTime] = useState({ minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!nearestSpot) return
    const timer = setInterval(() => {
      const target = new Date(nearestSpot.startTime).getTime()
      const diff = target - Date.now()
      if (diff <= 0) {
        setNearestTime({ minutes: 0, seconds: 0 })
        return
      }
      setNearestTime({
        minutes: Math.floor(diff / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [nearestSpot])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-night pb-24">
      <div className="bg-orb w-80 h-80 bg-neon-orange top-[-80px] left-[-80px]" />
      <div className="bg-orb w-64 h-64 bg-neon-green/50 top-32 right-[-60px]" style={{ animationDelay: '-5s' }} />

      <div className="relative z-10">
        {nearestSpot && (
          <div className="px-4 pt-6 pb-4">
            <div className="glass rounded-2xl p-5 text-center neon-border">
              <p className="text-xs text-white/40 mb-1">最近开本倒计时</p>
              <div className="font-mono text-4xl font-bold neon-text-orange tracking-wider">
                {String(nearestTime.minutes).padStart(2, '0')}:{String(nearestTime.seconds).padStart(2, '0')}
              </div>
              <p className="text-xs text-white/30 mt-1">{nearestSpot.scriptName} · {nearestSpot.storeName}</p>
            </div>
          </div>
        )}

        <div className="px-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
              <button
                onClick={() => setActiveGenreFilter(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !activeGenreFilter
                    ? 'bg-neon-orange text-white'
                    : 'glass text-white/50'
                }`}
              >
                全部
              </button>
              {GENRE_TYPES.map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGenreFilter(activeGenreFilter === g ? null : g)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeGenreFilter === g
                      ? 'bg-neon-orange text-white'
                      : 'glass text-white/50'
                  }`}
                >
                  <span>{GENRE_EMOJI[g]}</span>
                  {g}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              className="flex-shrink-0 p-2 glass rounded-full"
            >
              <RefreshCw
                size={16}
                className={`text-neon-orange transition-transform duration-700 ${isRefreshing ? 'animate-spin-slow' : ''}`}
              />
            </button>
          </div>
        </div>

        <div className="px-4 space-y-3">
          {filteredSpots.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🌑</p>
              <p className="text-white/40 text-sm">暂无匹配的捡漏车位</p>
              <p className="text-white/20 text-xs mt-1">试试调整筛选条件</p>
            </div>
          ) : (
            filteredSpots.map((spot, i) => (
              <SpotCard key={spot.id} spot={spot} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
