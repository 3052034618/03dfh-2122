import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Clock, MapPin, Users } from 'lucide-react'
import { useAppStore } from '@/store'
import { formatTime } from '@/utils/filter'
import type { ReplyRecord, GameSpot } from '@/types'

export default function StoreQueue() {
  const navigate = useNavigate()
  const { getStoreQueue, confirmPlayer, rejectPlayer, simulateOtherReplies } = useAppStore()
  const [, setTick] = useState(0)

  const queue = useMemo(() => getStoreQueue(), [getStoreQueue, setTick]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = (replyId: string, spotId: string) => {
    confirmPlayer(replyId, spotId)
    setTick(t => t + 1)
  }

  const handleReject = (replyId: string, spotId: string) => {
    rejectPlayer(replyId, spotId)
    setTick(t => t + 1)
  }

  const handleSimulate = (spotId: string) => {
    simulateOtherReplies(spotId)
    setTick(t => t + 1)
  }

  const pendingCount = queue.filter(q => q.reply.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-night pb-24">
      <div className="bg-orb w-64 h-64 bg-neon-orange/40 top-[-40px] left-[-40px]" />
      <div className="bg-orb w-56 h-56 bg-neon-purple/30 bottom-20 right-[-30px]" style={{ animationDelay: '-10s' }} />

      <div className="relative z-10 px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 glass rounded-full"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">门店补位处理</h1>
            <p className="text-xs text-white/30">处理玩家发来的补位请求</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full glass">
            <Clock size={14} className="text-neon-orange" />
            <span className="text-sm text-white/70">
              待处理 <span className="font-bold text-neon-orange">{pendingCount}</span> 条
            </span>
          </div>
          <button
            onClick={() => {
              const firstSpotId = queue[0]?.spot?.id
              if (firstSpotId) handleSimulate(firstSpotId)
            }}
            className="px-3 py-2 rounded-full bg-neon-purple/20 text-neon-purple text-xs font-medium border border-neon-purple/30"
          >
            模拟其他玩家抢位
          </button>
        </div>

        {pendingCount === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-white/40 text-sm">暂无待处理请求</p>
            <p className="text-white/20 text-xs mt-1">玩家发送回复后会在这里显示</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map(({ reply, spot }) => (
              <QueueItem
                key={reply.id}
                reply={reply}
                spot={spot}
                onConfirm={() => handleConfirm(reply.id, spot.id)}
                onReject={() => handleReject(reply.id, spot.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QueueItem({ reply, spot, onConfirm, onReject }: {
  reply: ReplyRecord
  spot: GameSpot
  onConfirm: () => void
  onReject: () => void
}) {
  const genderColor = reply.playerGender === 'male' ? 'bg-blue-500/30 text-blue-300' : 'bg-pink-500/30 text-pink-300'
  const typeColors = {
    confirm: 'bg-neon-green/10 text-neon-green border-neon-green/30',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    conditional: 'bg-neon-purple/10 text-neon-purple border-neon-purple/30',
  }

  const sentAgo = Math.floor((Date.now() - new Date(reply.sentAt).getTime()) / 60000)

  return (
    <div className="glass rounded-2xl p-4 border-l-4 border-l-neon-orange">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${genderColor}`}>
            {reply.playerName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{reply.playerName}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${typeColors[reply.type]}`}>
                {reply.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin size={10} className="text-white/30" />
              <span className="text-[10px] text-white/30">{spot.storeName}</span>
              <span className="text-[10px] text-white/20">·</span>
              <span className="text-[10px] text-white/30">{sentAgo < 1 ? '刚刚' : `${sentAgo}分钟前`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-night-800 text-[10px] text-white/40">
          <Users size={10} />
          <span>缺{spot.missingCount}人</span>
        </div>
        <div className="px-2 py-1 rounded bg-night-800 text-[10px] text-white/40">
          开场 {formatTime(spot.startTime)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-neon-green/20 text-neon-green text-xs font-medium border border-neon-green/30 active:scale-95 transition-transform"
        >
          <Check size={14} />
          确认补位
        </button>
        <button
          onClick={onReject}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-night-800 text-white/50 text-xs font-medium active:scale-95 transition-transform"
        >
          <X size={14} />
          拒绝
        </button>
      </div>
    </div>
  )
}
