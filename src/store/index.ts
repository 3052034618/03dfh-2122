import { create } from 'zustand'
import type { PlayerPreference, GameSpot, TripRecord, ReplyRecord, GenreType, CancelReason, ReplyType, PlayerSlot } from '@/types'
import { MOCK_SPOTS, DISTRICTS, CURRENT_PLAYER, MOCK_PLAYERS } from '@/data/mock'

interface AppState {
  preference: PlayerPreference
  spots: GameSpot[]
  trips: TripRecord[]
  replies: ReplyRecord[]
  activeGenreFilter: GenreType | null
  hasPreference: boolean

  setPreference: (pref: Partial<PlayerPreference>) => void
  setActiveGenreFilter: (genre: GenreType | null) => void
  sendReply: (spotId: string, replyId: string, label: string, type: ReplyType) => void
  confirmReply: (spotId: string) => void
  confirmPlayer: (replyId: string, spotId: string) => void
  rejectPlayer: (replyId: string, spotId: string) => void
  checkIn: (spotId: string) => void
  cancelTrip: (spotId: string, reason: CancelReason, note?: string) => void
  removeTrip: (spotId: string) => void
  getStoreQueue: () => { reply: ReplyRecord; spot: GameSpot }[]
  getWaitlistPosition: (spotId: string, playerId: string) => number
  simulateOtherReplies: (spotId: string) => void
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

const loadSpots = (): GameSpot[] => {
  try {
    const saved = localStorage.getItem('jlq-spots')
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return MOCK_SPOTS
}

const saveSpots = (spots: GameSpot[]) => {
  try {
    localStorage.setItem('jlq-spots', JSON.stringify(spots))
  } catch { /* ignore */ }
}

const checkHasPreference = (pref: PlayerPreference): boolean => {
  return pref.districts.length > 0 || pref.genreTypes.length > 0 || pref.durationRange.length > 0
}

const generateReplyId = () => `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const useAppStore = create<AppState>((set, get) => ({
  preference: loadPreference(),
  spots: loadSpots(),
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
    const now = new Date().toISOString()
    const spot = get().spots.find(s => s.id === spotId)
    if (!spot) return

    const existingMyReply = get().replies.find(r => r.spotId === spotId && r.playerId === CURRENT_PLAYER.id)
    if (existingMyReply) return

    const reply: ReplyRecord = {
      id: generateReplyId(),
      spotId,
      replyId,
      label,
      type,
      sentAt: now,
      status: 'pending',
      playerId: CURRENT_PLAYER.id,
      playerName: CURRENT_PLAYER.name,
      playerGender: CURRENT_PLAYER.gender,
    }

    const pendingCount = get().replies.filter(r => r.spotId === spotId && r.status === 'pending').length
    const waitlistPosition = pendingCount + 1

    const newReplies = [...get().replies, reply]
    saveReplies(newReplies)

    const trip: TripRecord = {
      spotId,
      status: waitlistPosition > spot.missingCount ? 'waitlist' : 'pending',
      confirmedAt: now,
      replyType: type,
      playerId: CURRENT_PLAYER.id,
      playerName: CURRENT_PLAYER.name,
      playerGender: CURRENT_PLAYER.gender,
      waitlistPosition: waitlistPosition > spot.missingCount ? waitlistPosition - spot.missingCount : undefined,
    }

    const existingTrip = get().trips.find(t => t.spotId === spotId && t.playerId === CURRENT_PLAYER.id)
    let newTrips
    if (existingTrip) {
      newTrips = get().trips.map(t =>
        t.spotId === spotId && t.playerId === CURRENT_PLAYER.id ? trip : t
      )
    } else {
      newTrips = [...get().trips, trip]
    }
    saveTrips(newTrips)

    set({ replies: newReplies, trips: newTrips })
  },

  confirmReply: (spotId) => {
    const myReply = get().replies.find(r => r.spotId === spotId && r.playerId === CURRENT_PLAYER.id)
    if (!myReply) return
    get().confirmPlayer(myReply.id, spotId)
  },

  confirmPlayer: (replyId, spotId) => {
    const now = new Date().toISOString()
    const reply = get().replies.find(r => r.id === replyId)
    const spot = get().spots.find(s => s.id === spotId)
    if (!reply || !spot) return

    const newReplies = get().replies.map(r => {
      if (r.id === replyId) {
        return { ...r, status: 'confirmed' as const, processedAt: now }
      }
      if (r.spotId === spotId && r.status === 'pending') {
        return { ...r, status: 'waitlisted' as const }
      }
      if (r.spotId === spotId && r.id !== replyId && r.status === 'pending') {
        return { ...r, status: 'waitlisted' as const }
      }
      return r
    })
    saveReplies(newReplies)

    const newTrips = get().trips.map(t => {
      if (t.spotId === spotId && t.playerId === reply.playerId) {
        return { ...t, status: 'confirmed' as const, confirmedAt: now }
      }
      if (t.spotId === spotId && t.status === 'pending') {
        const pendingRepliesForSpot = newReplies.filter(r => r.spotId === spotId && r.status === 'pending')
        const waitlistPos = pendingRepliesForSpot.findIndex(r => r.playerId === t.playerId)
        if (waitlistPos >= 0) {
          return { ...t, status: 'waitlist' as const, waitlistPosition: waitlistPos + 1 }
        }
      }
      return t
    })
    saveTrips(newTrips)

    const newPlayer: PlayerSlot = {
      id: reply.playerId,
      name: reply.playerName,
      avatar: '',
      gender: reply.playerGender,
      isConfirmed: true,
    }

    const newSpots = get().spots.map(s => {
      if (s.id !== spotId) return s
      const newMissingCount = Math.max(0, s.missingCount - 1)
      const existingPlayer = s.currentPlayers.find(p => p.id === reply.playerId)
      const updatedPlayers = existingPlayer
        ? s.currentPlayers.map(p =>
            p.id === reply.playerId ? { ...p, isConfirmed: true } : p
          )
        : [...s.currentPlayers, newPlayer]
      return {
        ...s,
        currentPlayers: updatedPlayers,
        missingCount: newMissingCount,
        isFilled: newMissingCount <= 0,
      }
    })
    saveSpots(newSpots)

    set({ replies: newReplies, trips: newTrips, spots: newSpots })
  },

  rejectPlayer: (replyId, spotId) => {
    const now = new Date().toISOString()
    const reply = get().replies.find(r => r.id === replyId)
    if (!reply) return

    const newReplies = get().replies.map(r =>
      r.id === replyId ? { ...r, status: 'rejected' as const, processedAt: now } : r
    )
    saveReplies(newReplies)

    const newTrips = get().trips.map(t =>
      t.spotId === spotId && t.playerId === reply.playerId
        ? { ...t, status: 'missed' as const }
        : t
    )
    saveTrips(newTrips)

    set({ replies: newReplies, trips: newTrips })
  },

  checkIn: (spotId) => {
    const now = new Date().toISOString()
    const newTrips = get().trips.map(t =>
      t.spotId === spotId && t.playerId === CURRENT_PLAYER.id
        ? { ...t, status: 'arrived' as const, arrivedAt: now }
        : t
    )
    saveTrips(newTrips)
    set({ trips: newTrips })
  },

  cancelTrip: (spotId, reason, note) => {
    const now = new Date().toISOString()
    const newTrips = get().trips.map(t =>
      t.spotId === spotId && t.playerId === CURRENT_PLAYER.id
        ? { ...t, status: 'cancelled' as const, cancelledAt: now, cancelReason: reason, cancelNote: note }
        : t
    )
    saveTrips(newTrips)

    const newSpots = get().spots.map(s => {
      if (s.id !== spotId) return s
      const myTrip = get().trips.find(t => t.spotId === spotId && t.playerId === CURRENT_PLAYER.id)
      if (!myTrip) return s
      return {
        ...s,
        currentPlayers: s.currentPlayers.filter(p => p.id !== CURRENT_PLAYER.id),
        missingCount: s.missingCount + 1,
        isFilled: false,
      }
    })
    saveSpots(newSpots)

    const newReplies = get().replies.filter(r => !(r.spotId === spotId && r.playerId === CURRENT_PLAYER.id))
    saveReplies(newReplies)

    set({ trips: newTrips, spots: newSpots, replies: newReplies })
  },

  removeTrip: (spotId) => {
    const newTrips = get().trips.filter(t => !(t.spotId === spotId && t.playerId === CURRENT_PLAYER.id))
    saveTrips(newTrips)
    const newReplies = get().replies.filter(r => !(r.spotId === spotId && r.playerId === CURRENT_PLAYER.id))
    saveReplies(newReplies)
    set({ trips: newTrips, replies: newReplies })
  },

  getStoreQueue: () => {
    const { replies, spots } = get()
    return replies
      .filter(r => r.status === 'pending')
      .map(r => ({
        reply: r,
        spot: spots.find(s => s.id === r.spotId)!
      }))
      .filter(item => item.spot)
      .sort((a, b) =>
        new Date(a.reply.sentAt).getTime() - new Date(b.reply.sentAt).getTime()
      )
  },

  getWaitlistPosition: (spotId, playerId) => {
    const { replies } = get()
    const pendingReplies = replies
      .filter(r => r.spotId === spotId && (r.status === 'pending' || r.status === 'waitlisted'))
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    return pendingReplies.findIndex(r => r.playerId === playerId) + 1
  },

  simulateOtherReplies: (spotId) => {
    const otherPlayers = MOCK_PLAYERS.slice(0, 2)
    const now = new Date().toISOString()

    const newReplies = [...get().replies]
    const newTrips = [...get().trips]

    otherPlayers.forEach((player, index) => {
      const reply: ReplyRecord = {
        id: generateReplyId(),
        spotId,
        replyId: 'r1',
        label: '我能到',
        type: 'confirm',
        sentAt: new Date(Date.now() - (index + 1) * 30000).toISOString(),
        status: 'pending',
        playerId: player.id,
        playerName: player.name,
        playerGender: player.gender,
      }
      newReplies.push(reply)

      const trip: TripRecord = {
        spotId,
        status: 'pending',
        confirmedAt: now,
        replyType: 'confirm',
        playerId: player.id,
        playerName: player.name,
        playerGender: player.gender,
      }
      newTrips.push(trip)
    })

    saveReplies(newReplies)
    saveTrips(newTrips)
    set({ replies: newReplies, trips: newTrips })
  },

  resetPreference: () => {
    savePreference(DEFAULT_PREFERENCE)
    set({ preference: DEFAULT_PREFERENCE, hasPreference: false })
  },
}))

export { DISTRICTS }
