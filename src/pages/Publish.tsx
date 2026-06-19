import { useState } from 'react'
import { Plus, CheckCircle2 } from 'lucide-react'
import { GENRE_TYPES, DISTRICTS } from '@/data/mock'
import type { GenreType, Difficulty } from '@/types'

export default function Publish() {
  const [form, setForm] = useState({
    scriptName: '',
    storeName: '',
    district: '',
    genreTypes: [] as GenreType[],
    playerMin: 4,
    playerMax: 7,
    duration: 4,
    difficulty: 'medium' as Difficulty,
    startTime: '',
    lockTime: '',
    originalPrice: 168,
    currentPrice: 99,
    dmName: '',
    dmNewbieFriendly: true,
    acceptCrossGender: true,
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const toggleGenre = (g: GenreType) => {
    setForm(prev => ({
      ...prev,
      genreTypes: prev.genreTypes.includes(g)
        ? prev.genreTypes.filter(x => x !== g)
        : [...prev.genreTypes, g],
    }))
  }

  const handleSubmit = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)
  }

  const isValid = form.scriptName && form.storeName && form.district && form.genreTypes.length > 0 && form.dmName

  return (
    <div className="min-h-screen bg-gradient-night pb-8">
      <div className="bg-orb w-64 h-64 bg-neon-green/40 top-[-40px] left-[-40px]" />
      <div className="bg-orb w-56 h-56 bg-neon-orange/30 bottom-20 right-[-30px]" style={{ animationDelay: '-12s' }} />

      <div className="relative z-10 px-4 pt-6 max-w-md mx-auto">
        <h1 className="text-xl font-black text-white mb-1">发布车位</h1>
        <p className="text-xs text-white/30 mb-6">填写信息，快速发布捡漏车位</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">剧本名 *</label>
            <input
              value={form.scriptName}
              onChange={e => setForm(p => ({ ...p, scriptName: e.target.value }))}
              placeholder="输入剧本名称"
              className="w-full px-4 py-3 rounded-xl bg-night-800 border border-white/5 text-white text-sm placeholder:text-white/20 focus:border-neon-orange/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1.5 block">门店名 *</label>
            <input
              value={form.storeName}
              onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))}
              placeholder="输入门店名称"
              className="w-full px-4 py-3 rounded-xl bg-night-800 border border-white/5 text-white text-sm placeholder:text-white/20 focus:border-neon-orange/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1.5 block">商圈 *</label>
            <div className="flex flex-wrap gap-1.5">
              {DISTRICTS.slice(0, 8).map(d => (
                <button
                  key={d}
                  onClick={() => setForm(p => ({ ...p, district: d }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    form.district === d
                      ? 'bg-neon-orange text-white'
                      : 'glass text-white/40'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1.5 block">剧本类型 *</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_TYPES.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    form.genreTypes.includes(g)
                      ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange/30'
                      : 'glass text-white/40'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">最少人数</label>
              <input
                type="number"
                value={form.playerMin}
                onChange={e => setForm(p => ({ ...p, playerMin: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl bg-night-800 border border-white/5 text-white text-sm focus:border-neon-orange/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">最多人数</label>
              <input
                type="number"
                value={form.playerMax}
                onChange={e => setForm(p => ({ ...p, playerMax: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl bg-night-800 border border-white/5 text-white text-sm focus:border-neon-orange/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">时长（小时）</label>
              <input
                type="number"
                value={form.duration}
                onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl bg-night-800 border border-white/5 text-white text-sm focus:border-neon-orange/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">难度</label>
              <div className="flex gap-1.5">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setForm(p => ({ ...p, difficulty: d }))}
                    className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                      form.difficulty === d
                        ? 'bg-neon-orange text-white'
                        : 'glass text-white/40'
                    }`}
                  >
                    {{ easy: '简单', medium: '中等', hard: '烧脑' }[d]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">原价</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={e => setForm(p => ({ ...p, originalPrice: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl bg-night-800 border border-white/5 text-white text-sm focus:border-neon-orange/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">捡漏价</label>
              <input
                type="number"
                value={form.currentPrice}
                onChange={e => setForm(p => ({ ...p, currentPrice: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl bg-night-800 border border-white/5 text-white text-sm focus:border-neon-orange/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1.5 block">DM 名字 *</label>
            <input
              value={form.dmName}
              onChange={e => setForm(p => ({ ...p, dmName: e.target.value }))}
              placeholder="DM 名字"
              className="w-full px-4 py-3 rounded-xl bg-night-800 border border-white/5 text-white text-sm placeholder:text-white/20 focus:border-neon-orange/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setForm(p => ({ ...p, dmNewbieFriendly: !p.dmNewbieFriendly }))}
              className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                form.dmNewbieFriendly
                  ? 'neon-border-green bg-neon-green/10 text-neon-green'
                  : 'glass text-white/30'
              }`}
            >
              新手友好
            </button>
            <button
              onClick={() => setForm(p => ({ ...p, acceptCrossGender: !p.acceptCrossGender }))}
              className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                form.acceptCrossGender
                  ? 'neon-border bg-neon-orange/10 text-neon-orange'
                  : 'glass text-white/30'
              }`}
            >
              允许反串
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
              isValid
                ? 'bg-neon-orange text-white shadow-lg shadow-neon-orange/30 active:scale-95'
                : 'bg-night-700 text-white/20 cursor-not-allowed'
            }`}
          >
            <Plus size={16} className="inline mr-1" />
            发布车位
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="glass-strong rounded-3xl p-8 text-center animate-slide-up">
            <CheckCircle2 size={56} className="text-neon-green mx-auto mb-3" />
            <p className="text-lg font-bold text-white">发布成功！</p>
            <p className="text-sm text-white/50 mt-1">等待玩家捡漏</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-4 px-6 py-2 rounded-xl glass text-white/70 text-sm"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
