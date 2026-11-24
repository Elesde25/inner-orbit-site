import { useCallback, useEffect, useState } from 'react';
import { getLibraryPersistence, defaults, type LibraryState, type LibrarySnapshot } from '../data/persistence';
import type { Atmosphere, Bookmark, ProgressEntry } from '../data/types';

export function useLibraryStore() {
  // Bind this mounted reader to its account adapter, even while the host changes accounts.
  const [adapter] = useState(getLibraryPersistence);
  // Read one consistent snapshot before subscribing. Never overwrite damaged storage.
  const [loaded] = useState<{snapshot:LibrarySnapshot;failed:boolean}>(()=>{try{return {snapshot:adapter.load(),failed:false}}catch{return {snapshot:{version:2,library:defaults,highlights:[],ledger:[]},failed:true}}});
  const [highlights,setHighlights]=useState(loaded.snapshot.highlights);
  const [ledger,setLedger]=useState(loaded.snapshot.ledger);
  const [store,setStore]=useState<LibraryState>(loaded.snapshot.library);
  const [storageError,setStorageError]=useState(loaded.failed);
  useEffect(()=>{if(loaded.failed)return;try{adapter.save({version:2,library:store,highlights,ledger});setStorageError(false)}catch{setStorageError(true)}},[adapter,loaded.failed,store,highlights,ledger]);

  // respect OS reduced-motion on first run
  useEffect(() => {
    if (!store.onboardingSeen && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setStore((s) => ({ ...s, atmosphere: 'minimal', readerPrefs: { ...s.readerPrefs, motionSafe: true } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProgress = useCallback((entry: ProgressEntry) => {
    setStore((s) => ({ ...s, progress: { ...s.progress, [entry.bookId]: entry } }));
  }, []);

  const toggleBookmark = useCallback((b: Omit<Bookmark, 'id' | 'created'>) => {
    setStore((s) => {
      const exists = s.bookmarks.find((x) => x.bookId === b.bookId && x.chapterId === b.chapterId && (x.anchor && b.anchor ? x.anchor.passageId===b.anchor.passageId && x.anchor.offset===b.anchor.offset : x.page===b.page));
      if (exists) return { ...s, bookmarks: s.bookmarks.filter((x) => x.id !== exists.id) };
      const nb: Bookmark = { ...b, id: Math.random().toString(36).slice(2), created: Date.now() };
      return { ...s, bookmarks: [nb, ...s.bookmarks].slice(0, 200) };
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setStore((s) => ({ ...s, bookmarks: s.bookmarks.filter((x) => x.id !== id) }));
  }, []);

  const saveNote = useCallback((key: string, text: string) => {
    setStore((s) => ({ ...s, notes: { ...s.notes, [key]: { text, updated: Date.now() } } }));
  }, []);

  const pushRecent = useCallback((bookId: string, chapterId?: string) => {
    setStore((s) => {
      const recent = [{ bookId, chapterId, timestamp: Date.now() }, ...s.recent.filter((r) => r.bookId !== bookId)].slice(0, 12);
      return { ...s, recent };
    });
  }, []);

  const setAtmosphere = useCallback((atmosphere: Atmosphere) => setStore((s) => ({ ...s, atmosphere })), []);
  const setReaderPrefs = useCallback((p: Partial<LibraryState['readerPrefs']>) =>
    setStore((s) => ({ ...s, readerPrefs: { ...s.readerPrefs, ...p } })), []);
  const setSoulHubRoute = useCallback((soulHubRoute: string) => setStore((s) => ({ ...s, soulHubRoute })), []);
  const markOnboarded = useCallback(() => setStore((s) => ({ ...s, onboardingSeen: true })), []);

  const continueReading = Object.values(store.progress).sort((a, b) => b.updated - a.updated)[0] as ProgressEntry | undefined;

  return {
    highlights, setHighlights, ledger, setLedger, storageError, store, updateProgress, toggleBookmark, removeBookmark, saveNote, pushRecent,
    setAtmosphere, setReaderPrefs, setSoulHubRoute, markOnboarded, continueReading,
  };
}

export type LibraryStore = ReturnType<typeof useLibraryStore>;
