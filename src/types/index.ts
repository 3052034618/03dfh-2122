export type GenreType = '欢乐' | '恐怖' | '情感' | '硬核' | '阵营' | '机制' | '还原' | '其他'
export type DurationRange = '3h以内' | '3-5h' | '5-7h' | '7h+'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Gender = 'male' | 'female'
export type TripStatus = 'confirmed' | 'pending' | 'completed' | 'noshow'
export type ReplyType = 'confirm' | 'pending' | 'conditional'

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
}

export interface ReplyRecord {
  spotId: string
  replyId: string
  label: string
  type: ReplyType
  sentAt: string
  confirmed: boolean
}
