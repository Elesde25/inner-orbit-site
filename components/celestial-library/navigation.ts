import { getBook, rooms } from './data/library';
import type { PassageAnchor, RoomId } from './data/types';

export type LibraryView =
  | { name: 'atrium' }
  | { name: 'room'; roomId: RoomId }
  | { name: 'reader'; bookId: string; chapterId: string };

export interface LibraryRoute {
  view: LibraryView;
  anchor?: PassageAnchor;
  /** "1" opens the notebook list; another value identifies a saved note. */
  ledger: string | null;
}

/** Resolve only catalog-backed locations; untrusted links never select arbitrary content. */
export function readLibraryRoute(search: string): LibraryRoute {
  const params = new URLSearchParams(search);
  const ledger = params.has('ledger') ? params.get('ledger') || '1' : null;
  const book = getBook(params.get('book') || '');
  const chapter = book?.chapters.find(c => c.id === params.get('chapter'));
  if (book && chapter) {
    const passage = chapter.verses.flatMap(v => v.lines).find(p => p.id === params.get('passage'));
    const rawOffset = Number(params.get('offset') || 0);
    const offset = Number.isSafeInteger(rawOffset) && rawOffset >= 0 ? Math.min(rawOffset, passage?.text.length ?? 0) : 0;
    return {
      view: { name: 'reader', bookId: book.id, chapterId: chapter.id },
      ...(passage ? { anchor: { passageId: passage.id, offset } } : {}),
      ledger,
    };
  }
  const room = rooms.find(r => r.id === params.get('room'));
  return { view: room ? { name: 'room', roomId: room.id } : { name: 'atrium' }, ledger };
}

export function libraryRouteUrl({ view, anchor, ledger }: LibraryRoute): string {
  const params = new URLSearchParams();
  if (view.name === 'reader') {
    params.set('book', view.bookId);
    params.set('chapter', view.chapterId);
    if (anchor) {
      params.set('passage', anchor.passageId);
      if (anchor.offset > 0) params.set('offset', String(anchor.offset));
    }
  } else if (view.name === 'room') params.set('room', view.roomId);
  if (ledger !== null) params.set('ledger', ledger);
  return '/library' + (params.size ? '?' + params.toString() : '');
}
