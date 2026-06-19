import type { GameSpot, QuickReply, GenreType, PlayerSlot } from '@/types'

export const CURRENT_PLAYER = {
  id: 'me',
  name: '我',
  gender: 'male' as const,
}

export const MOCK_PLAYERS: PlayerSlot[] = [
  { id: 'u1', name: '小明', avatar: '', gender: 'male', isConfirmed: false },
  { id: 'u2', name: '小红', avatar: '', gender: 'female', isConfirmed: false },
  { id: 'u3', name: '阿强', avatar: '', gender: 'male', isConfirmed: false },
  { id: 'u4', name: '小美', avatar: '', gender: 'female', isConfirmed: false },
  { id: 'u5', name: '大伟', avatar: '', gender: 'male', isConfirmed: false },
]

export const GENRE_TYPES: GenreType[] = ['欢乐', '恐怖', '情感', '硬核', '阵营', '机制', '还原', '其他']

export const DISTRICTS = [
  '三里屯', '望京', '国贸', '西单', '中关村', '五道口',
  '合生汇', '朝阳大悦城', '荟聚', '龙德广场', '五角场', '徐家汇'
]

export const DURATION_OPTIONS = ['3h以内', '3-5h', '5-7h', '7h+'] as const

export const QUICK_REPLIES: QuickReply[] = [
  { id: 'r1', label: '我能到', type: 'confirm' },
  { id: 'r2', label: '需要十分钟确认', type: 'pending' },
  { id: 'r3', label: '只接欢乐本', type: 'conditional' },
  { id: 'r4', label: '只接情感本', type: 'conditional' },
  { id: 'r5', label: '有没有老玩家带', type: 'conditional' },
  { id: 'r6', label: '可以反串', type: 'confirm' },
]

const now = new Date()

function hoursFromNow(h: number, m: number = 0): string {
  const d = new Date(now.getTime() + h * 3600000 + m * 60000)
  return d.toISOString()
}

function minutesFromNow(m: number): string {
  const d = new Date(now.getTime() + m * 60000)
  return d.toISOString()
}

