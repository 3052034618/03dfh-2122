import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Users, Flame, ShieldCheck, BadgeCheck, Navigation, Star, Send, CheckCircle2, AlertTriangle, Timer, Car, DoorOpen } from 'lucide-react'
import { useAppStore } from '@/store'
import { QUICK_REPLIES } from '@/data/mock'
import { useCountdownShort, useCountdown } from '@/hooks/useCountdown'
import { formatTime, calculateDepartureTime, calculateArrivalTime, isAtRiskOfLate } from '@/utils/filter'

function SpotContent({ spotId }: { spotId: string | undefined }) {
  const navigate = useNavigate()
  const { spots, replies, sendReply, confirmReply, trips } = useAppStore()
  const [showConfirmAnim, setShowConfirmAnim] = useState(false)
  const [, setTick] = useState(0)

  const spot = spots.find(s => s.id === spotId)
  const lockCountdown = useCountdownShort(spot?.lockTime ?? new Date().toISOString())
  const startCountdown = useCountdown(spot?.startTime ?? new Date().toISOString())
  const myReply = replies.find(r => r.spotId === spotId)
  const myTrip = trips.find(t => t.spotId === spotId)
  const isConfirmed = myTrip?.status === 'confirmed'
  const isPending = myTrip?.status === 'pending'

  const travelPlan = useMemo(() => {
    if (!spot) return null
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
      travelMinutes: Math.ceil((spot.distance / 30) * 60) + 10,
    }
  }, [spot])

  if (!spot) {
    return (
      <div className="min-h-screen bg-gradient-night flex items-center justify-center">
        <p className="text-white/40">车位不存在</p>
      </div>
    )
  }

  const handleReply = (replyId: string, label: string, type: 'confirm' | 'pending' | 'conditional') => {
    sendReply(spot.id, replyId, label, type)
    setTick(t => t + 1)
  }

  const handleSimConfirm = () => {
    confirmReply(spot.id)
    setShowConfirmAnim(true)
    setTimeout(() => setShowConfirmAnim(false), 2000)
  }

  const difficultyLabel = { easy: '简单', medium: '中等', hard: '烧脑' }[spot.difficulty]
  const difficultyColor = { easy: 'text-neon-green', medium: 'text-neon-orange', hard: 'text-neon-pink' }[spot.difficulty]

  const totalSlots = spot.playerCount.max
  const filledSlots = spot.currentPlayers.length

  return (
    <div className="min-h-screen bg-gradient-night pb-28">
      <div className="bg-orb w-72 h-72 bg-neon-orange top-[-60px] left-[-60px]" />
      <div className="bg-orb w-60 h-60 bg-neon-purple bottom-40 right-[-50px]" style={{ animationDelay: '-8s' }} />

      <div className="relative z-10">
        <div className="relative h-52 overflow-hidden">
          <img
            src={spot.scriptCover}
            alt={spot.scriptName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/60 to-transparent" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 glass rounded-full"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-xl font-black text-white">{spot.scriptName}</h1>
            <p className="text-sm text-white/50 mt-0.5">{spot.storeName}</p>
          </div>
        </div>

        <div className="px-4 space-y-4 mt-2">
          <div className="flex gap-2 flex-wrap">
            {spot.genreTypes.map(g => (
              <span key={g} className="px-2.5 py-1 rounded-full text-xs font-medium bg-night-700 text-neon-orange border border-neon-orange/20">
                {g}
              </span>
            ))}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-night-700 ${difficultyColor} border border-current/20`}>
              {difficultyLabel}
            </span>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/60">锁车倒计时</span>
              <div className={`flex items-center gap-1.5 font-mono text-lg font-bold ${
                lockCountdown.isUrgent ? 'neon-text-orange' : 'text-white/80'
              }`}>
                <Flame size={16} className={lockCountdown.isUrgent ? 'text-neon-orange' : 'text-white/40'} />
                {lockCountdown.isExpired ? '已锁车' : `${lockCountdown.minutes}:${String(lockCountdown.seconds).padStart(2, '0')}`}
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-night-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  lockCountdown.isUrgent ? 'bg-neon-orange' : 'bg-neon-green'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (lockCountdown.total / 7200000) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-white/30">最晚锁车时间 {formatTime(spot.lockTime)}</span>
              <span className="text-[10px] text-white/30">
                开场倒计时 {startCountdown.isExpired ? '已开场' :
                  `${startCountdown.hours > 0 ? `${startCountdown.hours}h` : ''}${startCountdown.minutes}m`
                }
              </span>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/60">当前阵容</span>
              <span className={`text-sm font-bold ${spot.missingCount <= 2 ? 'neon-text-orange' : 'text-neon-green'}`}>
                缺{spot.missingCount}人 · {filledSlots}/{totalSlots}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {spot.currentPlayers.map(p => (
                <div key={p.id} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    p.isConfirmed
                      ? p.gender === 'male' ? 'bg-blue-500/30 text-blue-300' : 'bg-pink-500/30 text-pink-300'
                      : 'bg-night-700 text-white/30'
                  }`}>
                    {p.name[0]}
                  </div>
                  <span className="text-[10px] text-white/40">{p.name}</span>
                  {p.role && <span className="text-[10px] text-neon-purple/60">{p.role}</span>}
                </div>
              ))}
              {Array.from({ length: spot.missingCount }).map((_, i) => (
                <div key={`empty-${i}`} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/10 animate-glow-breathe flex items-center justify-center">
                    <Users size={14} className="text-white/20" />
                  </div>
                  <span className="text-[10px] text-white/20">等你</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-white/60">捡漏价</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black neon-text-orange">¥{spot.currentPrice}</span>
                  <span className="text-sm text-white/30 line-through">¥{spot.originalPrice}</span>
                  <span className="px-1.5 py-0.5 rounded bg-neon-orange/20 text-neon-orange text-[10px] font-bold">
                    省¥{spot.originalPrice - spot.currentPrice}
                  </span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <MapPin size={11} />
                  {spot.distance}km · {spot.district}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Clock size={11} />
                  {spot.duration}小时
                </div>
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Star size={11} className="text-neon-orange/50" />
                  DM {spot.dmName}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {spot.dmNewbieFriendly && (
                <span className="flex items-center gap-1 text-[10px] text-neon-green/70">
                  <ShieldCheck size={11} /> 新手友好
                </span>
              )}
              {spot.acceptCrossGender && (
                <span className="flex items-center gap-1 text-[10px] text-neon-purple/70">
                  <BadgeCheck size={11} /> 可反串
                </span>
              )}
            </div>
          </div>

          {isConfirmed && travelPlan && (
            <div className="glass rounded-2xl p-4 neon-border-green">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-neon-green" />
                <span className="text-sm font-bold text-neon-green">门店已确认 · 到店计划</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-night-800/50">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Timer size={12} className="text-neon-orange" />
                    <span>距离开场</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-white">
                    {travelPlan.minutesToStart > 60
                      ? `${Math.floor(travelPlan.minutesToStart / 60)}h ${travelPlan.minutesToStart % 60}m`
                      : `${travelPlan.minutesToStart} 分钟`
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-night-800/50">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Car size={12} className="text-neon-purple" />
                    <span>预计出发</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-white">
                    {formatTime(travelPlan.departureTime.toISOString())}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-night-800/50">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <DoorOpen size={12} className="text-neon-green" />
                    <span>预计到店</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-white">
                    {formatTime(travelPlan.arrivalTime.toISOString())}
                  </span>
                </div>
              </div>

              {travelPlan.lateRisk.isLate && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-neon-orange/10 border border-neon-orange/30">
                  <AlertTriangle size={14} className="text-neon-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-neon-orange">迟到风险警告</p>
                    <p className="text-[10px] text-neon-orange/70 mt-0.5">
                      路程约需 {travelPlan.lateRisk.minutesNeeded} 分钟，时间非常紧张，建议立即出发
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-green/20 text-neon-green font-medium text-sm active:scale-95 transition-transform">
                  <Navigation size={16} />
                  导航到店
                </button>
                <button className="px-4 py-3 rounded-xl bg-night-800 text-white/50 text-xs active:scale-95 transition-transform">
                  地图
                </button>
              </div>
            </div>
          )}

          {myReply && !isConfirmed && (
            <div className="glass rounded-2xl p-4 border border-neon-orange/20">
              <p className="text-xs text-white/40 mb-1">你已发送</p>
              <p className="text-sm text-neon-orange font-medium">「{myReply.label}」</p>
              <p className="text-xs text-white/30 mt-1">等待门店确认中...</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSimConfirm}
                  className="flex-1 px-3 py-2 rounded-lg bg-neon-green/10 text-neon-green text-xs font-medium"
                >
                  模拟门店确认
                </button>
                <button
                  onClick={() => {
                    const replies = QUICK_REPLIES
                    const otherReply = replies.find(r => r.id !== myReply.replyId)
                    if (otherReply) {
                      sendReply(spot.id, otherReply.id, otherReply.label, otherReply.type)
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-night-700 text-white/40 text-xs font-medium"
                >
                  更换回复
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isConfirmed && !isPending && (
        <div className="fixed bottom-0 left-0 right-0 glass-strong p-4 safe-bottom z-50">
          <div className="max-w-md mx-auto">
            <p className="text-[10px] text-white/30 mb-2">快捷回复</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {QUICK_REPLIES.map(reply => {
                const isActive = myReply?.replyId === reply.id
                const typeStyles = {
                  confirm: isActive ? 'bg-neon-orange text-white' : 'bg-neon-orange/10 text-neon-orange border border-neon-orange/30',
                  pending: isActive ? 'bg-yellow-500 text-white' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
                  conditional: isActive ? 'bg-neon-purple text-white' : 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30',
                }
                return (
                  <button
                    key={reply.id}
                    onClick={() => handleReply(reply.id, reply.label, reply.type)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-medium transition-all whitespace-nowrap active:scale-95 ${typeStyles[reply.type]}`}
                  >
                    {isActive && <Send size={10} className="inline mr-1" />}
                    {reply.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {isPending && !isConfirmed && (
        <div className="fixed bottom-0 left-0 right-0 glass-strong p-4 safe-bottom z-50">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40">等待门店确认</p>
                <p className="text-sm text-white/70 font-medium mt-0.5">「{myReply?.label}」</p>
              </div>
              <button
                onClick={handleSimConfirm}
                className="px-4 py-2 rounded-lg bg-neon-green/10 text-neon-green text-xs font-medium"
              >
                模拟确认
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmAnim && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="glass-strong rounded-3xl p-8 text-center animate-slide-up">
            <CheckCircle2 size={56} className="text-neon-green mx-auto mb-3" />
            <p className="text-lg font-bold text-white">确认成功！</p>
            <p className="text-sm text-white/50 mt-1">请准时到店，爽约将影响信用</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SpotDetail() {
  const { id } = useParams<{ id: string }>()
  return <SpotContent spotId={id} />
}
