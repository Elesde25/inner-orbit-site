import { ArrowRight, Bookmark as BookmarkIcon, Clock, Play, Search, Sparkles, ScrollText } from 'lucide-react';
import { rooms, featuredBooks, getBook, readableBooks } from '../data/library';
import type { LibraryStore } from '../hooks/useLibraryStore';
import type { RoomId } from '../data/types';
import Starfield from './Starfield';
import BookCover from './BookCover';

interface Props {
  store: LibraryStore;
  onRoom: (r: RoomId) => void;
  onOpenBook: (bookId: string) => void;
  onOpenChapter: (bookId: string, chapterId: string, page?: number, direct?: boolean, anchor?: import('../data/types').PassageAnchor) => void;
  onSearch: () => void;
}

export default function Atrium({ store, onRoom, onOpenBook, onOpenChapter, onSearch }: Props) {
  const { store: s, continueReading } = store;
  const featured = featuredBooks();
  const readable = readableBooks();

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      {/* environment */}
      <div className="fixed inset-0 -z-10">
        <img src="/library-assets/images/atrium.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060312]/72 via-[#060312]/55 to-[#060312]" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,.28), transparent 60%)' }} />
      </div>
      <Starfield atmosphere={s.atmosphere} density={1.15} />

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
        {/* hero */}
        <section className="animate-rise mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8c476]/40 bg-black/40 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-[#e8c476]">
            <Sparkles size={12} /> Inner Orbit presents
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-7xl">
            <span className="gold-text">The Celestial Library</span>
          </h1>
          <p className="font-display mt-3 text-xl italic text-[#d8cdb4] sm:text-2xl">“Boldly go where you’ve always been.”</p>
          <p className="text-balance mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#c9bda0] sm:text-[15px]">
            An impossible repository among the stars — sacred texts, philosophy, consciousness, and hidden patterns —
            gathered for wonder, tranquility, and return. Choose a portal below. Every room tells you plainly what it holds.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <button onClick={onSearch} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8a5a1c] to-[#c99a3f] px-6 py-2.5 text-sm font-semibold text-[#120b2e] shadow-[0_0_30px_rgba(232,196,118,.45)] transition hover:brightness-110">
              <Search size={15} /> Search the entire library
            </button>
            {continueReading && (
              <button onClick={() => onOpenChapter(continueReading.bookId, continueReading.chapterId)} className="glass flex items-center gap-2 rounded-full px-6 py-2.5 text-sm text-[#f7dd9a] transition hover:bg-[#e8c476]/15">
                <Play size={15} /> Continue: {continueReading.bookTitle}
              </button>
            )}
          </div>
          <div className="mt-4 text-[11px] uppercase tracking-[0.25em] text-[#8a7c5c]">{readable.length} readable works · {readable.reduce((n, b) => n + b.chapters.length, 0)} illuminated readings</div>
        </section>

        {/* portals */}
        <section className="mt-12" aria-label="Library rooms">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {rooms.map((r, i) => {
              const count = readableBooks().filter((b) => b.roomId === r.id).reduce((n, b) => n + b.chapters.length, 0);
              return (
                <article
                  key={r.id}
                  className="animate-rise group relative cursor-pointer overflow-hidden rounded-2xl border border-[#e8c476]/25 transition duration-300 hover:-translate-y-1.5 hover:border-[#e8c476]/60 hover:shadow-[0_20px_60px_rgba(0,0,0,.6)]"
                  style={{ animationDelay: `${i * 90}ms`, boxShadow: `0 0 40px ${r.glow}` }}
                  onClick={() => onRoom(r.id)}
                  onKeyDown={(e) => e.key === 'Enter' && onRoom(r.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Enter ${r.name}: ${r.subtitle}`}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={r.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0722] via-[#0b0722]/30 to-transparent" />
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/50 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: r.accent, borderColor: r.accent + '66', background: 'rgba(0,0,0,.5)' }}>
                      {count} readings
                    </span>
                  </div>
                  <div className="nebula-panel relative p-5 pt-3">
                    <h2 className="font-display text-[22px] font-semibold leading-tight text-[#fdf6e3]">{r.name}</h2>
                    <p className="mt-1 text-[12.5px] font-medium" style={{ color: r.accent }}>{r.subtitle}</p>
                    <p className="mt-2 line-clamp-2 font-display text-[14px] italic leading-snug text-[#a89a7c]">“{r.motto}”</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#f7dd9a] transition group-hover:gap-3">
                      Enter the room <ArrowRight size={15} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* dashboard */}
        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          {/* continue / recent */}
          <div className="glass rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#e8c476]"><Clock size={13} /> Continue reading</h3>
            {continueReading ? (
              <button onClick={() => onOpenChapter(continueReading.bookId, continueReading.chapterId)} className="mt-3 w-full rounded-xl border border-[#e8c476]/25 bg-black/30 p-4 text-left transition hover:bg-[#e8c476]/10">
                <div className="font-display text-lg font-semibold text-[#fdf6e3]">{continueReading.bookTitle}</div>
                <div className="text-xs text-[#a89a7c]">{continueReading.chapterTitle} · page {continueReading.page + 1} of {continueReading.totalPages}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#8a5a1c] to-[#f7dd9a]" style={{ width: `${Math.round(continueReading.percent * 100)}%` }} />
                </div>
              </button>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-[#a89a7c]">Your journey hasn’t begun. Open any reading — the Library will keep your place among the stars.</p>
            )}
            {s.recent.length > 0 && (
              <div className="mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a7c5c]">Recently visited</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.recent.slice(0, 6).map((r, i) => {
                    const b = getBook(r.bookId);
                    if (!b) return null;
                    return (
                      <button key={i} onClick={() => (r.chapterId ? onOpenChapter(r.bookId, r.chapterId) : onOpenBook(r.bookId))} className="max-w-full truncate rounded-full border border-white/12 px-3 py-1 text-xs text-[#c9bda0] transition hover:border-[#e8c476]/50 hover:text-[#f7dd9a]">
                        {b.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* bookmarks */}
          <div className="glass rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#e8c476]"><BookmarkIcon size={13} /> Personal bookmarks · {s.bookmarks.length}</h3>
            {s.bookmarks.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-[#a89a7c]">Mark any page with the ribbon while reading and it will wait for you here — kept in your account when signed in, or in this browser as a guest.</p>
            ) : (
              <ul className="mt-3 max-h-44 space-y-1.5 overflow-y-auto pr-1">
                {s.bookmarks.slice(0, 8).map((bm) => (
                  <li key={bm.id}>
                    <button onClick={() => onOpenChapter(bm.bookId, bm.chapterId, bm.anchor ? undefined : bm.page, false, bm.anchor)} className="flex w-full items-center gap-2 rounded-lg border border-white/8 bg-black/25 px-3 py-2 text-left text-xs transition hover:border-[#e8c476]/40">
                      <BookmarkIcon size={12} className="shrink-0 text-[#e8c476]" />
                      <span className="min-w-0 truncate text-[#d8cdb4]">{bm.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 border-t border-white/8 pt-2 text-[11px] italic text-[#8a7c5c]">Your account and sync status is shown in the control below.</p>
          </div>

          {/* about tome */}
          <div className="glass rounded-2xl border-[#c9a8ff]/25 p-5" style={{ boxShadow: '0 0 40px rgba(124,58,237,.2)' }}>
            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c9a8ff]"><ScrollText size={13} /> The Living Tome</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#c9bda0]">
              Every reading opens as a handcrafted tome — real pages that turn, Essence layers that illuminate without cluttering, and Living Pages where illustrations wake at your touch.
            </p>
            <button onClick={() => onOpenChapter('tao-te-ching', 'ttc-8')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#f7dd9a] hover:gap-3 transition-all">
              Open a first reading: Water <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* featured */}
        <section className="mt-10" aria-label="Featured works">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold text-[#fdf6e3]">Featured Works</h2>
              <div className="gold-rule mt-2 w-40" />
            </div>
            <span className="text-xs text-[#8a7c5c]">Public-domain sources & original companions</span>
          </div>
          <div className="featured-shelf">
            {featured.map((b) => (
              <button key={b.id} onClick={() => onOpenBook(b.id)} className="featured-book group flex w-full min-w-0 flex-col items-center gap-2.5 text-center" aria-label={`View ${b.title}`}>
                <div className="transition group-hover:drop-shadow-[0_0_25px_rgba(232,196,118,.45)]">
                  <BookCover bookId={b.id} cover={b.cover} title={b.title} author={b.author} size="md" />
                </div>
                <span className="w-full max-w-[190px]">
                  <span className="font-display block text-[17px] font-semibold leading-tight text-[#fdf6e3]">{b.title}</span>
                  <span className="mt-0.5 block text-[11px] text-[#a89a7c]">{b.status === 'forthcoming' ? 'Awaiting' : `${b.chapters.length} readings`} · {rooms.find((r) => r.id === b.roomId)?.name.replace('The ', '')}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-[#e8c476]/15 pt-6 text-center text-[11px] leading-relaxed text-[#8a7c5c]">
          <p className="font-display text-sm italic text-[#a89a7c]">“Boldly go where you’ve always been.”</p>
          <p className="mt-2">The Celestial Library · prototype {`v0.1`} · Historical texts with attribution · Original Inner Orbit commentary · Edition, translation and artwork rights are still under review before publication.</p>
        </footer>
      </main>
    </div>
  );
}
