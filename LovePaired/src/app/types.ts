export type LanguageKey = 'en' | 'zh-Hans'

export type MoodKey =
  | 'loved'
  | 'happy'
  | 'missing'
  | 'excited'
  | 'sleepy'
  | 'silly'
  | 'sad'
  | 'proud'

export type BlobColorKey = 'rose' | 'lavender' | 'peach' | 'mint' | 'butter'

export type Profile = {
  version: 1
  userId: string
  coupleId: string
  myName: string
  partnerName: string
  relationshipStartISO: string // YYYY-MM-DD
  blobColorKey: BlobColorKey
  language: LanguageKey
  serverUrl: string
}

export type PartnerState = {
  userId: string
  name: string
  blobColorKey: BlobColorKey
  currentMood: MoodKey
  moodUpdatedAt: number
  missYouCount: number
  lastUnreadNote?: {
    id: string
    emotionKey: MoodKey
    content: string
    createdAt: number
  }
}
