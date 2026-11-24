import type { Book, RoomMeta, RoomId } from './types';
import { wisdomBooks } from './wisdom';
import { becomingBooks } from './becoming';
import { millennialTao } from './millennial';
import { visionaryBooks } from './visionary';
import { patternsBooks } from './patterns';
import { addedBooks } from './supplement';
import editions from './completeEditions.json';
import additional from './otherEditions.json';
import type { Chapter, Passage } from './types';

export const SOUL_HUB_ROUTE = '/soul-hub';
export const LIBRARY_VERSION = '0.2.0-prototype';
export const CHANGELOG = [
  { v: '0.2.0', date: '2026-11-17', notes: 'Added a local Inner Ledger and passage highlights, educational collections on early mystical texts and geometry, improved book ornament and reader layout, and hid empty entries. Historical transcription review remains necessary.' },
  { v: '0.1.0', date: 'Prototype', notes: 'Grand Atrium, four rooms, Living Tome reader, Essence layers, 3+ Living Pages, Millennial Tao (3 ch), public-domain selections with full commentary, persistence, atmosphere modes.' },
];

export const rooms: RoomMeta[] = [
  {
    id: 'wisdom',
    name: 'The Wisdom Archive',
    subtitle: 'Sacred Texts, Spirituality & Ancient Wisdom',
    description:
      'A luminous sanctuary of humanity’s sacred literature — Daoist, Hindu, Buddhist, Hebrew, Sufi, and Hermetic voices gathered under golden light. Each tradition presented in its own integrity, never flattened into one.',
    image: '/library-assets/images/wisdom-archive.jpg',
    accent: '#e8b45a',
    glow: 'rgba(232,180,90,.35)',
    motto: 'Many rivers, one thirst — each spring honored as itself.',
    subjects: ['Daoism', 'Hinduism', 'Buddhism', 'Biblical Wisdom', 'Sufism', 'Hermeticism'],
  },
  {
    id: 'becoming',
    name: 'The Chamber of Becoming',
    subtitle: 'Personal Growth, Philosophy & Self-Discovery',
    description:
      'A living garden of transformation beneath the great luminous Tree — Stoic philosophy, modern practice, and the original Millennial Tao. Reflection questions and exercises throughout, designed for future Your Journey integration.',
    image: '/library-assets/images/chamber-becoming.jpg',
    accent: '#8fd6a0',
    glow: 'rgba(143,214,160,.3)',
    motto: 'You are not finished. Neither is the garden.',
    subjects: ['Stoicism', 'Practice', 'Daoism', 'Creativity', 'Resilience', 'Modern Life'],
  },
  {
    id: 'visionary',
    name: 'The Visionary Archive',
    subtitle: 'Consciousness, Visionary Art & Altered Perspectives',
    description:
      'An iridescent observatory of inner space — the science of consciousness, the psychology of mysticism, dreams, and a strictly educational history of sacred plants. Science, history, philosophy, and spiritual interpretation always distinguished.',
    image: '/library-assets/images/visionary-archive.jpg',
    accent: '#c9a8ff',
    glow: 'rgba(201,168,255,.35)',
    motto: 'Look within — carefully, honestly, lawfully.',
    subjects: ['Consciousness', 'Psychology', 'Mysticism', 'Dreams', 'History', 'Perception'],
  },
  {
    id: 'patterns',
    name: 'The Hall of Hidden Patterns',
    subtitle: 'Sacred Geometry, Symbolism & Esoteric Traditions',
    description:
      'A symmetrical temple of form — Platonic solids, golden spirals, mandalas, archetypes, and alchemical emblems. Rotate the solids, grow the spirals, breathe with the mandalas. Mathematics and meaning, rigorously distinguished.',
    image: '/library-assets/images/hall-patterns.jpg',
    accent: '#7fb8ff',
    glow: 'rgba(127,184,255,.35)',
    motto: 'Number dreams, and the dream takes shape.',
    subjects: ['Sacred Geometry', 'Mathematics', 'Symbolism', 'Archetypes', 'Alchemy', 'Mythology'],
  },
];

