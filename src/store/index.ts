import { create } from 'zustand'
import type { PlayerPreference, GameSpot, TripRecord, ReplyRecord, GenreType } from '@/types'
import { MOCK_SPOTS, DISTRICTS } from '@/data/mock'

interface AppState {
  preference: PlayerPreference
  spots: GameSpot[]
  trips: TripRecord[]
  replies: ReplyRecord[]
  activeGenreFilter: GenreType | null
  hasPreference: boolean

  setPreference: (pref: Partial<PlayerPreference>) => void
  setActiveGenreFilter: (genre: GenreType | null) => void
  sendReply: (spotId: string, replyId: string, label: string, type: ReplyRecord['type']) => void
  confirmReply: (spotId: string) => void
  resetPreference: () => void
}

const DEFAULT_PREFERENCE: PlayerPreference = {
  districts: [],
  maxDistance: 10,
  genreTypes: [],
  durationRange: [],
  acceptCrossGender: false,
}

const loadPreference = (): PlayerPreference => {
  try {
    const saved = localStorage.getItem('jlq-preference')
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_PREFERENCE, ...parsed }
    }
  } catch { /* ignore */ }
  return DEFAULT_PREFERENCE
}

const savePreference = (pref: PlayerPreference) => {
  try {
    localStorage.setItem('jlq-preference', JSON.stringify(pref))
  } catch { /* ignore */ }
}

const loadTrips = (): TripRecord[] => {
  try {
    const saved = localStorage.getItem('jlq-trips')
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return []
}

const saveTrips = (trips: TripRecord[]) => {
  try {
    localStorage.setItem('jlq-trips', JSON.stringify(trips))
  } catch { /* ignore */ }
}

const loadReplies = (): ReplyRecord[] => {
  try {
    const saved = localStorage.getItem('jlq-replies')
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return []
}

const saveReplies = (replies: ReplyRecord[]) => {
  try {
    localStorage.setItem('jlq-replies', JSON.stringify(replies))
  } catch { /* ignore */ }
}

const checkHasPreference = (pref: PlayerPreference): boolean => {
  return pref.districts.length > 0 || pref.genreTypes.length > 0 || pref.durationRange.length > 0
}

export const useAppStore = create<AppState>((set, get) => ({
  preference: loadPreference(),
  spots: MOCK_SPOTS,
  trips: loadTrips(),
  replies: loadReplies(),
  activeGenreFilter: null,
  hasPreference: checkHasPreference(loadPreference()),

  setPreference: (pref) => {
    const newPref = { ...get().preference, ...pref }
    savePreference(newPref)
    set({ preference: newPref, hasPreference: checkHasPreference(newPref) })
  },

  setActiveGenreFilter: (genre) => {
    set({ activeGenreFilter: genre })
  },

  sendReply: (spotId, replyId, label, type) => {
    const reply: ReplyRecord = {
      spotId,
      replyId,
      label,
      type,
      sentAt: new Date().toISOString(),
      confirmed: false,
    }
    const existing = get().replies.find(r => r.spotId === spotId)
    const newReplies = existing
      ? get().replies.map(r => r.spotId === spotId ? reply : r)
      : [...get().replies, reply]
    saveReplies(newReplies)
    set({ replies: newReplies })

    const trip: TripRecord = {
      spotId,
      status: 'pending',
      confirmedAt: new Date().toISOString(),
      replyType: type,
    }
    const existingTrip = get().trips.find(t => t.spotId === spotId)
    if (!existingTrip) {
      const newTrips = [...get().trips, trip]
      saveTrips(newTrips)
      set({ trips: newTrips })
    }
  },

  confirmReply: (spotId) => {
    const existingReply = get().replies.find(r => r.spotId === spotId)

    const newReplies = get().replies.map(r =>
      r.spotId === spotId ? { ...r, confirmed: true } : r
    )
    saveReplies(newReplies)

    const existingTrip = get().trips.find(t => t.spotId === spotId)
    let newTrips
    if (existingTrip) {
      newTrips = get().trips.map(t =>
        t.spotId === spotId ? { ...t, status: 'confirmed' as const } : t
      )
    } else {
      newTrips = [...get().trips, {
        spotId,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        replyType: existingReply?.type ?? 'confirm',
      }]
    }
    saveTrips(newTrips)
    set({ replies: newReplies, trips: newTrips })
  },

  resetPreference: () => {
    savePreference(DEFAULT_PREFERENCE)
    set({ preference: DEFAULT_PREFERENCE, hasPreference: false })
  },
}))

export { DISTRICTS }
