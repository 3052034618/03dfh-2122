export type GenreType = '欢乐' | '恐怖' | '情感' | '硬核' | '阵营' | '机制' | '还原' | '其他'
export type DurationRange = '3h以内' | '3-5h' | '5-7h' | '7h+'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Gender = 'male' | 'female'
export type TripStatus = 'confirmed' | 'pending' | 'completed' | 'noshow' | 'waitlist' | 'missed' | 'cancelled' | 'arrived'
export type ReplyType = 'confirm' | 'pending' | 'conditional'
export type ReplyStatus = 'pending' | 'confirmed' | 'rejected' | 'waitlisted'
export type CancelReason = 'traffic' | 'emergency' | 'changed_mind' | 'other'

export interface PlayerPreference {
  districts: string[]
  maxDistance: number
  genreTypes: GenreType[]
  durationRange: DurationRange[]
  acceptCrossGender: boolean
}

export interface PlayerSlot {
  id: string
  name: string
  avatar: string
  gender: Gender
  role?: string
  isConfirmed: boolean
}

export interface GameSpot {
  id: string
  storeName: string
  scriptName: string
  scriptCover: string
  genreTypes: GenreType[]
  playerCount: { min: number; max: number }
  currentPlayers: PlayerSlot[]
  missingCount: number
  duration: number
  difficulty: Difficulty
  startTime: string
  lockTime: string
  originalPrice: number
  currentPrice: number
  dmName: string
  dmNewbieFriendly: boolean
  distance: number
  district: string
  acceptCrossGender: boolean
  isFilled: boolean
}

export interface QuickReply {
  id: string
  label: string
  type: ReplyType
}

export interface TripRecord {
  spotId: string
  status: TripStatus
  confirmedAt: string
  replyType: ReplyType
  playerId: string
  playerName: string
  playerGender: Gender
  waitlistPosition?: number
  cancelledAt?: string
  cancelReason?: CancelReason
  cancelNote?: string
  arrivedAt?: string
  noshowCount?: number
}

export interface ReplyRecord {
  id: string
  spotId: string
  replyId: string
  label: string
  type: ReplyType
  sentAt: string
  status: ReplyStatus
  playerId: string
  playerName: string
  playerGender: Gender
  processedAt?: string
}

export interface FulfillmentRecord {
  spotId: string
  playerId: string
  checkedIn: boolean
  checkedInAt?: string
  cancelled: boolean
  cancelledAt?: string
  cancelReason?: CancelReason
  cancelNote?: string
  isNoshow: boolean
}

export interface StoreQueueItem {
  reply: ReplyRecord
  spot: GameSpot
  receivedAt: string
}