export const MOCK_SPOTS: GameSpot[] = [
  {
    id: 's1',
    storeName: '迷境剧本社',
    scriptName: '漓川怪谈',
    scriptCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20horror%20mystery%20script%20murder%20game%20cover%2C%20dark%20atmosphere%2C%20misty%20river%2C%20ghostly%20figure&image_size=square',
    genreTypes: ['恐怖', '还原'],
    playerCount: { min: 4, max: 7 },
    currentPlayers: [
      { id: 'p1', name: '阿泽', avatar: '', gender: 'male', role: '渡边', isConfirmed: true },
      { id: 'p2', name: '小鱼', avatar: '', gender: 'female', role: '铃木', isConfirmed: true },
      { id: 'p3', name: '老王', avatar: '', gender: 'male', role: '田中', isConfirmed: true },
      { id: 'p4', name: '思思', avatar: '', gender: 'female', isConfirmed: false },
    ],
    missingCount: 3,
    duration: 5,
    difficulty: 'hard',
    startTime: hoursFromNow(1, 20),
    lockTime: minutesFromNow(55),
    originalPrice: 168,
    currentPrice: 99,
    dmName: '阿凯',
    dmNewbieFriendly: false,
    distance: 3.2,
    district: '三里屯',
    acceptCrossGender: true,
    isFilled: false,
  },
  {
    id: 's2',
    storeName: '夜语推理馆',
    scriptName: '病娇男孩的精分日记',
    scriptCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cute%20yandere%20boy%20anime%20style%20script%20murder%20game%20cover%2C%20pastel%20colors%2C%20diary%20theme&image_size=square',
    genreTypes: ['欢乐', '情感'],
    playerCount: { min: 3, max: 6 },
    currentPlayers: [
      { id: 'p5', name: '念念', avatar: '', gender: 'female', role: '小樱', isConfirmed: true },
      { id: 'p6', name: '大鹏', avatar: '', gender: 'male', role: '阿诚', isConfirmed: true },
      { id: 'p7', name: '橘子', avatar: '', gender: 'female', isConfirmed: false },
    ],
    missingCount: 3,
    duration: 4,
    difficulty: 'easy',
    startTime: hoursFromNow(0, 50),
    lockTime: minutesFromNow(25),
    originalPrice: 128,
    currentPrice: 69,
    dmName: '小雨',
    dmNewbieFriendly: true,
    distance: 1.8,
    district: '望京',
    acceptCrossGender: true,
    isFilled: false,
  },
  {
    id: 's3',
    storeName: '暗域探秘',
    scriptName: '青楼',
    scriptCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ancient%20Chinese%20brothel%20mystery%20game%20cover%2C%20red%20lanterns%2C%20elegant%20courtesan%2C%20ink%20painting%20style&image_size=square',
    genreTypes: ['阵营', '机制'],
    playerCount: { min: 5, max: 8 },
    currentPlayers: [
      { id: 'p8', name: '飞哥', avatar: '', gender: 'male', role: '花魁', isConfirmed: true },
      { id: 'p9', name: '小美', avatar: '', gender: 'female', role: '老鸨', isConfirmed: true },
      { id: 'p10', name: '老张', avatar: '', gender: 'male', role: '官人', isConfirmed: true },
      { id: 'p11', name: '阿莲', avatar: '', gender: 'female', role: '丫鬟', isConfirmed: true },
      { id: 'p12', name: '大刘', avatar: '', gender: 'male', role: '书生', isConfirmed: true },
    ],
    missingCount: 3,
    duration: 6,
    difficulty: 'medium',
    startTime: hoursFromNow(1, 45),
    lockTime: minutesFromNow(80),
    originalPrice: 198,
    currentPrice: 128,
    dmName: '阿杰',
    dmNewbieFriendly: true,
    distance: 5.6,
    district: '国贸',
    acceptCrossGender: false,
    isFilled: false,
  },
  {
    id: 's4',
    storeName: '剧本家',
    scriptName: '你好',
    scriptCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Romantic%20emotional%20script%20murder%20game%20cover%2C%20warm%20sunset%2C%20couple%20silhouette%2C%20tears&image_size=square',
    genreTypes: ['情感', '还原'],
    playerCount: { min: 3, max: 6 },
    currentPlayers: [
      { id: 'p13', name: '小晴', avatar: '', gender: 'female', role: '苏念', isConfirmed: true },
      { id: 'p14', name: '阿豪', avatar: '', gender: 'male', role: '陆远', isConfirmed: true },
      { id: 'p15', name: '小雪', avatar: '', gender: 'female', isConfirmed: false },
      { id: 'p16', name: '阿宇', avatar: '', gender: 'male', isConfirmed: false },
    ],
    missingCount: 2,
    duration: 4,
    difficulty: 'easy',
    startTime: hoursFromNow(0, 30),
    lockTime: minutesFromNow(15),
    originalPrice: 138,
    currentPrice: 79,
    dmName: '小薇',
    dmNewbieFriendly: true,
    distance: 2.1,
    district: '三里屯',
    acceptCrossGender: true,
    isFilled: false,
  },
  {
    id: 's5',
    storeName: '暴风雪推理馆',
    scriptName: '死者在黑夜里说话',
    scriptCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dark%20detective%20hardcore%20mystery%20game%20cover%2C%20noir%20style%2C%20murder%20scene%2C%20flashlight%20beam&image_size=square',
    genreTypes: ['硬核', '还原'],
    playerCount: { min: 4, max: 7 },
    currentPlayers: [
      { id: 'p17', name: '推理狂', avatar: '', gender: 'male', role: '刑警', isConfirmed: true },
      { id: 'p18', name: '小鹿', avatar: '', gender: 'female', role: '法医', isConfirmed: true },
      { id: 'p19', name: '大壮', avatar: '', gender: 'male', isConfirmed: false },
    ],
    missingCount: 4,
    duration: 7,
    difficulty: 'hard',
    startTime: hoursFromNow(1, 10),
    lockTime: minutesFromNow(50),
    originalPrice: 228,
    currentPrice: 158,
    dmName: '老陈',
    dmNewbieFriendly: false,
    distance: 8.3,
    district: '中关村',
    acceptCrossGender: true,
    isFilled: false,
  },
  {
    id: 's6',
    storeName: '入戏剧场',
    scriptName: '上钟儿',
    scriptCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Comedy%20fun%20party%20game%20cover%2C%20colorful%20confetti%2C%20laughing%20people%2C%20bright%20neon&image_size=square',
    genreTypes: ['欢乐', '机制'],
    playerCount: { min: 4, max: 8 },
    currentPlayers: [
      { id: 'p20', name: '搞笑女', avatar: '', gender: 'female', role: '按摩师', isConfirmed: true },
      { id: 'p21', name: '段子手', avatar: '', gender: 'male', role: '客人甲', isConfirmed: true },
      { id: 'p22', name: '开心果', avatar: '', gender: 'female', isConfirmed: false },
      { id: 'p23', name: '逗比王', avatar: '', gender: 'male', isConfirmed: false },
      { id: 'p24', name: '乐天派', avatar: '', gender: 'male', role: '技师', isConfirmed: true },
    ],
    missingCount: 3,
    duration: 3,
    difficulty: 'easy',
    startTime: hoursFromNow(0, 45),
    lockTime: minutesFromNow(20),
    originalPrice: 98,
    currentPrice: 49,
    dmName: '小梦',
    dmNewbieFriendly: true,
    distance: 1.5,
    district: '合生汇',
    acceptCrossGender: true,
    isFilled: false,
  },
]
