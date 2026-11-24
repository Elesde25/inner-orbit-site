import { X, Play, BookOpen, ScrollText, Link2, ShieldCheck, Clock } from 'lucide-react';
import { getBook, getRoom } from '../data/library';
import type { LibraryStore } from '../hooks/useLibraryStore';
import RotatableBook from './RotatableBook';

interface Props {
  bookId: string;
  store: LibraryStore;
  onClose: () => void;
  onRead: (bookId: string, chapterId: string) => void;
  onOpenBook: (bookId: string) => void;
}

export default function BookDetail({ bookId, store, onClose, onRead, onOpenBook }: Props) {
  const book = getBook(bookId);
  const { store: s } = store;
  if (!book) return null;
  const room = getRoom(book.roomId);
  const prog = s.progress[book.id];
  const readable = book.chapters.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div className="glass ornate-frame flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-28 shrink-0 overflow-hidden sm:h-36">
          <img src={room.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0722] via-[#0b0722]/60 to-transparent" />
          <button onClick={onClose} className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur" aria-label="Close book details"><X size={16} /></button>
          <div className="absolute bottom-2 left-5 text-[11px] uppercase tracking-[0.25em]" style={{ color: room.accent }}>{room.name} · {room.subtitle}</div>
        </div>

        <div className="overflow-y-auto p-5 sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex shrink-0 flex-col items-center gap-3">
              <RotatableBook book={book} opening={false} compact motion={s.atmosphere==='full' && !s.readerPrefs.motionSafe && !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)} />
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${book.status === 'forthcoming' ? 'border border-white/20 text-[#a89a7c]' : book.status === 'complete' ? 'bg-[#8fd6a0]/20 text-[#8fd6a0]' : 'bg-[#e8c476]/20 text-[#f7dd9a]'}`}>
                {book.status === 'forthcoming' ? 'Awaiting content' : book.status === 'complete' ? '● Complete' : '◐ Curated selection'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-3xl font-semibold leading-tight text-[#fdf6e3] sm:text-4xl">{book.title}</h2>
              <p className="mt-1 text-sm text-[#a89a7c]">{book.author}</p>
              <p className="mt-1 text-xs italic text-[#8a7c5c]">{book.tradition}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#d8cdb4]">{book.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {book.subjects.map((t) => (<span key={t} className="rounded-full border border-[#e8c476]/30 px-2.5 py-0.5 text-[11px] text-[#e8c476]">{t}</span>))}
                {book.themes.slice(0, 4).map((t) => (<span key={t} className="rounded-full border border-white/12 px-2.5 py-0.5 text-[11px] text-[#a89a7c]">{t}</span>))}
              </div>
              {prog && (
                <div className="mt-3 flex items-center gap-2 text-xs text-[#a89a7c]">
                  <Clock size={13} /> Resume: {prog.chapterTitle} · {Math.round(prog.percent * 100)}%
                  <button onClick={() => onRead(book.id, prog.chapterId)} className="ml-1 inline-flex items-center gap-1 rounded-full bg-[#e8c476]/20 px-3 py-1 font-medium text-[#f7dd9a] transition hover:bg-[#e8c476]/35"><Play size={12} /> Resume</button>
                </div>
              )}
            </div>
          </div>

          {/* TOC */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#e8c476]"><ScrollText size={13} /> {readable ? `Contents · ${book.chapters.length} readings` : 'Contents'} {book.pagesEstimate && <span className="font-normal normal-case text-[#8a7c5c]">— {book.pagesEstimate}</span>}</h3>
            {readable ? (
              <div className="mt-2.5 space-y-2">
                {book.chapters.map((c, i) => {
                  const isCurrent = prog?.chapterId === c.id;
                  return (
                    <button key={c.id} onClick={() => onRead(book.id, c.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${isCurrent ? 'border-[#e8c476]/60 bg-[#e8c476]/10' : 'border-white/8 bg-black/25 hover:border-[#e8c476]/40 hover:bg-[#e8c476]/5'}`}>
                      <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8c476]/40 text-sm text-[#f7dd9a]">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="font-display block truncate text-[16px] font-semibold text-[#fdf6e3]">{c.title}</span>
                        <span className="block truncate text-xs text-[#a89a7c]">{c.subtitle ?? c.sourceLabel}{c.livingPage ? ' · ✦ Living Page' : ''}</span>
                      </span>
                      <BookOpen size={16} className="shrink-0 text-[#e8c476]" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-2.5 rounded-xl border border-dashed border-white/15 bg-black/25 p-5 text-center">
                <p className="font-display text-lg italic text-[#a89a7c]">This volume still sleeps in the vaults.</p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[#8a7c5c]">No readable content yet — this entry is an honest placeholder, never a false promise. Verified public-domain or original text will appear here with full Essence layers. Explore the related works below meanwhile.</p>
              </div>
            )}
          </div>

          {/* rights registry */}
          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8a7c5c]"><ShieldCheck size={13} /> Content rights registry</h3>
            <dl className="mt-2.5 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
              <div><dt className="text-[#8a7c5c]">Work</dt><dd className="text-[#d8cdb4]">{book.title} — {book.author}</dd></div>
              {book.edition.translator && <div><dt className="text-[#8a7c5c]">Translator</dt><dd className="text-[#d8cdb4]">{book.edition.translator}</dd></div>}
              <div><dt className="text-[#8a7c5c]">Edition</dt><dd className="text-[#d8cdb4]">{book.edition.edition}</dd></div>
              <div><dt className="text-[#8a7c5c]">Source</dt><dd className="text-[#d8cdb4]">{book.edition.source}</dd></div>
              <div><dt className="text-[#8a7c5c]">Rights</dt><dd className="text-[#d8cdb4]">{book.edition.rights}</dd></div>
              <div><dt className="text-[#8a7c5c]">Completeness</dt><dd className="text-[#d8cdb4]">{book.edition.completeness}</dd></div>
            </dl>
          </div>

          {/* related */}
          {book.related.length > 0 && (
            <div className="mt-6">
              <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#e8c476]"><Link2 size={13} /> Cross-library connections</h3>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                {book.related.map((r) => {
                  const rb = getBook(r.bookId);
                  if (!rb) return null;
                  return (
                    <button key={r.bookId} onClick={() => onOpenBook(r.bookId)} className="rounded-xl border border-white/8 bg-black/25 p-3 text-left transition hover:border-[#e8c476]/40 hover:bg-[#e8c476]/5">
                      <div className="font-display text-[15px] font-semibold text-[#fdf6e3]">{rb.title}</div>
                      <div className="mt-0.5 text-[11px] text-[#a89a7c]">{rb.author}</div>
                      <div className="mt-1.5 text-xs italic leading-snug text-[#8a7c5c]">Why: {r.reason}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