const sourcedChapter=(id:string,title:string,lines:Passage[],sourceLabel:string,attribution:string):Chapter=>({
 id,title,sourceLabel,attribution,verses:[{lines}],essence:'No Inner Orbit commentary has yet been prepared for this chapter.',deeper:[],perspectives:[],bringToLife:[],reflection:{questions:[]},connections:[]
});
const completeTao=editions.tao.map(c=>sourcedChapter(`legge-${c.number}`,`Chapter ${c.number}`,c.lines,`Tao Te Ching · Chapter ${c.number} · James Legge translation (1891)`, 'Translated by James Legge · 1891; transcription via Standard Ebooks.'));
const completeDhamma=editions.dhammapada.map(c=>sourcedChapter(`muller-${c.number}`,`Chapter ${c.number} — ${c.name}`,c.lines,`Dhammapada · Chapter ${c.number} · F. Max Müller translation (1881)`, 'Translated by F. Max Müller · 1881; transcription based on Project Gutenberg.'));
/** Preserve original curated chapter and passage IDs so existing notes and highlights remain reachable. */
function withCompleteEdition(book:Book):Book {
 const legacy=book.chapters.map(ch=>({...ch,title:`Earlier curated reading · ${ch.title}`}));
 const configs:Record<string,{chapters:Chapter[];edition:string;translator?:string;source:string;completeness:string;description:string;label:string;status:'complete'|'selection'}>={
  'bhagavad-gita':{chapters:additional.gita.map(c=>sourcedChapter(`telang-${c.number}`,`Chapter ${c.number}`,c.lines,`Bhagavad Gita · Chapter ${c.number} · K. T. Telang (1882)`, 'K. T. Telang translation, 1882 · source alignment and collation require review.')),edition:'The Bhagavadgîtâ, Sacred Books of the East vol. 8 (1882)',translator:'Kashinath Trimbak Telang',source:'Telang translation via scriptures corpus, https://github.com/goyaldarwin/scriptures; chapter and verse alignment supplied by the transcriber. Review exact transcription and reuse rights before publication.',completeness:'18 chapters of the Telang recension; 636 aligned prose passages, many combining verses. The verse numbering differs across recensions, including 13.1; a verse-by-verse collation is outstanding.',description:'All 18 chapters in K. T. Telang’s historical English translation, followed by the library’s earlier original overviews. Numbering, alignment and transcription require editorial review.',label:'18 chapters · Telang edition',status:'selection'},
  'meditations':{chapters:additional.meditations.map(c=>sourcedChapter(`long-${c.number}`,`Book ${c.number}`,c.lines,`Meditations · Book ${c.number} · George Long (1862)`, 'Translated by George Long · transcription via Standard Ebooks.')),edition:'George Long translation (1862)',translator:'George Long',source:'Standard Ebooks George Long transcription; notes excluded. Editorial collation outstanding.',completeness:'All 12 books of the Long translation; translator’s notes and introduction excluded.',description:'All twelve books in George Long’s translation, followed by the library’s earlier curated readings.',label:'12 books · Long translation',status:'complete'},
  'enchiridion':{chapters:additional.enchiridion.map(c=>sourcedChapter(`long-manual-${c.number}`,`Section ${c.number}`,c.lines,`Enchiridion · Section ${c.number} · George Long`, 'Translated by George Long · transcription via Standard Ebooks.')),edition:'George Long translation, Short Works',translator:'George Long',source:'Standard Ebooks, Epictetus Short Works, George Long translation; notes excluded. Earlier curated readings retain their Carter attribution.',completeness:'All 53 sections of the George Long translation; introductory material and notes excluded.',description:'The 53-section Enchiridion in George Long’s translation. The earlier Carter-attributed excerpts are retained separately.',label:'53 sections · Long translation',status:'complete'},
  'ecclesiastes':{chapters:additional.ecclesiastes.map(c=>sourcedChapter(`kjv-${c.number}`,`Chapter ${c.number}`,c.lines,`Ecclesiastes · Chapter ${c.number} · King James Version`, 'King James Version, 1611 · jurisdictional rights review required.')),edition:'King James Version (1611)',translator:'King James translators',source:'KJV transcription via aruljohn/Bible-kjv; collation with edition and local rights still required.',completeness:'All 12 chapters and 222 numbered verses of Ecclesiastes in the supplied KJV transcription.',description:'The twelve chapters of Ecclesiastes in the King James Version, followed by earlier curated readings.',label:'12 chapters · KJV',status:'complete'},
  'varieties-experience':{chapters:additional.varieties.map(c=>sourcedChapter(`james-${c.number}`,c.name,c.lines,`The Varieties of Religious Experience · ${c.name} · William James (1902)`, 'William James · 1902; transcription via Standard Ebooks.')),edition:'William James (1902), Standard Ebooks transcription',source:'Standard Ebooks transcription, preface, lecture groups and postscript; notes excluded. Full textual collation required.',completeness:'Preface, all 20 lectures in 14 lecture groups, and postscript; footnotes and index excluded.',description:'William James’s preface, twenty lectures and postscript, followed by the earlier curated readings.',label:'20 lectures · James',status:'complete'}
 };
 const config=configs[book.id];
 if(config)return {...book,status:config.status,pagesEstimate:config.label,description:config.description,edition:{...book.edition,contentType:'public-domain',edition:config.edition,translator:config.translator,source:config.source,completeness:config.completeness,rights:'Historical edition believed public domain in the United States; verify jurisdiction and transcription/edition-specific reuse before release. Earlier commentary is original and separately identified.'},chapters:[...config.chapters,...legacy]};
 if(book.id!=='tao-te-ching' && book.id!=='dhammapada')return book;
 const tao=book.id==='tao-te-ching';
 return {...book,status:'complete',pagesEstimate:tao?'81 chapters · complete translation':'26 chapters · 423 numbered verses',
  description:tao?'The complete 81-chapter James Legge translation, followed by the library’s earlier curated readings. Original commentary is labeled separately.':'The 26 chapters of the F. Max Müller translation, including verses 1–423; followed by the library’s earlier curated readings.',
  edition:{...book.edition,source:tao?'Legge (1891), Standard Ebooks transcription; editorial verification ongoing.':'Müller, Project Gutenberg #2017 transcription via GITenberg; Wikisource used to restore omitted verse 127 and correct verse 128 numbering.',completeness:tao?'Complete 81-chapter Legge translation. Endnotes and introduction excluded; editorial verification remains.':'Complete 26-chapter translation; 423 numbered verses, some combined by the translator. Verse 127 restored from Wikisource; introduction, notes and index excluded.'},
  chapters:[...(tao?completeTao:completeDhamma),...legacy]};
}
export const allBooks: Book[] = [...wisdomBooks, ...becomingBooks, millennialTao, ...visionaryBooks, ...patternsBooks, ...addedBooks].filter(b => b.chapters.length > 0).map(withCompleteEdition);

