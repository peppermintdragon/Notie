import type {
  SeriesStatus,
  BookCategory,
  BookStatus,
  ChapterStatus,
  Genre,
  StructureActType,
  ForeshadowingStatus,
  ConflictType,
  CharacterRole,
  RelationshipType,
  NoteCategory,
  InspirationColor,
  ThemeMode,
  Language,
  FontFamily,
} from './enums';

// ===== Phase 1 Tables =====

export interface Series {
  id?: number;
  name: string;
  description: string;
  status: SeriesStatus;
  coverImage?: string; // base64 data URL
  bookOrder: number[]; // ordered book IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id?: number;
  seriesId?: number; // null = standalone
  title: string;
  subtitle?: string;
  category: BookCategory;
  genre: Genre;
  status: BookStatus;
  description: string;
  synopsis: string; // TipTap JSON string
  coverImage?: string; // base64 data URL
  themeColor: string; // hex color
  targetWordCount?: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id?: number;
  bookId: number;
  title: string;
  content: string; // TipTap JSON string
  order: number;
  status: ChapterStatus;
  wordCount: number;
  summary?: string;
  taggedCharacterIds: number[];
  taggedLocationIds: number[];
  taggedEventIds: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChapterVersion {
  id?: number;
  chapterId: number;
  content: string; // TipTap JSON snapshot
  wordCount: number;
  note?: string;
  createdAt: Date;
}

// ===== Future Tables (Story Structure) =====

export interface StoryStructure {
  id?: number;
  bookId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryScene {
  id?: number;
  structureId: number;
  actType: StructureActType;
  order: number;
  title: string;
  description: string;
  color?: string;
  chapterId?: number;
  createdAt: Date;
}

export interface Foreshadowing {
  id?: number;
  bookId: number;
  description: string;
  setupChapterId?: number;
  payoffChapterId?: number;
  status: ForeshadowingStatus;
  createdAt: Date;
}

export interface Conflict {
  id?: number;
  bookId: number;
  type: ConflictType;
  description: string;
  characterIds: number[];
  isResolved: boolean;
  createdAt: Date;
}

export interface CharacterArc {
  id?: number;
  bookId: number;
  characterId: number;
  startState: string;
  endState: string;
  keyMoments: string[];
  createdAt: Date;
}

// ===== Future Tables (Characters) =====

export interface Character {
  id?: number;
  bookId: number;
  name: string;
  aliases: string[];
  nickname?: string;
  age?: string;
  birthday?: string;
  gender?: string;
  role: CharacterRole;
  faction?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  features?: string;
  style?: string;
  personality: string;
  goals?: string;
  fears?: string;
  secrets?: string;
  backstory: string; // TipTap JSON
  profileImage?: string; // base64
  images: CharacterImage[];
  themeColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterImage {
  label: string;
  data: string; // base64
}

export interface CharacterRelationship {
  id?: number;
  bookId: number;
  characterAId: number;
  characterBId: number;
  relationshipType: RelationshipType;
  description: string;
  createdAt: Date;
}

export interface CharacterAppearance {
  id?: number;
  characterId: number;
  chapterId: number;
  description?: string;
  createdAt: Date;
}

// ===== Future Tables (World Building) =====

export interface Location {
  id?: number;
  bookId: number;
  parentId?: number;
  name: string;
  description: string; // TipTap JSON
  image?: string; // base64
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldEvent {
  id?: number;
  bookId: number;
  name: string;
  description: string; // TipTap JSON
  date?: string; // in-world date string
  locationId?: number;
  characterIds: number[];
  chapterIds: number[];
  createdAt: Date;
}

export interface Faction {
  id?: number;
  bookId: number;
  name: string;
  description: string; // TipTap JSON
  leaderCharacterId?: number;
  memberCharacterIds: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldCategory {
  id?: number;
  bookId: number;
  name: string;
  icon?: string;
  createdAt: Date;
}

export interface WorldCategoryItem {
  id?: number;
  categoryId: number;
  name: string;
  description: string; // TipTap JSON
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== Future Tables (Inspiration, Notes, Scratchpad) =====

export interface InspirationCard {
  id?: number;
  bookId?: number; // null = global
  title: string;
  content: string;
  image?: string; // base64
  color: InspirationColor;
  tags: string[];
  linkedChapterId?: number;
  linkedCharacterId?: number;
  x: number;
  y: number;
  createdAt: Date;
}

export interface Note {
  id?: number;
  bookId?: number; // null = global
  category: NoteCategory;
  title: string;
  content: string; // TipTap JSON
  isPinned: boolean;
  tags: string[];
  linkedChapterId?: number;
  linkedCharacterId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScratchpadEntry {
  id?: number;
  bookId?: number;
  content: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Future Tables (Progress & Stats) =====

export interface WritingProgress {
  id?: number;
  bookId: number;
  date: string; // YYYY-MM-DD
  wordsWritten: number;
  chaptersWorkedOn: number[];
  minutesSpent?: number;
  notes?: string;
  createdAt: Date;
}

export interface PlatformStat {
  id?: number;
  bookId: number;
  platform: string;
  date: string; // YYYY-MM-DD
  wordCount?: number;
  views?: number;
  subscribers?: number;
  likes?: number;
  comments?: number;
  notes?: string;
  createdAt: Date;
}

// ===== Settings =====

export interface AppSettings {
  id?: number;
  language: Language;
  theme: ThemeMode;
  fontFamily: FontFamily;
  sidebarCollapsed: boolean;
  lastOpenBookId?: number;
  editorFontSize: number;
  autoSaveIntervalMs: number;
}
