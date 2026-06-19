import { useNavigate } from 'react-router-dom'
import { Navigation, Clock, AlertTriangle, CheckCircle2, MapPin, Flame } from 'lucide-react'
import { useAppStore } from '@/store'
import { useCountdownShort } from '@/hooks/useCountdown'
import type { GameSpot, TripRecord } from '@/types'

export default function Trips() {
  const navigate = useNavigate()
  const { trips, spots, replies } = useAppStore()

  const tripSpots = trips.map(trip => {
    const spot = spots.find(s => s.id === trip.spotId)
    const reply = replies.find(r => r.spotId === trip.spotId)
    return { trip, spot, reply }
  }).filter(t => t.spot)

  return (
    <div className="min-h-screen bg-gradient-night pb-24">
      <div className="bg-orb w-64 h-64 bg-neon-purple top-[-40px] right-[-40px]" />
      <div className="bg-orb w-56 h-56 bg-neon-orange/40 bottom-20 left-[-30px]" style={{ animationDelay: '-10s' }} />

      <div className="relative z-10 px-4 pt-6">
        <h1 className="text-xl font-black text-white mb-1">我的行程</h1>
        <p className="text-xs text-white/30 mb-6">已确认的捡漏车位，别忘了准时到店</p>

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
          <div className="space-y-3">
            {tripSpots.map(({ trip, spot, reply }) => {
              if (!spot) return null
              return <TripCard key={trip.spotId} spot={spot} trip={trip} replyLabel={reply?.label} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function TripCard({ spot, trip, replyLabel }: { spot: GameSpot; trip: TripRecord; replyLabel?: string }) {
  const navigate = useNavigate()
  const lockCountdown = useCountdownShort(spot.lockTime)
  const isConfirmed = trip.status === 'confirmed'
  const isUrgent = lockCountdown.isUrgent && !lockCountdown.isExpired

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
      className={`glass rounded-2xl p-4 border-l-4 ${config.color} cursor-pointer active:scale-[0.98] transition-transform`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">{spot.scriptName}</h3>
          <p className="text-xs text-white/40 mt-0.5">{spot.storeName} · {spot.district}</p>
        </div>
        <div className={`flex items-center gap-1 ${config.textColor}`}>
          <StatusIcon size={14} />
          <span className="text-xs font-medium">{config.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <MapPin size={11} /> {spot.distance}km
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} /> {spot.duration}h
        </span>
        {replyLabel && (
          <span className="text-neon-orange/60">「{replyLabel}」</span>
        )}
      </div>

      {isConfirmed && !lockCountdown.isExpired && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className={`flex items-center gap-1 text-xs font-mono ${isUrgent ? 'neon-text-orange' : 'text-white/50'}`}>
            <Flame size={12} />
            锁车 {lockCountdown.minutes}:{String(lockCountdown.seconds).padStart(2, '0')}
          </div>
          <button
            onClick={e => { e.stopPropagation() }}
            className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-neon-orange/10 text-neon-orange text-xs font-medium"
          >
            <Navigation size={12} />
            导航
          </button>
        </div>
      )}

      {isConfirmed && isUrgent && (
        <div className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-orange/5 border border-neon-orange/20">
          <AlertTriangle size={12} className="text-neon-orange" />
          <span className="text-[10px] text-neon-orange/80">请尽快出发，距离锁车仅剩{lockCountdown.minutes}分钟</span>
        </div>
      )}
    </div>
  )
}
