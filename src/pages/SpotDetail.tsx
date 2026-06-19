import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Users, Flame, ShieldCheck, BadgeCheck, Navigation, Star, Send, CheckCircle2, AlertTriangle, Timer, Car, DoorOpen, XCircle, MapPinned, X, ListChecks } from 'lucide-react'
import { useAppStore } from '@/store'
import { QUICK_REPLIES } from '@/data/mock'
import { useCountdownShort, useCountdown } from '@/hooks/useCountdown'
import { formatTime, getTravelPlan, isLockingSoon } from '@/utils/filter'
import { CURRENT_PLAYER } from '@/data/mock'
import type { CancelReason } from '@/types'

function SpotContent({ spotId }: { spotId: string | undefined }) {
  const navigate = useNavigate()
  const { spots, replies, sendReply, confirmReply, trips, checkIn, cancelTrip, getWaitlistPosition, checkNoshowTrips } = useAppStore()
  const [showConfirmAnim, setShowConfirmAnim] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState<CancelReason>('other')
  const [cancelNote, setCancelNote] = useState('')
  const [, setTick] = useState(0)

  useEffect(() => {
    checkNoshowTrips()
    const interval = setInterval(() => {
      checkNoshowTrips()
      setTick(t => t + 1)
    }, 10000)
    return () => clearInterval(interval)
  }, [checkNoshowTrips])

  const spot = spots.find(s => s.id === spotId)
  const lockCountdown = useCountdownShort(spot?.lockTime ?? new Date().toISOString())
  const startCountdown = useCountdown(spot?.startTime ?? new Date().toISOString())
  const myReply = replies.find(r => r.spotId === spotId && r.playerId === CURRENT_PLAYER.id)
  const myTrip = trips.find(t => t.spotId === spotId && t.playerId === CURRENT_PLAYER.id)
  const isConfirmed = myTrip?.status === 'confirmed'
  const isPending = myTrip?.status === 'pending'
  const isWaitlist = myTrip?.status === 'waitlist'
  const isArrived = myTrip?.status === 'arrived'
  const isCancelled = myTrip?.status === 'cancelled'
  const isMissed = myTrip?.status === 'missed'
  const isNoshow = myTrip?.status === 'noshow'
  const isFilled = spot?.isFilled

  const waitlistPosition = useMemo(() => {
    if (!spotId) return 0
    return getWaitlistPosition(spotId, CURRENT_PLAYER.id)
  }, [spotId, getWaitlistPosition, replies]) // eslint-disable-line react-hooks/exhaustive-deps

  const travelPlan = useMemo(() => {
    if (!spot) return null
    return getTravelPlan(spot.distance, spot.startTime)
  }, [spot, startCountdown]) // eslint-disable-line react-hooks/exhaustive-deps

  const isLocking = spot ? isLockingSoon(spot.lockTime) : false

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

  const handleCheckIn = () => {
    checkIn(spot.id)
    setTick(t => t + 1)
  }

  const handleCancel = () => {
    cancelTrip(spot.id, cancelReason, cancelNote)
    setShowCancelModal(false)
    setTick(t => t + 1)
  }

  const difficultyLabel = { easy: '简单', medium: '中等', hard: '烧脑' }[spot.difficulty]
  const difficultyColor = { easy: 'text-neon-green', medium: 'text-neon-orange', hard: 'text-neon-pink' }[spot.difficulty]

  const totalSlots = spot.playerCount.max
  const filledSlots = spot.currentPlayers.length

  const cancelReasons: { value: CancelReason; label: string }[] = [
    { value: 'traffic', label: '堵车，赶不到' },
    { value: 'emergency', label: '临时有事' },
    { value: 'changed_mind', label: '不想去了' },
    { value: 'other', label: '其他原因' },
  ]

  const renderStatusBanner = () => {
    if (isNoshow) {
      return (
        <div className="mb-4 p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/30">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-neon-pink" />
            <div>
              <p className="text-sm font-bold text-neon-pink">爽约</p>
              <p className="text-xs text-neon-pink/70">开场后未到店也未取消，已记录为爽约</p>
            </div>
          </div>
        </div>
      )
    }
    if (isMissed) {
      return (
        <div className="mb-4 p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/30">
          <div className="flex items-center gap-2">
            <XCircle size={16} className="text-neon-pink" />
            <div>
              <p className="text-sm font-bold text-neon-pink">已错过</p>
              <p className="text-xs text-neon-pink/70">
                {isFilled ? '车位已补满，下次手速快一点~' : '门店已确认其他玩家'}
              </p>
            </div>
          </div>
        </div>
      )
    }
    if (isWaitlist) {
      return (
        <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-2">
            <ListChecks size={16} className="text-yellow-400" />
            <div>
              <p className="text-sm font-bold text-yellow-400">候补中 · 第 {waitlistPosition} 位</p>
              <p className="text-xs text-yellow-400/70">
                {isFilled
                  ? `车位已补满，当前 ${replies.filter(r => r.spotId === spot.id && r.status === 'waitlisted').length} 人在候补`
                  : `当前缺${spot.missingCount}人，有 ${replies.filter(r => r.spotId === spot.id && r.status === 'pending').length} 人在抢`
                }
              </p>
            </div>
          </div>
        </div>
      )
    }
    if (isCancelled) {
      return (
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <X size={16} className="text-white/40" />
            <div>
              <p className="text-sm font-bold text-white/60">已取消</p>
              <p className="text-xs text-white/30">你已取消本次补位</p>
            </div>
          </div>
        </div>
      )
    }
    if (isArrived) {
      return (
        <div className="mb-4 p-3 rounded-xl bg-neon-green/10 border border-neon-green/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-neon-green" />
            <div>
              <p className="text-sm font-bold text-neon-green">已到店</p>
              <p className="text-xs text-neon-green/70">打卡成功，祝你玩得愉快！</p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

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
          {renderStatusBanner()}

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

              {isLocking && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-yellow-400">即将锁车</p>
                    <p className="text-[10px] text-yellow-400/70">
                      距离锁车不足 15 分钟，请尽快出发
                    </p>
                  </div>
                </div>
              )}

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
                <button
                  onClick={handleCheckIn}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-purple/20 text-neon-purple font-medium text-sm border border-neon-purple/30 active:scale-95 transition-transform"
                >
                  <MapPinned size={16} />
                  到店打卡
                </button>
              </div>

              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full mt-2 py-2 rounded-xl bg-night-800 text-white/30 text-xs font-medium active:scale-95 transition-transform"
              >
                临时取消
              </button>
            </div>
          )}

          {myReply && !isConfirmed && !isArrived && !isCancelled && !isMissed && !isNoshow && (
            <div className="glass rounded-2xl p-4 border border-neon-orange/20">
              <p className="text-xs text-white/40 mb-1">你已发送</p>
              <p className="text-sm text-neon-orange font-medium">「{myReply.label}」</p>
              <p className="text-xs text-white/30 mt-1">
                {isWaitlist ? `候补中，第 ${waitlistPosition} 位` : '等待门店确认中...'}
              </p>
              {isWaitlist && (
                <p className="text-[10px] text-yellow-400/50 mt-1">
                  当前有 {replies.filter(r => r.spotId === spot.id && r.status === 'pending').length} 人在抢这 {spot.missingCount} 个位置
                </p>
              )}
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

      {!isConfirmed && !isPending && !isWaitlist && !isArrived && !isCancelled && !isMissed && !isNoshow && !isFilled && (
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

      {!isConfirmed && !isPending && !isWaitlist && !isArrived && !isCancelled && !isMissed && !isNoshow && isFilled && (
        <div className="fixed bottom-0 left-0 right-0 glass-strong p-4 safe-bottom z-50">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/30">
              <XCircle size={18} className="text-neon-pink flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-neon-pink">车位已补满</p>
                <p className="text-xs text-neon-pink/60">这辆车的位置已经被抢光了，看看别的车吧</p>
              </div>
              <button
                onClick={() => navigate('/channel')}
                className="px-3 py-1.5 rounded-lg bg-neon-pink/20 text-neon-pink text-xs font-medium"
              >
                换一辆
              </button>
            </div>
          </div>
        </div>
      )}

      {(isPending || isWaitlist) && !isConfirmed && !isArrived && !isCancelled && !isMissed && !isNoshow && (
        <div className="fixed bottom-0 left-0 right-0 glass-strong p-4 safe-bottom z-50">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40">
                  {isWaitlist ? '候补中' : '等待门店确认'}
                </p>
                <p className="text-sm text-white/70 font-medium mt-0.5">「{myReply?.label}」</p>
                {isWaitlist && (
                  <p className="text-[10px] text-yellow-400/50 mt-0.5">当前排名第 {waitlistPosition} 位</p>
                )}
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

export default function SpotDetail() {
  const { id } = useParams<{ id: string }>()
  return <SpotContent spotId={id} />
}
