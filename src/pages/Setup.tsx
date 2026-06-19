import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Tag, Users, RotateCcw } from 'lucide-react'
import { useAppStore } from '@/store'
import { GENRE_TYPES, DISTRICTS, DURATION_OPTIONS } from '@/data/mock'
import type { GenreType, DurationRange } from '@/types'

const GENRE_ICONS: Record<GenreType, string> = {
  '欢乐': '😆', '恐怖': '👻', '情感': '💔', '硬核': '🧠',
  '阵营': '⚔️', '机制': '⚙️', '还原': '🔍', '其他': '🎲',
}

export default function Setup() {
  const navigate = useNavigate()
  const { preference, setPreference, hasPreference } = useAppStore()
  const pref = preference

  const toggleDistrict = (d: string) => {
    const next = pref.districts.includes(d)
      ? pref.districts.filter(x => x !== d)
      : [...pref.districts, d]
    setPreference({ districts: next })
  }

  const toggleGenre = (g: GenreType) => {
    const next = pref.genreTypes.includes(g)
      ? pref.genreTypes.filter(x => x !== g)
      : [...pref.genreTypes, g]
    setPreference({ genreTypes: next })
  }

  const toggleDuration = (d: DurationRange) => {
    const next = pref.durationRange.includes(d)
      ? pref.durationRange.filter(x => x !== d)
      : [...pref.durationRange, d]
    setPreference({ durationRange: next })
  }

  const canProceed = pref.districts.length > 0 || pref.genreTypes.length > 0

  return (
    <div className="min-h-screen bg-gradient-night px-4 pb-32 pt-6">
      <div className="bg-orb w-72 h-72 bg-neon-orange top-[-50px] left-[-50px]" />
      <div className="bg-orb w-60 h-60 bg-neon-purple bottom-20 right-[-40px]" style={{ animationDelay: '-7s' }} />

      <div className="relative z-10 max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight">
            <span className="neon-text-orange">临车</span>
            <span className="text-white/90">捡漏</span>
          </h1>
          <p className="mt-2 text-sm text-white/40">设置偏好，精准匹配即将开本的车位</p>
        </div>

        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-neon-orange" />
            <span className="text-sm font-medium text-white/70">选择商圈</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DISTRICTS.map(d => (
              <button
                key={d}
                onClick={() => toggleDistrict(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  pref.districts.includes(d)
                    ? 'bg-neon-orange text-white shadow-lg shadow-neon-orange/20'
                    : 'glass text-white/50 hover:text-white/70'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-neon-orange" />
              <span className="text-sm font-medium text-white/70">出发距离</span>
            </div>
            <span className="font-mono text-lg font-bold neon-text-green">{pref.maxDistance}km</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={pref.maxDistance}
            onChange={e => setPreference({ maxDistance: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-white/30">1km</span>
            <span className="text-xs text-white/30">20km</span>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-neon-orange" />
            <span className="text-sm font-medium text-white/70">想玩类型</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {GENRE_TYPES.map(g => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  pref.genreTypes.includes(g)
                    ? 'neon-border bg-neon-orange/10 text-neon-orange'
                    : 'glass text-white/50 hover:text-white/70'
                }`}
              >
                <span className="text-lg">{GENRE_ICONS[g]}</span>
                <span>{g}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-neon-orange" />
            <span className="text-sm font-medium text-white/70">可玩时长</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DURATION_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => toggleDuration(d as DurationRange)}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  pref.durationRange.includes(d as DurationRange)
                    ? 'neon-border bg-neon-orange/10 text-neon-orange'
                    : 'glass text-white/50 hover:text-white/70'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-neon-orange" />
              <span className="text-sm font-medium text-white/70">接受反串</span>
            </div>
            <button
              onClick={() => setPreference({ acceptCrossGender: !pref.acceptCrossGender })}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                pref.acceptCrossGender ? 'bg-neon-green/80 shadow-lg shadow-neon-green/30' : 'bg-night-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                  pref.acceptCrossGender ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>
          <p className="mt-1 text-xs text-white/30">开启后会匹配允许反串角色的车位</p>
        </section>

        <div className="fixed bottom-0 left-0 right-0 glass-strong p-4 safe-bottom z-50">
          <div className="max-w-md mx-auto flex gap-3">
            {hasPreference && (
              <button
                onClick={() => navigate('/channel')}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl glass text-white/60 text-sm font-medium"
              >
                <RotateCcw size={14} />
                跳过
              </button>
            )}
            <button
              onClick={() => navigate('/channel')}
              disabled={!canProceed}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                canProceed
                  ? 'bg-neon-orange text-white shadow-lg shadow-neon-orange/30 active:scale-95'
                  : 'bg-night-700 text-white/30 cursor-not-allowed'
              }`}
            >
              开始捡漏
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
