import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, BookOpen, ScrollText } from 'lucide-react';
import { searchLibrary, rooms } from '../data/library';

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenBook: (bookId: string) => void;
  onOpenChapter: (bookId: string, chapterId: string) => void;
}

export default function SearchOverlay({ open, onClose, onOpenBook, onOpenChapter }: Props) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchLibrary(q), [q]);

  useEffect(() => {
    if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 60); }
  }, [open ]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] flex items-start justify-center overflow-y-auto bg-black/75 p-4 pt-20 backdrop-blur-sm" onClick={onClose}>
      <div className="glass ornate-frame w-full max-w-2xl rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[#e8c476]/20 p-4">
          <Search size={18} className="shrink-0 text-[#e8c476]" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search works, authors, traditions, themes, passages…" className="w-full bg-transparent text-[15px] text-[#fdf6e3] outline-none placeholder:text-[#8a7c5c]" aria-label="Search the entire library" />
          <button onClick={onClose} className="rounded-full border border-white/15 p-1.5 text-[#a89a7c]" aria-label="Close search"><X size={15} /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!q.trim() && (
            <div className="px-2 py-4 text-center">
              <p className="font-display text-lg italic text-[#a89a7c]">“Ask, and the shelves will answer.”</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {['wu wei', 'Stoicism', 'mandala', 'water', 'dreams', 'golden ratio', 'compassion', 'time'].map((s) => (
                  <button key={s} onClick={() => setQ(s)} className="rounded-full border border-[#e8c476]/30 px-3 py-1 text-xs text-[#e8c476] transition hover:bg-[#e8c476]/10">{s}</button>
                ))}
              </div>
            </div>
          )}
          {q.trim() && results.books.length === 0 && results.chapters.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-[#a89a7c]">No matches in the stacks. Try “water,” “Stoic,” “mandala,” or “dreams.”</p>
          )}
          {results.books.length > 0 && (
            <>
              <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a89a7c]">Works ({results.books.length})</div>
              {results.books.map((b) => {
                const room = rooms.find((r) => r.id === b.roomId);
                return (
                  <button key={b.id} onClick={() => onOpenBook(b.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#e8c476]/10">
                    <BookOpen size={16} className="shrink-0" style={{ color: room?.accent }} />
                    <span className="min-w-0">
                      <span className="font-display block truncate text-[16px] font-semibold text-[#fdf6e3]">{b.title}</span>
                      <span className="block truncate text-[11px] text-[#a89a7c]">{b.author} · {room?.name} · {b.status === 'forthcoming' ? 'Awaiting content' : `${b.chapters.length} readings`}</span>
                    </span>
                  </button>
                );
              })}
            </>
          )}
          {results.chapters.length > 0 && (
            <>
              <div className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a89a7c]">Passages & readings ({results.chapters.length})</div>
              {results.chapters.slice(0, 12).map((c, i) => (
                <button key={i} onClick={() => onOpenChapter(c.book.id, c.chapterId)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#e8c476]/10">
                  <ScrollText size={16} className="mt-0.5 shrink-0 text-[#e8c476]" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[#fdf6e3]">{c.title} <span className="font-normal text-[#a89a7c]">— {c.book.title}</span></span>
                    <span className="block truncate text-xs text-[#8a7c5c]">{c.snippet}</span>
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
