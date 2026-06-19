import { useNavigate } from 'react-router-dom'
import { Flame, Users, MapPin, Clock, BadgeCheck, ChevronRight, Zap, ShieldCheck } from 'lucide-react'
import type { GameSpot } from '@/types'
import { useCountdownShort } from '@/hooks/useCountdown'

function SpotCard({ spot, index }: { spot: GameSpot; index: number }) {
  const navigate = useNavigate()
  const lockCountdown = useCountdownShort(spot.lockTime)
  const startCountdown = useCountdownShort(spot.startTime)
  const isUrgent = lockCountdown.isUrgent
  const discount = Math.round((1 - spot.currentPrice / spot.originalPrice) * 100)

  return (
    <div
      onClick={() => navigate(`/spot/${spot.id}`)}
      className={`glass rounded-2xl p-4 cursor-pointer transition-all duration-300 active:scale-[0.98] animate-slide-up relative overflow-hidden ${
        isUrgent ? 'animate-pulse-neon' : 'hover:border-white/10'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {isUrgent && (
        <div className="absolute top-0 right-0 px-2.5 py-1 bg-neon-orange text-white text-[10px] font-bold rounded-bl-xl flex items-center gap-1">
          <Zap size={10} />
          即将锁车
        </div>
      )}

      <div className="flex gap-3">
        <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-night-700">
          <img
            src={spot.scriptCover}
            alt={spot.scriptName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{spot.scriptName}</h3>
              <p className="text-xs text-white/40 mt-0.5">{spot.storeName}</p>
            </div>
            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
              spot.missingCount <= 2 ? 'bg-neon-orange/20 text-neon-orange' : 'bg-neon-green/10 text-neon-green'
            }`}>
              <Users size={10} />
              缺{spot.missingCount}人
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {spot.genreTypes.map(g => (
              <span key={g} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-night-700 text-white/50">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MapPin size={11} className="text-white/30" />
            <span className="text-xs text-white/40">{spot.distance}km</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} className="text-white/30" />
            <span className="text-xs text-white/40">{spot.duration}h</span>
          </div>
          {spot.dmNewbieFriendly && (
            <div className="flex items-center gap-0.5">
              <ShieldCheck size={11} className="text-neon-green/60" />
              <span className="text-[10px] text-neon-green/60">新手OK</span>
            </div>
          )}
          {spot.acceptCrossGender && (
            <div className="flex items-center gap-0.5">
              <BadgeCheck size={11} className="text-neon-purple/60" />
              <span className="text-[10px] text-neon-purple/60">可反串</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-white/30 line-through mr-1">¥{spot.originalPrice}</span>
            <span className="text-sm font-bold neon-text-orange">¥{spot.currentPrice}</span>
          </div>
          <div className="px-1.5 py-0.5 rounded bg-neon-orange/20 text-neon-orange text-[10px] font-bold">
            -{discount}%
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <div className={`flex items-center gap-1.5 text-xs font-mono ${
          isUrgent ? 'text-neon-orange' : 'text-white/50'
        }`}>
          <Flame size={12} className={isUrgent ? 'text-neon-orange' : 'text-white/30'} />
          <span>锁车 {lockCountdown.isExpired ? '已锁' : `${lockCountdown.minutes}:${String(lockCountdown.seconds).padStart(2, '0')}`}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/30">
          <span>{startCountdown.isExpired ? '已开场' : `${startCountdown.minutes}分钟后开`}</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  )
}

export default SpotCard
