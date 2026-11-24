export type RoomId = 'wisdom' | 'becoming' | 'visionary' | 'patterns';
export type BookStatus = 'complete' | 'selection' | 'forthcoming';
export type Atmosphere = 'full' | 'subtle' | 'minimal';
export type LivingPageId =
  | 'tao-water'
  | 'gita-chariot'
  | 'geometry-solids'
  | 'fibonacci-spiral'
  | 'breath-mandala'
  | 'stoic-dichotomy';

export interface Passage { id:string; text:string; }
export interface PassageAnchor { passageId:string; offset:number; }
export interface VerseBlock { heading?: string; lines: Passage[]; }

export interface Perspective { label: string; text: string; }
export interface LifeExample { title: string; text: string; }

export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  sourceLabel: string;
  attribution: string;
  verses: VerseBlock[];
  essence: string;
  deeper: string[];
  perspectives: Perspective[];
  bringToLife: LifeExample[];
  reflection: { questions: string[]; exercise?: string; journeyHook?: string };
  livingPage?: LivingPageId;
  connections: { bookId: string; chapterId?: string; reason: string }[];
}

export interface CoverSpec {
  material: 'leather' | 'metal' | 'silk' | 'stone' | 'crystal' | 'papyrus';
  base: string;      // css gradient stops base
  accent: string;    // gold etc
  motif: 'tao' | 'gita' | 'dharma' | 'tree' | 'stoic' | 'eye' | 'geometry' | 'mandala' | 'spiral' | 'scroll' | 'flame' | 'lotus' | 'millennial' | 'dream' | 'alch' | 'star';
  gem?: string;
}

export interface EditionInfo {
  translator?: string;
  edition: string;
  source: string;
  rights: string;
  contentType: 'public-domain' | 'original' | 'forthcoming';
  completeness: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  roomId: RoomId;
  tradition: string;
  subjects: string[];
  themes: string[];
  status: BookStatus;
  cover: CoverSpec;
  description: string;
  edition: EditionInfo;
  chapters: Chapter[];
  related: { bookId: string; reason: string }[];
  featured?: boolean;
  pagesEstimate?: string;
}

export interface RoomMeta {
  id: RoomId;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  accent: string;
  glow: string;
  motto: string;
  subjects: string[];
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapterId: string;
  page: number;
  label: string;
  created: number;
  anchor?: PassageAnchor;
}

export interface ProgressEntry {
  bookId: string;
  chapterId: string;
  page: number;
  anchor?: PassageAnchor;
  totalPages: number;
  percent: number;
  updated: number;
  chapterTitle: string;
  bookTitle: string;
}

export interface RecentVisit { bookId: string; chapterId?: string; timestamp: number; }
