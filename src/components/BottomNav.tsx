import { useNavigate, useLocation } from 'react-router-dom'
import { Flame, User, Settings, Plus } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/channel', label: '捡漏', icon: Flame },
  { path: '/trips', label: '行程', icon: User },
  { path: '/publish', label: '发布', icon: Plus },
  { path: '/setup', label: '偏好', icon: Settings },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong safe-bottom z-50">
      <div className="max-w-md mx-auto flex">
        {NAV_ITEMS.map(item => {
          const isActive = currentPath === item.path || (item.path === '/channel' && currentPath === '/')
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors duration-200 ${
                isActive ? 'text-neon-orange' : 'text-white/30'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
