import { useMemo, useState } from 'react';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import { booksInRoom, getRoom } from '../data/library';
import type { LibraryStore } from '../hooks/useLibraryStore';
import type { RoomId } from '../data/types';
import Starfield from './Starfield';
import BookCover from './BookCover';

interface Props {
  roomId: RoomId;
  store: LibraryStore;
  onBack: () => void;
  onOpenBook: (bookId: string) => void;
  onOpenChapter: (bookId: string, chapterId: string) => void;
}

export default function RoomView({ roomId, store, onBack, onOpenBook, onOpenChapter }: Props) {
  const room = getRoom(roomId);
  const { store: s } = store;
  const books = booksInRoom(roomId);
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState<string>('all');
  const [status, setStatus] = useState<'all' | 'readable' | 'forthcoming'>('all');

  const subjects = useMemo(() => ['all', ...Array.from(new Set(books.flatMap((b) => b.subjects)))], [books]);
  const filtered = books.filter((b) => {
    if (subject !== 'all' && !b.subjects.includes(subject)) return false;
    if (status === 'readable' && b.chapters.length === 0) return false;
    if (status === 'forthcoming' && b.chapters.length > 0) return false;
    if (q.trim()) {
      const t = (b.title + b.author + b.tradition + b.description + b.themes.join(' ')).toLowerCase();
      if (!t.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <img src={room.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060312]/78 via-[#060312]/62 to-[#060312]" />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 20%, ${room.glow}, transparent 60%)` }} />
      </div>
      <Starfield atmosphere={s.atmosphere} density={0.9} />

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
        <button onClick={onBack} className="glass flex items-center gap-1.5 rounded-full px-4 py-2 text-xs text-[#e8c476] transition hover:bg-[#e8c476]/10">
          <ArrowLeft size={14} /> Grand Atrium
        </button>

        <section className="animate-rise mt-6 max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: room.accent }}>Inner Orbit · Celestial Library</div>
          <h1 className="font-display mt-2 text-4xl font-semibold leading-tight text-[#fdf6e3] sm:text-6xl">{room.name}</h1>
          <p className="font-display mt-1 text-xl italic" style={{ color: room.accent }}>{room.subtitle}</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#d8cdb4] sm:text-[15px]">{room.description}</p>
          <p className="font-display mt-2 text-[15px] italic text-[#a89a7c]">“{room.motto}”</p>
        </section>

        {/* catalog controls */}
        <section className="glass mt-8 rounded-2xl p-3 sm:p-4" aria-label="Catalog controls">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-[#e8c476]/25 bg-black/40 px-3.5 py-2.5">
              <Search size={16} className="shrink-0 text-[#e8c476]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search within ${room.name}…`} className="w-full bg-transparent text-sm text-[#fdf6e3] outline-none placeholder:text-[#8a7c5c]" aria-label={`Search within ${room.name}`} />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#8a7c5c]"><SlidersHorizontal size={13} /> Subject</span>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-lg border border-white/12 bg-black/50 px-2.5 py-2 text-xs text-[#d8cdb4] outline-none" aria-label="Filter by subject">
                {subjects.map((t) => (<option key={t} value={t}>{t === 'all' ? 'All subjects' : t}</option>))}
              </select>
              <div className="flex overflow-hidden rounded-lg border border-white/12" role="group" aria-label="Filter by availability">
                {(['all', 'readable'] as const).map((v) => (
                  <button key={v} onClick={() => setStatus(v)} className={`px-3 py-2 text-xs capitalize transition ${status === v ? 'bg-[#e8c476]/25 text-[#f7dd9a]' : 'text-[#a89a7c] hover:bg-white/5'}`}>{v === 'all' ? 'All' : v}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 px-1 text-[11px] text-[#8a7c5c]">{filtered.length} of {books.length} volumes · {filtered.reduce((n, b) => n + b.chapters.length, 0)} readings shown</div>
        </section>

        {/* shelves */}
        <section className="mt-6 space-y-4" aria-label="Catalog">
          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="font-display text-xl italic text-[#a89a7c]">No volumes answer to that seeking.</p>
              <button onClick={() => { setQ(''); setSubject('all'); setStatus('all'); }} className="mt-3 rounded-full border border-[#e8c476]/40 px-4 py-1.5 text-xs text-[#e8c476]">Clear filters</button>
            </div>
          )}
          {filtered.map((b, i) => {
            const prog = s.progress[b.id];
            const readable = b.chapters.length > 0;
            return (
              <article key={b.id} className="animate-rise glass group flex flex-col gap-4 rounded-2xl p-4 transition hover:border-[#e8c476]/50 sm:flex-row sm:gap-6 sm:p-5" style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}>
                <button onClick={() => onOpenBook(b.id)} className="mx-auto shrink-0 transition group-hover:-translate-y-1 sm:mx-0" aria-label={`View details of ${b.title}`}>
                  <BookCover bookId={b.id} cover={b.cover} title={b.title} author={b.author} size="md" status={b.status} />
                </button>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${readable ? 'bg-[#8fd6a0]/15 text-[#8fd6a0]' : 'border border-white/15 text-[#8a7c5c]'}`}>
                      {readable ? `${b.chapters.length} readings` : 'Awaiting content'}
                    </span>
                    {b.edition.contentType === 'original' && <span className="rounded-full bg-[#c9a8ff]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#c9a8ff]">Inner Orbit original</span>}
                    {b.edition.contentType === 'public-domain' && <span className="rounded-full bg-[#7fb8ff]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#7fb8ff]">Public domain</span>}
                  </div>
                  <h2 className="font-display mt-1.5 text-2xl font-semibold text-[#fdf6e3] sm:text-[26px]">{b.title}</h2>
                  <p className="text-xs text-[#a89a7c]">{b.author} · {b.tradition}</p>
                  <p className="mx-auto mt-2 line-clamp-3 max-w-2xl text-[13px] leading-relaxed text-[#c9bda0] sm:mx-0">{b.description}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                    {b.subjects.map((t) => (<span key={t} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-[#a89a7c]">{t}</span>))}
                  </div>
                  {prog && readable && (
                    <div className="mx-auto mt-2 h-1 max-w-md overflow-hidden rounded-full bg-white/10 sm:mx-0">
                      <div className="h-full bg-gradient-to-r from-[#8a5a1c] to-[#f7dd9a]" style={{ width: `${Math.round(prog.percent * 100)}%` }} />
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {readable ? (
                      <>
                        <button onClick={() => onOpenChapter(b.id, prog?.chapterId ?? b.chapters[0].id)} className="rounded-full bg-gradient-to-r from-[#8a5a1c] to-[#c99a3f] px-5 py-2 text-[13px] font-semibold text-[#120b2e] transition hover:brightness-110">
                          {prog ? `Resume · ${prog.chapterTitle}` : `Begin · ${b.chapters[0].title}`}
                        </button>
                        <button onClick={() => onOpenBook(b.id)} className="rounded-full border border-[#e8c476]/40 px-5 py-2 text-[13px] text-[#e8c476] transition hover:bg-[#e8c476]/10">Details & contents</button>
                      </>
                    ) : (
                      <button onClick={() => onOpenBook(b.id)} className="rounded-full border border-white/20 px-5 py-2 text-[13px] text-[#c9bda0] transition hover:border-[#e8c476]/40 hover:text-[#f7dd9a]">Preview entry (no text yet)</button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
