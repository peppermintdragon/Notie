import type {
  LoveLanguage,
  MoodType,
  EmotionIcon,
  NoteStatus,
  SpecialDateType,
  BucketCategory,
  BucketPriority,
  NotificationType,
} from './enums';

// ─── Auth ────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// ─── User ────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  birthday?: string;
  profilePhoto?: string;
  loveLanguage?: LoveLanguage;
  timezone?: string;
  onboardingCompleted: boolean;
  coupleId?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  nickname?: string;
  birthday?: string;
  loveLanguage?: LoveLanguage;
  timezone?: string;
}

export interface OnboardingStep1Request {
  name: string;
  nickname?: string;
  birthday?: string;
  loveLanguage?: LoveLanguage;
}

export interface OnboardingStep3Request {
  relationshipStartDate: string;
  howWeMet?: string;
  coupleNickname?: string;
  themeColor?: string;
}

// ─── Couple ──────────────────────────────────────────────────

export interface CoupleProfile {
  id: string;
  coupleNickname?: string;
  coverPhoto?: string;
  themeColor: string;
  relationshipStartDate: string;
  howWeMet?: string;
  inviteCode: string;
  createdAt: string;
  partner?: UserProfile;
}

export interface CreateCoupleResponse {
  couple: CoupleProfile;
  inviteCode: string;
}

export interface JoinCoupleRequest {
  inviteCode: string;
}

// ─── Memory ──────────────────────────────────────────────────

export interface MemoryItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  moodTag?: MoodType;
  photos: MediaItem[];
  albumId?: string;
  author: { id: string; name: string; profilePhoto?: string };
  createdAt: string;
}

export interface CreateMemoryRequest {
  title: string;
  description?: string;
  date: string;
  location?: string;
  moodTag?: MoodType;
  albumId?: string;
}

export interface AlbumItem {
  id: string;
  name: string;
  coverPhoto?: string;
  memoryCount: number;
  createdAt: string;
}

export interface CreateAlbumRequest {
  name: string;
}

// ─── Media ───────────────────────────────────────────────────

export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'IMAGE' | 'VIDEO';
  width?: number;
  height?: number;
}

// ─── Daily Notes ─────────────────────────────────────────────

export interface DailyNoteItem {
  id: string;
  content: string;
  emotionIcon: EmotionIcon;
  status: NoteStatus;
  author: { id: string; name: string; profilePhoto?: string };
  sentAt: string;
  readAt?: string;
}

export interface SendNoteRequest {
  content: string;
  emotionIcon: EmotionIcon;
}

// ─── Mood ────────────────────────────────────────────────────

export interface MoodEntryItem {
  id: string;
  mood: MoodType;
  date: string;
  userId: string;
}

export interface SetMoodRequest {
  mood: MoodType;
}

export interface MoodCalendarDay {
  date: string;
  myMood?: MoodType;
  partnerMood?: MoodType;
  isMatch: boolean;
}

// ─── Special Dates ───────────────────────────────────────────

export interface SpecialDateItem {
  id: string;
  name: string;
  date: string;
  type: SpecialDateType;
  isRecurring: boolean;
  daysUntil: number;
}

export interface CreateSpecialDateRequest {
  name: string;
  date: string;
  type: SpecialDateType;
  isRecurring: boolean;
}

// ─── Bucket List ─────────────────────────────────────────────

export interface BucketListItemData {
  id: string;
  title: string;
  description?: string;
  category: BucketCategory;
  priority: BucketPriority;
  isCompleted: boolean;
  completedAt?: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
}

export interface CreateBucketListRequest {
  title: string;
  description?: string;
  category: BucketCategory;
  priority: BucketPriority;
  dueDate?: string;
  assignedTo?: string;
}

// ─── Notifications ───────────────────────────────────────────

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  readAt?: string;
  createdAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────

export interface DashboardData {
  daysTogether: number;
  myMoodToday?: MoodType;
  partnerMoodToday?: MoodType;
  dailyQuestion: string;
  upcomingDates: SpecialDateItem[];
  onThisDay: MemoryItem[];
  recentActivity: ActivityItem[];
  noteStreak: number;
}

export interface ActivityItem {
  id: string;
  type: 'MEMORY' | 'NOTE' | 'MOOD' | 'BUCKET' | 'DATE' | 'PING';
  description: string;
  userName: string;
  createdAt: string;
}

// ─── Pagination ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

// ─── API Response Wrapper ────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
