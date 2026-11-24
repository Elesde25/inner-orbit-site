import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const directory = mkdtempSync(join(tmpdir(), 'io-library-navigation-'));
try {
  await build({
    entryPoints: ['components/celestial-library/navigation.ts', 'components/celestial-library/data/library.ts'],
    outdir: directory, bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' },
  });
  const { readLibraryRoute, libraryRouteUrl } = await import(pathToFileURL(join(directory, 'navigation.mjs')));
  const { allBooks, rooms } = await import(pathToFileURL(join(directory, 'data/library.mjs')));
  assert.deepEqual(readLibraryRoute(''), { view: { name: 'atrium' }, ledger: null });
  assert.equal(readLibraryRoute('?ledger=1').ledger, '1');
  assert.equal(readLibraryRoute('?ledger=note-123').ledger, 'note-123');
  assert.equal(readLibraryRoute('?ledger').ledger, '1');
  assert.equal(libraryRouteUrl({ view: { name: 'atrium' }, ledger: null }), '/library');
  for (const room of rooms) {
    const route = { view: { name: 'room', roomId: room.id }, ledger: null };
    assert.deepEqual(readLibraryRoute(libraryRouteUrl(route).split('?')[1]), route);
  }
  let count = 0;
  for (const book of allBooks) for (const chapter of book.chapters) {
    const passage = chapter.verses.flatMap(v => v.lines)[0];
    const route = {
      view: { name: 'reader', bookId: book.id, chapterId: chapter.id },
      anchor: { passageId: passage.id, offset: Math.min(7, passage.text.length) },
      ledger: 'note-123',
    };
    const url = libraryRouteUrl(route);
    assert.deepEqual(readLibraryRoute(new URL(url, 'http://localhost').search), route);
    const invalid = new URL(url, 'http://localhost');
    invalid.searchParams.set('passage', 'not-in-this-chapter');
    assert.equal(readLibraryRoute(invalid.search).anchor, undefined);
    for (const offset of ['-1', 'NaN', 'Infinity', '1.5']) {
      const changed = new URL(url, 'http://localhost');
      changed.searchParams.set('offset', offset);
      assert.equal(readLibraryRoute(changed.search).anchor.offset, 0);
    }
    const tooFar = new URL(url, 'http://localhost');
    tooFar.searchParams.set('offset', '10000000');
    assert.equal(readLibraryRoute(tooFar.search).anchor.offset, passage.text.length);
    count++;
  }
  assert.deepEqual(readLibraryRoute('?room=unknown&book=missing&chapter=missing&passage=missing'), { view: { name: 'atrium' }, ledger: null });
  console.log(`PASS: ${count} chapter/passage/offset/note-link round trips, all rooms, invalid IDs, malformed offsets and notebook closure URLs.`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
