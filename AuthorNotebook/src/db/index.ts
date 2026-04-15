import Dexie, { type Table } from 'dexie';
import type {
  Series,
  Book,
  Chapter,
  ChapterVersion,
  StoryStructure,
  StoryScene,
  Foreshadowing,
  Conflict,
  CharacterArc,
  Character,
  CharacterRelationship,
  CharacterAppearance,
  Location,
  WorldEvent,
  Faction,
  WorldCategory,
  WorldCategoryItem,
  InspirationCard,
  Note,
  ScratchpadEntry,
  WritingProgress,
  PlatformStat,
  AppSettings,
} from '@/types';

export class AuthorNotebookDB extends Dexie {
  // Phase 1
  series!: Table<Series>;
  books!: Table<Book>;
  chapters!: Table<Chapter>;
  chapterVersions!: Table<ChapterVersion>;

  // Story Structure
  storyStructures!: Table<StoryStructure>;
  storyScenes!: Table<StoryScene>;
  foreshadowings!: Table<Foreshadowing>;
  conflicts!: Table<Conflict>;
  characterArcs!: Table<CharacterArc>;

  // Characters
  characters!: Table<Character>;
  characterRelationships!: Table<CharacterRelationship>;
  characterAppearances!: Table<CharacterAppearance>;

  // World Building
  locations!: Table<Location>;
  worldEvents!: Table<WorldEvent>;
  factions!: Table<Faction>;
  worldCategories!: Table<WorldCategory>;
  worldCategoryItems!: Table<WorldCategoryItem>;

  // Inspiration, Notes, Scratchpad
  inspirationCards!: Table<InspirationCard>;
  notes!: Table<Note>;
  scratchpadEntries!: Table<ScratchpadEntry>;

  // Progress & Stats
  writingProgress!: Table<WritingProgress>;
  platformStats!: Table<PlatformStat>;

  // Settings
  settings!: Table<AppSettings>;

  constructor() {
    super('AuthorNotebookDB');

    this.version(1).stores({
      // Phase 1
      series: '++id, name, createdAt',
      books: '++id, seriesId, title, status, createdAt',
      chapters: '++id, bookId, order, status, createdAt',
      chapterVersions: '++id, chapterId, createdAt',

      // Story Structure
      storyStructures: '++id, bookId',
      storyScenes: '++id, structureId, actType, order',
      foreshadowings: '++id, bookId, status',
      conflicts: '++id, bookId, type',
      characterArcs: '++id, bookId, characterId',

      // Characters
      characters: '++id, bookId, name, role',
      characterRelationships: '++id, bookId, characterAId, characterBId',
      characterAppearances: '++id, characterId, chapterId',

      // World Building
      locations: '++id, bookId, parentId, name',
      worldEvents: '++id, bookId',
      factions: '++id, bookId, name',
      worldCategories: '++id, bookId, name',
      worldCategoryItems: '++id, categoryId',

      // Inspiration, Notes, Scratchpad
      inspirationCards: '++id, bookId, color, createdAt',
      notes: '++id, bookId, category, isPinned, createdAt',
      scratchpadEntries: '++id, bookId, createdAt',

      // Progress & Stats
      writingProgress: '++id, bookId, date',
      platformStats: '++id, bookId, platform, date',

      // Settings
      settings: '++id',
    });
  }
}

export const db = new AuthorNotebookDB();
