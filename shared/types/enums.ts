export enum LoveLanguage {
  WORDS_OF_AFFIRMATION = 'WORDS_OF_AFFIRMATION',
  ACTS_OF_SERVICE = 'ACTS_OF_SERVICE',
  RECEIVING_GIFTS = 'RECEIVING_GIFTS',
  QUALITY_TIME = 'QUALITY_TIME',
  PHYSICAL_TOUCH = 'PHYSICAL_TOUCH',
}

export enum MoodType {
  HAPPY = 'HAPPY',
  LOVED = 'LOVED',
  TIRED = 'TIRED',
  ANXIOUS = 'ANXIOUS',
  EXCITED = 'EXCITED',
  SAD = 'SAD',
  GRATEFUL = 'GRATEFUL',
  SILLY = 'SILLY',
}

export const MOOD_CONFIG: Record<MoodType, { emoji: string; label: string; color: string }> = {
  [MoodType.HAPPY]: { emoji: '😊', label: 'Happy', color: '#FFD700' },
  [MoodType.LOVED]: { emoji: '🥰', label: 'Loved', color: '#FF69B4' },
  [MoodType.TIRED]: { emoji: '😴', label: 'Tired', color: '#9CA3AF' },
  [MoodType.ANXIOUS]: { emoji: '😰', label: 'Anxious', color: '#F59E0B' },
  [MoodType.EXCITED]: { emoji: '🎉', label: 'Excited', color: '#8B5CF6' },
  [MoodType.SAD]: { emoji: '😢', label: 'Sad', color: '#3B82F6' },
  [MoodType.GRATEFUL]: { emoji: '🙏', label: 'Grateful', color: '#10B981' },
  [MoodType.SILLY]: { emoji: '😜', label: 'Silly', color: '#F97316' },
};

export enum EmotionIcon {
  HAPPY = '😊',
  LOVED = '🥰',
  MISSING_YOU = '😢',
  EXCITED = '🎉',
  GRATEFUL = '🙏',
  SILLY = '😜',
  TIRED = '😴',
  PROUD = '💪',
  ROMANTIC = '💕',
  LAUGHING = '😂',
  BLUSHING = '😊',
  STARRY_EYED = '🤩',
  WARM = '🫶',
  PEACEFUL = '😌',
  PLAYFUL = '😏',
  ADORING = '😍',
}

export enum NoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  READ = 'READ',
}

export enum SpecialDateType {
  ANNIVERSARY = 'ANNIVERSARY',
  BIRTHDAY = 'BIRTHDAY',
  FIRST_DATE = 'FIRST_DATE',
  CUSTOM = 'CUSTOM',
}

export enum BucketCategory {
  TRAVEL = 'TRAVEL',
  FOOD = 'FOOD',
  EXPERIENCE = 'EXPERIENCE',
  MOVIES = 'MOVIES',
  ADVENTURE = 'ADVENTURE',
  LEARNING = 'LEARNING',
  FITNESS = 'FITNESS',
  OTHER = 'OTHER',
}

export enum BucketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
}

export enum NotificationType {
  NOTE_RECEIVED = 'NOTE_RECEIVED',
  NOTE_READ = 'NOTE_READ',
  MOOD_MATCH = 'MOOD_MATCH',
  PING = 'PING',
  ANNIVERSARY_REMINDER = 'ANNIVERSARY_REMINDER',
  MEMORY_ADDED = 'MEMORY_ADDED',
  BUCKET_COMPLETED = 'BUCKET_COMPLETED',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  PARTNER_JOINED = 'PARTNER_JOINED',
}
