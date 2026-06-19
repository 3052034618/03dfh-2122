import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { Navigation, Clock, AlertTriangle, CheckCircle2, MapPin, Flame, Timer, Car, DoorOpen, XCircle, Trash2, MapPinned, X, ListChecks } from 'lucide-react'
import { useAppStore } from '@/store'
import { useCountdownShort, useCountdown } from '@/hooks/useCountdown'
import { formatTime, getTravelPlan, isLockingSoon, isStartingSoon } from '@/utils/filter'
import { CURRENT_PLAYER } from '@/data/mock'
import type { GameSpot, TripRecord, CancelReason } from '@/types'

export default function Trips() {
  const navigate = useNavigate()
  const { trips, spots, replies, checkIn, cancelTrip, removeTrip } = useAppStore()
  const [, setTick] = useState(0)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelSpotId, setCancelSpotId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState<CancelReason>('other')
  const [cancelNote, setCancelNote] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const tripSpots = useMemo(() => {
    return trips
      .filter(t => t.playerId === CURRENT_PLAYER.id)
      .map(trip => {
        const spot = spots.find(s => s.id === trip.spotId)
        const reply = replies.find(r => r.spotId === trip.spotId && r.playerId === CURRENT_PLAYER.id)
        return { trip, spot, reply }
      })
      .filter(t => t.spot)
      .sort((a, b) => {
        const timeA = new Date(a.spot!.startTime).getTime()
        const timeB = new Date(b.spot!.startTime).getTime()
        return timeA - timeB
      })
  }, [trips, spots, replies])

  const activeTrips = tripSpots.filter(t => ['confirmed', 'pending', 'waitlist', 'arrived'].includes(t.trip.status))
  const urgentCount = activeTrips.filter(t => {
    if (!t.spot) return false
    const diff = new Date(t.spot.startTime).getTime() - Date.now()
    return diff < 30 * 60 * 1000 && diff > 0 && t.trip.status !== 'arrived'
  }).length

  const noshowCount = tripSpots.filter(t => t.trip.status === 'noshow').length
  const cancelledCount = tripSpots.filter(t => t.trip.status === 'cancelled').length

  const cancelReasons: { value: CancelReason; label: string }[] = [
    { value: 'traffic', label: '堵车，赶不到' },
    { value: 'emergency', label: '临时有事' },
    { value: 'changed_mind', label: '不想去了' },
    { value: 'other', label: '其他原因' },
  ]

  const handleCancel = () => {
    if (cancelSpotId) {
      cancelTrip(cancelSpotId, cancelReason, cancelNote)
      setShowCancelModal(false)
      setCancelSpotId(null)
    }
  }

  const openCancelModal = (spotId: string) => {
    setCancelSpotId(spotId)
    setCancelReason('other')
    setCancelNote('')
    setShowCancelModal(true)
  }

  const renderTopWarning = () => {
    if (urgentCount === 0) return null

    const urgentTrip = activeTrips.find(t => {
      if (!t.spot) return false
      const diff = new Date(t.spot.startTime).getTime() - Date.now()
      return diff < 30 * 60 * 1000 && diff > 0
    })

    if (!urgentTrip || !urgentTrip.spot) return null

    const isLocking = isLockingSoon(urgentTrip.spot.lockTime)
    const travelPlan = getTravelPlan(urgentTrip.spot.distance, urgentTrip.spot.startTime)

    return (
      <div className="mb-4 p-4 rounded-2xl bg-neon-orange/10 border border-neon-orange/30">
        <div className="flex items-start gap-2">
          <AlertTriangle size={18} className="text-neon-orange flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-neon-orange">
              {isLocking ? '锁车提醒' : '到店提醒'}
            </p>
            <p className="text-xs text-neon-orange/70 mt-0.5">
              「{urgentTrip.spot.scriptName}」
              {isLocking
                ? ' 距离锁车不足 15 分钟，请尽快确认'
                : travelPlan.lateRisk.isLate
                  ? ` 路程需 ${travelPlan.travelMinutes} 分钟，可能迟到`
                  : ' 即将开场，请注意出发时间'
              }
            </p>
            <button
              onClick={() => navigate(`/spot/${urgentTrip.spot.id}`)}
              className="mt-2 px-3 py-1.5 rounded-lg bg-neon-orange/20 text-neon-orange text-xs font-medium"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    )
  }

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

        {renderTopWarning()}

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
                  key={`${trip.spotId}-${trip.playerId}`}
                  spot={spot}
                  trip={trip}
                  replyLabel={reply?.label}
                  onCheckIn={() => { checkIn(spot.id); setTick(t => t + 1) }}
                  onCancel={() => openCancelModal(spot.id)}
                  onRemove={() => { removeTrip(spot.id); setTick(t => t + 1) }}
                />
              )
            })}
          </div>
        )}

        {(noshowCount > 0 || cancelledCount > 0) && (
          <div className="mt-6 p-4 rounded-2xl glass border border-neon-pink/20">
            <div className="flex items-start gap-2">
              <XCircle size={18} className="text-neon-pink flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-neon-pink">爽约与取消记录</p>
                <p className="text-xs text-neon-pink/60 mt-0.5">
                  历史爽约 {noshowCount} 次，取消 {cancelledCount} 次，多次无故取消将影响信用
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="glass-strong rounded-3xl p-6 mx-4 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">取消行程</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 rounded-full bg-night-800"
              >
                <X size={16} className="text-white/50" />
              </button>
            </div>

            <p className="text-xs text-white/40 mb-4">请选择取消原因，多次无故取消将影响信用评分</p>

            <div className="space-y-2 mb-4">
              {cancelReasons.map(reason => (
                <button
                  key={reason.value}
                  onClick={() => setCancelReason(reason.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                    cancelReason === reason.value
                      ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange/30'
                      : 'bg-night-800 text-white/60'
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            <textarea
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
              placeholder="补充说明（选填）"
              className="w-full px-4 py-3 rounded-xl bg-night-800 text-white/70 text-sm placeholder-white/20 resize-none h-20 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl bg-night-800 text-white/50 text-sm font-medium"
              >
                我再想想
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl bg-neon-pink/20 text-neon-pink text-sm font-medium border border-neon-pink/30"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TripCard({ spot, trip, replyLabel, onCheckIn, onCancel, onRemove }: {
  spot: GameSpot
  trip: TripRecord
  replyLabel?: string
  onCheckIn?: () => void
  onCancel?: () => void
  onRemove?: () => void
}) {
  const navigate = useNavigate()
  const lockCountdown = useCountdownShort(spot.lockTime)
  const startCountdown = useCountdown(spot.startTime)
  const isConfirmed = trip.status === 'confirmed'
  const isPending = trip.status === 'pending'
  const isWaitlist = trip.status === 'waitlist'
  const isArrived = trip.status === 'arrived'
  const isCancelled = trip.status === 'cancelled'
  const isMissed = trip.status === 'missed'
  const isNoshow = trip.status === 'noshow'
  const isUrgent = lockCountdown.isUrgent && !lockCountdown.isExpired
  const hasExpired = lockCountdown.isExpired

  const travelPlan = useMemo(() => {
    return getTravelPlan(spot.distance, spot.startTime)
  }, [spot, startCountdown]) // eslint-disable-line react-hooks/exhaustive-deps

  const isLocking = isLockingSoon(spot.lockTime)
  const isStarting = isStartingSoon(spot.startTime)

  const statusConfig = {
    confirmed: { color: 'border-l-neon-green', label: '已确认', icon: CheckCircle2, textColor: 'text-neon-green' },
    pending: { color: 'border-l-neon-orange', label: '待确认', icon: Clock, textColor: 'text-neon-orange' },
    waitlist: { color: 'border-l-yellow-500', label: '候补中', icon: ListChecks, textColor: 'text-yellow-400' },
    arrived: { color: 'border-l-neon-green', label: '已到店', icon: CheckCircle2, textColor: 'text-neon-green' },
    completed: { color: 'border-l-white/20', label: '已完成', icon: CheckCircle2, textColor: 'text-white/40' },
    noshow: { color: 'border-l-neon-pink', label: '爽约', icon: AlertTriangle, textColor: 'text-neon-pink' },
    cancelled: { color: 'border-l-white/30', label: '已取消', icon: X, textColor: 'text-white/40' },
    missed: { color: 'border-l-neon-pink', label: '已错过', icon: XCircle, textColor: 'text-neon-pink' },
  }

  const config = statusConfig[trip.status]
  const StatusIcon = config.icon

  const renderRiskBadge = () => {
    if (!isConfirmed && !isWaitlist) return null
    if (travelPlan.lateRisk.isLate) {
      return (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-neon-orange text-white text-[10px] font-bold rounded-bl-lg animate-glow-breathe">
          高迟到风险
        </div>
      )
    }
    if (isLocking) {
      return (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded-bl-lg animate-glow-breathe">
          即将锁车
        </div>
      )
    }
    if (isStarting) {
      return (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-neon-orange text-white text-[10px] font-bold rounded-bl-lg animate-glow-breathe">
          即将开场
        </div>
      )
    }
    return null
  }

  return (
    <div
      onClick={() => navigate(`/spot/${spot.id}`)}
      className={`glass rounded-2xl p-4 border-l-4 ${config.color} cursor-pointer active:scale-[0.98] transition-transform overflow-hidden relative`}
    >
      {renderRiskBadge()}

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
        {isWaitlist && trip.waitlistPosition && (
          <span className="text-yellow-400/60">候补 #{trip.waitlistPosition}</span>
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

          {isLocking && !travelPlan.lateRisk.isLate && (
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <Flame size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-yellow-400">即将锁车</p>
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
            <div className="flex gap-2">
              <button
                onClick={e => { e.stopPropagation(); onCheckIn?.() }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neon-purple/15 text-neon-purple text-xs font-medium border border-neon-purple/30 active:scale-95 transition-transform"
              >
                <MapPinned size={12} />
                打卡
              </button>
              <button
                onClick={e => { e.stopPropagation() }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neon-green/15 text-neon-green text-xs font-medium border border-neon-green/30 active:scale-95 transition-transform"
              >
                <Navigation size={12} />
                导航
              </button>
            </div>
          </div>

          <button
            onClick={e => { e.stopPropagation(); onCancel?.() }}
            className="w-full mt-2 py-1.5 rounded-lg bg-night-800 text-white/30 text-[10px] font-medium active:scale-95 transition-transform"
          >
            取消行程
          </button>
        </div>
      )}

      {(isPending || isWaitlist) && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">
                {isWaitlist ? '候补中...' : '等待门店确认中...'}
              </p>
              {isWaitlist && trip.waitlistPosition && (
                <p className="text-[10px] text-yellow-400/50 mt-0.5">当前排名第 {trip.waitlistPosition} 位</p>
              )}
            </div>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-glow-breathe" />
              <span className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-glow-breathe" style={{ animationDelay: '0.3s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-glow-breathe" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>
      )}

      {isArrived && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-neon-green" />
              <p className="text-xs text-neon-green/70">已到店，祝你玩得愉快！</p>
            </div>
          </div>
        </div>
      )}

      {(hasExpired || isCancelled || isMissed || isNoshow) && isConfirmed && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">
              {isCancelled ? '已取消' : isMissed ? '已错过' : isNoshow ? '爽约' : '已开场'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={e => {
                  e.stopPropagation()
                  onRemove?.()
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
