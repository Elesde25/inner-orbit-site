import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { create, act } from 'react-test-renderer';

// Exercise the real host's hooks and async work without a browser, user data or live API.
const directory = mkdtempSync(resolve('.sites-runtime/library-host-tests-'));
const original = { fetch: globalThis.fetch, window: globalThis.window, localStorage: globalThis.localStorage };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let renderer;
const pending = [];
const requests = [];
const records = new Map();
let quotaError = false;
const listeners = new Map();
const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const expectRequest = (path, value, method = 'GET') => pending.push({ path, value, method });
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
const userA = { id: 'account-a', email: 'a@example.invalid' };
const userB = { id: 'account-b', email: 'b@example.invalid' };
globalThis.localStorage = { getItem: key => records.get(key) ?? null, setItem: (key, value) => { if (quotaError) throw Error('QuotaExceededError'); records.set(key, value); } };
globalThis.window = {
  addEventListener: (name, handler) => listeners.set(name, handler),
  removeEventListener: (name, handler) => { if (listeners.get(name) === handler) listeners.delete(name); },
};
globalThis.fetch = async (path, options = {}) => {
  requests.push({ path, method: options.method || 'GET', body: options.body });
  const planned = pending.shift();
  assert(planned, `Unexpected request: ${path}`);
  assert.equal(path, planned.path);
  assert.equal(options.method || 'GET', planned.method);
  return await planned.value;
};
try {
  await build({
    stdin: { contents: `export {default as Host} from './components/celestial-library/LibraryHost.tsx'; export {getLibraryPersistence,configureLibraryPersistence} from './components/celestial-library/data/persistence.ts'; export {emptySnapshot} from './components/celestial-library/accountPersistence.ts'; export {useLibraryStore} from './components/celestial-library/hooks/useLibraryStore.ts';`, resolveDir: process.cwd() },
    outfile: join(directory, 'host.mjs'), bundle: true, platform: 'node', format: 'esm',
    external: ['react', 'react/jsx-runtime'], jsx: 'automatic',
    plugins: [{ name: 'reading-surface-stub', setup(builder) {
      builder.onResolve({ filter: /^\.\/App$/ }, () => ({ path: 'reader', namespace: 'test-reader' }));
      builder.onLoad({ filter: /.*/, namespace: 'test-reader' }, () => ({ contents: `import React from 'react'; export default function Reader(){return React.createElement('p',null,'Library ready')}` }));
    } }],
  });
  const { Host, getLibraryPersistence, configureLibraryPersistence, emptySnapshot, useLibraryStore } = await import(pathToFileURL(join(directory, 'host.mjs')));
  const snapshot = title => ({ ...emptySnapshot(), ledger: [{ id: title, title, text: title, tags: '', updated: 1 }] });
  const remote = (user, title, revision = 1) => response({ userId: user.id, snapshot: snapshot(title), revision });
  const mount = async () => { await act(async () => { renderer = create(React.createElement(Host)); await flush(); }); };
  const click = async text => { await act(async () => { renderer.root.findAllByType('button').find(b => b.props.children === text).props.onClick(); await flush(); }); };
  const unmount = async () => { await act(async () => { renderer.unmount(); await flush(); }); renderer = null; assert.equal(pending.length, 0); };

  // Offline startup must leave an account cache untouched until its owner is confirmed.
  const recovery = { snapshot: snapshot('Offline recovery'), base: emptySnapshot(), revision: 0, dirty: true };
  records.set('io:library:account-a:v2', JSON.stringify(recovery));
  expectRequest('/api/orbit/session', Promise.reject(Error('Network offline')));
  await mount();
  assert(JSON.stringify(renderer.toJSON()).includes('Network offline'));
  assert(JSON.stringify(renderer.toJSON()).includes('Your local account recovery was left untouched'));
  assert.equal(records.get('io:library:account-a:v2'), JSON.stringify(recovery));
  assert(!requests.some(r => r.path === '/api/library'), 'Offline boot tried account API before session confirmation');
  expectRequest('/api/orbit/session', response({ user: userA }));
  expectRequest('/api/library', response({ userId: userA.id, snapshot: emptySnapshot(), revision: 0 }));
  await click('Retry connection');
  assert.equal(getLibraryPersistence().load().ledger[0].title, 'Offline recovery');
  records.delete('io:library:account-a:v2');
  await unmount();
  console.log('PASS offline startup keeps account recovery untouched and retry restores after session confirmation');

  // Reconnecting an edited tab must merge a write committed by another tab.
  const sharedBase = emptySnapshot();
  sharedBase.ledger.push({ id: 'shared-base', title: 'Shared base', text: 'Base', tags: '', updated: 1 });
  expectRequest('/api/orbit/session', response({ user: userA }));
  expectRequest('/api/library', response({ userId: userA.id, snapshot: sharedBase, revision: 1 }));
  await mount();
  await act(async () => {
    const changed = getLibraryPersistence().load();
    changed.ledger.push({ id: 'local-tab', title: 'Local tab edit', text: 'Local', tags: '', updated: 2 });
    getLibraryPersistence().save(changed); await flush();
  });
  const remoteTab = structuredClone(sharedBase);
  remoteTab.ledger.push({ id: 'remote-tab', title: 'Other tab edit', text: 'Remote', tags: '', updated: 3 });
  expectRequest('/api/orbit/session', response({ user: userA }));
  expectRequest('/api/library', response({ error: 'Another device changed these records.', snapshot: remoteTab, revision: 2 }, 409), 'PUT');
  await act(async () => { listeners.get('focus')(); await flush(); });
  let mergedTitles = getLibraryPersistence().load().ledger.map(note => note.title);
  assert(mergedTitles.includes('Local tab edit'));
  assert(mergedTitles.includes('Other tab edit'));
  expectRequest('/api/orbit/session', response({ user: userA }));
  expectRequest('/api/library', response({ revision: 3 }), 'PUT');
  await act(async () => { listeners.get('focus')(); await flush(); });
  const recovered = JSON.parse(records.get('io:library:account-a:v2'));
  assert.equal(recovered.revision, 3);
  assert.equal(recovered.dirty, false);
  await unmount();
  console.log('PASS focus reconnect merges concurrent tab edits and saves latest revision');

  // A's request starts first, B finishes first, then A returns late.
  const lateA = deferred();
  expectRequest('/api/orbit/session', response({ user: userA }));
  expectRequest('/api/library', lateA.promise);
  await mount();
  expectRequest('/api/orbit/session', response({ user: userB }));
  expectRequest('/api/library', remote(userB, 'B private note'));
  await click('Refresh / retry');
  await act(async () => { lateA.resolve(remote(userA, 'A private note')); await flush(); });
  assert.equal(getLibraryPersistence().load().ledger[0].title, 'B private note', 'Late A response replaced B state');
  assert.equal(JSON.parse(records.get('io:library:account-b:v2')).snapshot.ledger[0].title, 'B private note');
  await unmount();
  console.log('PASS late account A load cannot replace or persist over account B');

  // A failed older load must not overwrite B's success status.
  const failedA = deferred();
  expectRequest('/api/orbit/session', response({ user: userA }));
  expectRequest('/api/library', failedA.promise);
  await mount();
  expectRequest('/api/orbit/session', response({ user: userB }));
  expectRequest('/api/library', remote(userB, 'B private note'));
  await click('Refresh / retry');
  await act(async () => { failedA.resolve(response({ error: 'Old account failure' }, 503)); await flush(); });
  assert(!JSON.stringify(renderer.toJSON()).includes('Old account failure'));
  await unmount();
  console.log('PASS stale account load failures cannot replace current status');

  // A pending write must neither block B's write nor unlock it when A finishes.
  expectRequest('/api/orbit/session', response({ user: userA }));
  expectRequest('/api/library', remote(userA, 'A private note'));
  await mount();
  const adapterA = getLibraryPersistence();
  await act(async () => {
    const changed = adapterA.load(); changed.ledger[0].text = 'A pending edit';
    adapterA.save(changed); await flush();
  });
  const writeA = deferred();
  expectRequest('/api/library', writeA.promise, 'PUT');
  await click('Refresh / retry');
  expectRequest('/api/orbit/session', response({ user: userB }));
  expectRequest('/api/orbit/session', response({ user: userB }));
  expectRequest('/api/library', remote(userB, 'B private note'));
  await act(async () => { listeners.get('focus')(); await flush(); });
  assert.throws(() => adapterA.save(snapshot('Wrong owner')), /Account changed/);
  await act(async () => {
    const changed = getLibraryPersistence().load(); changed.ledger[0].text = 'B pending edit';
    getLibraryPersistence().save(changed); await flush();
  });
  const writeB = deferred();
  expectRequest('/api/library', writeB.promise, 'PUT');
  await click('Refresh / retry');
  assert.equal(pending.length, 0, 'A write blocked B after account switch');
  await act(async () => { writeA.resolve(response({ revision: 99 })); await flush(); });
  const beforeDuplicate = requests.length;
  await click('Refresh / retry');
  assert.equal(requests.length, beforeDuplicate, 'A completion unlocked B while B write remained pending');
  await act(async () => { writeB.resolve(response({ revision: 2 })); await flush(); });
  const switched = JSON.parse(records.get('io:library:account-b:v2'));
  assert.equal(switched.snapshot.ledger[0].text, 'B pending edit');
  assert.equal(switched.revision, 2);
  assert.equal(switched.dirty, false);
  await unmount();
  console.log('PASS account-scoped write locks and stale-adapter rejection during overlapping A/B requests');

  // Simulate an offline PUT; the dirty snapshot must remain available for retry.
  expectRequest('/api/orbit/session', response({ user: userB }));
  expectRequest('/api/library', remote(userB, 'B private note'));
  await mount();
  await act(async () => {
    const changed = getLibraryPersistence().load(); changed.ledger[0].text = 'Offline edit';
    getLibraryPersistence().save(changed); await flush();
  });
  expectRequest('/api/library', response({ error: 'Offline test' }, 503), 'PUT');
  await click('Refresh / retry');
  let cached = JSON.parse(records.get('io:library:account-b:v2'));
  assert(cached.dirty); assert.equal(cached.snapshot.ledger[0].text, 'Offline edit');
  expectRequest('/api/library', response({ revision: 2 }), 'PUT');
  await click('Refresh / retry');
  cached = JSON.parse(records.get('io:library:account-b:v2'));
  assert.equal(cached.dirty, false); assert.equal(cached.revision, 2);
  await unmount();
  console.log('PASS failed saves retain dirty local recovery and manual retry commits it');

  // Quota failure must still allow account-backed sync and recovery export.
  expectRequest('/api/orbit/session', response({ user: userB }));
  expectRequest('/api/library', remote(userB, 'B private note'));
  await mount();
  quotaError = true;
  await act(async () => {
    const changed = getLibraryPersistence().load(); changed.ledger[0].text = 'Account-synced despite browser quota';
    getLibraryPersistence().save(changed); await flush();
  });
  expectRequest('/api/library', response({ revision: 2 }), 'PUT');
  await click('Refresh / retry');
  assert.equal(getLibraryPersistence().load().ledger[0].text, 'Account-synced despite browser quota');
  assert(JSON.stringify(renderer.toJSON()).includes('browser recovery unavailable'));
  quotaError = false;
  await unmount();
  console.log('PASS browser quota failure does not block account sync and reports recovery limits');

  // Sign-out waits for an active save before revoking the account session.
  expectRequest('/api/orbit/session', response({ user: userB }));
  expectRequest('/api/library', remote(userB, 'B private note'));
  await mount();
  await act(async () => {
    const changed = getLibraryPersistence().load(); changed.ledger[0].text = 'Must sync before sign-out';
    getLibraryPersistence().save(changed); await flush();
  });
  const pendingSave = deferred();
  expectRequest('/api/library', pendingSave.promise, 'PUT');
  expectRequest('/api/orbit/logout', response({ ok: true }), 'POST');
  expectRequest('/api/orbit/session', response({ user: null }));
  await click('Sign out');
  assert(requests.some(r => r.path === '/api/library' && r.method === 'PUT'));
  assert(!requests.some(r => r.path === '/api/orbit/logout'), 'Logout raced ahead of active save');
  await act(async () => { pendingSave.resolve(response({ revision: 2 })); await flush(); });
  assert(requests.some(r => r.path === '/api/orbit/logout'), 'Logout did not continue after successful save');
  assert.equal(requests.find(r => r.path === '/api/orbit/logout').body, JSON.stringify({ userId: userB.id }));
  await unmount();
  console.log('PASS sign-out waits for active account save before revoking session');

  // A failed flush must keep the session active so the user can retry.
  expectRequest('/api/orbit/session', response({ user: userB }));
  expectRequest('/api/library', remote(userB, 'B private note'));
  await mount();
  await act(async () => {
    const changed = getLibraryPersistence().load(); changed.ledger[0].text = 'Keep session after failed save';
    getLibraryPersistence().save(changed); await flush();
  });
  expectRequest('/api/library', response({ error: 'Offline test' }, 503), 'PUT');
  const beforeFailedSignOut = requests.length;
  await click('Sign out');
  assert(!requests.slice(beforeFailedSignOut).some(r => r.path === '/api/orbit/logout'), 'Failed save still revoked the session');
  assert.equal(JSON.parse(records.get('io:library:account-b:v2')).dirty, true);
  await unmount();
  console.log('PASS sign-out preserves session and dirty edits when save fails');

  // A mounted reader must not pick up a new account's module-global adapter for old effects.
  let oldStore, validA = true, savedB = [];
  configureLibraryPersistence({ load: () => snapshot('A only'), save: () => { if (!validA) throw Error('Account changed'); } });
  function ReaderStore() { oldStore = useLibraryStore(); return null; }
  await act(async () => { renderer = create(React.createElement(ReaderStore)); await flush(); });
  validA = false;
  configureLibraryPersistence({ load: () => snapshot('B only'), save: value => savedB.push(value) });
  await act(async () => { oldStore.saveNote('old-account', 'Never send A content to B'); await flush(); });
  assert.equal(savedB.length, 0, 'Old mounted reader saved through account B adapter');
  assert.equal(oldStore.storageError, true);
  await unmount();
  await act(async () => { renderer = create(React.createElement(ReaderStore)); await flush(); });
  assert.equal(oldStore.ledger[0].title, 'B only');
  assert(savedB.length > 0);
  assert(savedB.every(value => !value.library.notes['old-account']));
  await unmount();
  console.log('PASS mounted reader adapters stay account-bound; stale saves report an error without leaking to B');
} finally {
  if (renderer) await act(async () => renderer.unmount());
  Object.assign(globalThis, original);
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  rmSync(directory, { recursive: true, force: true });
}