export const getBook = (id: string) => allBooks.find((b) => b.id === id);
export const getRoom = (id: RoomId) => rooms.find((r) => r.id === id)!;
export const booksInRoom = (roomId: RoomId) => allBooks.filter((b) => b.roomId === roomId);
export const readableBooks = () => allBooks.filter((b) => b.chapters.length > 0);
export const featuredBooks = () => allBooks.filter((b) => b.featured);

export function searchLibrary(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { books: [] as Book[], chapters: [] as { book: Book; chapterId: string; title: string; snippet: string }[] };
  const books = allBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.tradition.toLowerCase().includes(q) ||
      b.subjects.some((s) => s.toLowerCase().includes(q)) ||
      b.themes.some((t) => t.toLowerCase().includes(q)) ||
      b.description.toLowerCase().includes(q)
  );
  const chapters: { book: Book; chapterId: string; title: string; snippet: string }[] = [];
  for (const b of allBooks) {
    for (const c of b.chapters) {
      const hay = (c.title + ' ' + c.essence + ' ' + c.verses.map((v) => v.lines.map(l=>l.text).join(' ')).join(' ')).toLowerCase();
      const idx = hay.indexOf(q);
      if (idx >= 0) {
        const raw = c.title + ' — ' + c.essence;
        chapters.push({ book: b, chapterId: c.id, title: c.title, snippet: raw.slice(0, 160) + '…' });
      }
      if (chapters.length > 24) break;
    }
  }
  return { books, chapters };
}

export const INTEGRATION_GUIDE = `INNER ORBIT INTEGRATION GUIDE
• See the full INTEGRATION.md accompanying the source and static builds.
• Standalone state is local to this device. Storage is consolidated behind configureLibraryPersistence in src/data/persistence.ts; no account sync or authentication is implemented.
• Books, chapters and passages have stable IDs. Reading positions and highlights use passage IDs and UTF-16 offsets; treat IDs as permanent when editing content.
• Reading and commentary are labeled separately; review CONTENT-RIGHTS.md before publication.
• Static build: npm run build → dist/ with index.html at its root. Serve as a static website; no backend required.`;
