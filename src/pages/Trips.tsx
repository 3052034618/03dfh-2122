import { useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { Navigation, Clock, AlertTriangle, CheckCircle2, MapPin, Flame, Timer, Car, DoorOpen, XCircle, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store'
import { useCountdownShort, useCountdown } from '@/hooks/useCountdown'
import { formatTime, calculateDepartureTime, calculateArrivalTime, isAtRiskOfLate } from '@/utils/filter'
import type { GameSpot, TripRecord } from '@/types'

export default function Trips() {
  const navigate = useNavigate()
  const { trips, spots, replies } = useAppStore()
  const [, setTick] = useState(0)

  const tripSpots = useMemo(() => {
    return trips.map(trip => {
      const spot = spots.find(s => s.id === trip.spotId)
      const reply = replies.find(r => r.spotId === trip.spotId)
      return { trip, spot, reply }
    }).filter(t => t.spot).sort((a, b) => {
      const timeA = new Date(a.spot!.startTime).getTime()
      const timeB = new Date(b.spot!.startTime).getTime()
      return timeA - timeB
    })
  }, [trips, spots, replies])

  const confirmedTrips = tripSpots.filter(t => t.trip.status === 'confirmed' || t.trip.status === 'pending')
  const urgentCount = confirmedTrips.filter(t => {
    if (!t.spot) return false
    const diff = new Date(t.spot.startTime).getTime() - Date.now()
    return diff < 30 * 60 * 1000 && diff > 0
  }).length

  return (
    <div className="min-h-screen bg-gradient-night pb-24">
      <div className="bg-orb w-64 h-64 bg-neon-purple top-[-40px] right-[-40px]" />
      <div className="bg-orb w-56 h-56 bg-neon-orange/40 bottom-20 left-[-30px]" style={{ animationDelay: '-10s' }} />

      <div className="relative z-10 px-4 pt-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-black text-white">我的行程</h1>
          {urgentCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neon-orange/20 text-neon-orange animate-glow-breathe">
              <AlertTriangle size={12} />
              <span className="text-[10px] font-bold">{urgentCount}个紧急</span>
            </div>
          )}
        </div>
        <p className="text-xs text-white/30 mb-6">已确认的捡漏车位，别忘了准时到店</p>

        {urgentCount > 0 && (
          <div className="mb-4 p-4 rounded-2xl bg-neon-orange/10 border border-neon-orange/30">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="text-neon-orange flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-neon-orange">到店提醒</p>
                <p className="text-xs text-neon-orange/70 mt-0.5">
                  有 {urgentCount} 辆车即将开场，请注意出发时间，避免爽约
                </p>
              </div>
            </div>
          </div>
        )}

        {tripSpots.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎫</p>
            <p className="text-white/40 text-sm">还没有行程记录</p>
            <p className="text-white/20 text-xs mt-1">去捡漏频道找找看</p>
            <button
              onClick={() => navigate('/channel')}
              className="mt-4 px-6 py-2.5 rounded-xl bg-neon-orange text-white text-sm font-bold active:scale-95"
            >
              去捡漏
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tripSpots.map(({ trip, spot, reply }) => {
              if (!spot) return null
              return (
                <TripCard
                  key={trip.spotId}
                  spot={spot}
                  trip={trip}
                  replyLabel={reply?.label}
                  onRefresh={() => setTick(t => t + 1)}
                />
              )
            })}
          </div>
        )}

        {tripSpots.some(t => t.trip.status === 'noshow') && (
          <div className="mt-6 p-4 rounded-2xl glass border border-neon-pink/20">
            <div className="flex items-start gap-2">
              <XCircle size={18} className="text-neon-pink flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-neon-pink">爽约记录</p>
                <p className="text-xs text-neon-pink/60 mt-0.5">
                  历史爽约 {tripSpots.filter(t => t.trip.status === 'noshow').length} 次，多次爽约将影响信用
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TripCard({ spot, trip, replyLabel, onRefresh }: { spot: GameSpot; trip: TripRecord; replyLabel?: string; onRefresh?: () => void }) {
  const navigate = useNavigate()
  const lockCountdown = useCountdownShort(spot.lockTime)
  const startCountdown = useCountdown(spot.startTime)
  const isConfirmed = trip.status === 'confirmed'
  const isPending = trip.status === 'pending'
  const isUrgent = lockCountdown.isUrgent && !lockCountdown.isExpired
  const hasExpired = lockCountdown.isExpired

  const travelPlan = useMemo(() => {
    const departureTime = calculateDepartureTime(spot.distance, spot.startTime)
    const arrivalTime = calculateArrivalTime(spot.distance)
    const lateRisk = isAtRiskOfLate(spot.distance, spot.startTime)
    const startDiff = new Date(spot.startTime).getTime() - Date.now()
    const minutesToStart = Math.max(0, Math.floor(startDiff / 60000))

    return {
      departureTime,
      arrivalTime,
      lateRisk,
      minutesToStart,
    }
  }, [spot])

  const statusConfig = {
    confirmed: { color: 'border-l-neon-green', label: '已确认', icon: CheckCircle2, textColor: 'text-neon-green' },
    pending: { color: 'border-l-neon-orange', label: '待确认', icon: Clock, textColor: 'text-neon-orange' },
    completed: { color: 'border-l-white/20', label: '已完成', icon: CheckCircle2, textColor: 'text-white/40' },
    noshow: { color: 'border-l-neon-pink', label: '爽约', icon: AlertTriangle, textColor: 'text-neon-pink' },
  }

  const config = statusConfig[trip.status]
  const StatusIcon = config.icon

  return (
    <div
      onClick={() => navigate(`/spot/${spot.id}`)}
      className={`glass rounded-2xl p-4 border-l-4 ${config.color} cursor-pointer active:scale-[0.98] transition-transform overflow-hidden`}
    >
      {isUrgent && isConfirmed && (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-neon-orange text-white text-[10px] font-bold rounded-bl-lg animate-glow-breathe">
          即将开场
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">{spot.scriptName}</h3>
          </div>
          <p className="text-xs text-white/40 mt-0.5">{spot.storeName} · {spot.district}</p>
        </div>
        <div className={`flex items-center gap-1 ${config.textColor}`}>
          <StatusIcon size={14} />
          <span className="text-xs font-medium">{config.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <MapPin size={11} /> {spot.distance}km
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} /> {spot.duration}h
        </span>
        {replyLabel && (
          <span className="text-neon-orange/60 truncate">「{replyLabel}」</span>
        )}
      </div>

      {isConfirmed && !hasExpired && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center py-2 px-1 rounded-lg bg-night-800/50">
              <Timer size={12} className="text-neon-orange mx-auto mb-1" />
              <p className="text-[9px] text-white/40">开场</p>
              <p className="text-[11px] font-mono font-bold text-white">
                {travelPlan.minutesToStart > 60
                  ? `${Math.floor(travelPlan.minutesToStart / 60)}h${travelPlan.minutesToStart % 60}m`
                  : `${travelPlan.minutesToStart}m`
                }
              </p>
            </div>
            <div className="text-center py-2 px-1 rounded-lg bg-night-800/50">
              <Car size={12} className="text-neon-purple mx-auto mb-1" />
              <p className="text-[9px] text-white/40">出发</p>
              <p className="text-[11px] font-mono font-bold text-white">
                {formatTime(travelPlan.departureTime.toISOString())}
              </p>
            </div>
            <div className="text-center py-2 px-1 rounded-lg bg-night-800/50">
              <DoorOpen size={12} className="text-neon-green mx-auto mb-1" />
              <p className="text-[9px] text-white/40">到店</p>
              <p className="text-[11px] font-mono font-bold text-white">
                {formatTime(travelPlan.arrivalTime.toISOString())}
              </p>
            </div>
          </div>

          {travelPlan.lateRisk.isLate && (
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-neon-orange/10 border border-neon-orange/30">
              <AlertTriangle size={12} className="text-neon-orange flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-neon-orange">高迟到风险</p>
                <p className="text-[9px] text-neon-orange/70">
                  路程需 {travelPlan.lateRisk.minutesNeeded} 分钟，时间紧张
                </p>
              </div>
            </div>
          )}

          {isUrgent && !travelPlan.lateRisk.isLate && (
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <Flame size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-yellow-400">即将开场</p>
                <p className="text-[9px] text-yellow-400/70">
                  距离锁车 {lockCountdown.minutes}:{String(lockCountdown.seconds).padStart(2, '0')}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className={`flex items-center gap-1 text-xs font-mono ${isUrgent ? 'neon-text-orange' : 'text-white/50'}`}>
              <Flame size={12} />
              <span>
                {startCountdown.isExpired ? '已开场' :
                  `${startCountdown.hours > 0 ? `${startCountdown.hours}h` : ''}${startCountdown.minutes}m`
                }
              </span>
            </div>
            <button
              onClick={e => { e.stopPropagation() }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-neon-green/15 text-neon-green text-xs font-medium border border-neon-green/30 active:scale-95 transition-transform"
            >
              <Navigation size={12} />
              导航
            </button>
          </div>
        </div>
      )}

      {isPending && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40">等待门店确认中...</p>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-glow-breathe" />
              <span className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-glow-breathe" style={{ animationDelay: '0.3s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-glow-breathe" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>
      )}

      {hasExpired && isConfirmed && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">已开场</p>
            <div className="flex gap-2">
              <button
                onClick={e => {
                  e.stopPropagation()
                  onRefresh?.()
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-night-700 text-white/30 text-xs"
              >
                <Trash2 size={10} />
                移除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
