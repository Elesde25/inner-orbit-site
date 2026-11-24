import { useState } from 'react';
import { Search, Sparkles, ChevronDown, Home, BookOpen, Leaf, Eye, Shapes, ArrowLeft, Settings2, X } from 'lucide-react';
import { rooms } from '../data/library';
import type { Atmosphere, RoomId } from '../data/types';

const ROOM_ICONS: Record<RoomId, React.ReactNode> = {
  wisdom: <BookOpen size={14} />,
  becoming: <Leaf size={14} />,
  visionary: <Eye size={14} />,
  patterns: <Shapes size={14} />,
};

interface Props {
  view: string;
  roomId: RoomId | null;
  atmosphere: Atmosphere;
  setAtmosphere: (a: Atmosphere) => void;
  onHome: () => void;
  onRoom: (r: RoomId) => void;
  onSearch: () => void;
  onSoulHub: () => void;
  onCodex: () => void;
  onNotes: () => void;
}

export default function Chrome({ view, roomId, atmosphere, setAtmosphere, onHome, onRoom, onSearch, onSoulHub, onCodex, onNotes }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [atmOpen, setAtmOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#e8c476]/20 bg-[#060312]/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-5">
        {view !== 'atrium' ? (
          <button onClick={onHome} className="flex items-center gap-1.5 rounded-full border border-[#e8c476]/30 px-3 py-1.5 text-xs text-[#e8c476] transition hover:bg-[#e8c476]/10" aria-label="Return to Grand Atrium">
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Atrium</span>
          </button>
        ) : (
          <button onClick={onHome} className="flex items-center gap-2" aria-label="Inner Orbit home">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8c476]/60 bg-gradient-to-br from-[#3b2566] to-[#120b2e] text-[#f7dd9a]">
              <Sparkles size={16} />
            </span>
            <span className="hidden text-left leading-none md:block">
              <span className="font-display block text-[17px] font-semibold tracking-wide text-[#fdf6e3]">INNER ORBIT</span>
              <span className="block text-[9px] uppercase tracking-[0.28em] text-[#a89a7c]">Celestial Library</span>
            </span>
          </button>
        )}

        {/* fast nav */}
        <nav className="ml-1 flex items-center gap-1" aria-label="Fast navigation">
          <button onClick={onHome} className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition sm:flex ${view === 'atrium' ? 'bg-[#e8c476]/20 text-[#f7dd9a]' : 'text-[#c9bda0] hover:bg-white/5'}`}>
            <Home size={13} /> Atrium
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${view === 'room' || view === 'reader' ? 'bg-[#e8c476]/20 text-[#f7dd9a]' : 'text-[#c9bda0] hover:bg-white/5'}`} aria-expanded={menuOpen}>
              {roomId ? ROOM_ICONS[roomId] : <BookOpen size={13} />}
              <span className="max-w-[110px] truncate sm:max-w-none">{roomId ? rooms.find((r) => r.id === roomId)?.name : 'Rooms'}</span>
              <ChevronDown size={12} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="glass absolute left-0 z-20 mt-2 w-72 overflow-hidden rounded-xl p-1.5 shadow-2xl">
                  {rooms.map((r) => (
                    <button key={r.id} onClick={() => { onRoom(r.id); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[#e8c476]/10">
                      <span style={{ color: r.accent }}>{ROOM_ICONS[r.id]}</span>
                      <span>
                        <span className="font-display block text-[15px] font-semibold text-[#fdf6e3]">{r.name}</span>
                        <span className="block text-[11px] text-[#a89a7c]">{r.subtitle}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button onClick={onNotes} className="rounded-full border border-[#e8c476]/40 px-3 py-1.5 text-xs text-[#f7dd9a]" aria-label="My Notes">▤ <span className="hidden sm:inline">My Notes</span></button>
          <button onClick={onSearch} className="flex items-center gap-1.5 rounded-full border border-[#e8c476]/30 bg-[#e8c476]/5 px-3 py-1.5 text-xs text-[#e8c476] transition hover:bg-[#e8c476]/15" aria-label="Search the entire library">
            <Search size={14} /> <span className="hidden md:inline">Search all</span>
            <kbd className="hidden rounded border border-[#e8c476]/30 px-1 text-[10px] opacity-70 lg:inline">/</kbd>
          </button>
          <div className="relative">
            <button onClick={() => setAtmOpen(!atmOpen)} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#c9bda0] transition hover:bg-white/5" aria-label="Atmosphere settings" aria-expanded={atmOpen}>
              <Settings2 size={14} /> <span className="hidden capitalize sm:inline">{atmosphere}</span>
            </button>
            {atmOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAtmOpen(false)} />
                <div className="glass absolute right-0 z-20 mt-2 w-60 rounded-xl p-2 shadow-2xl">
                  <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a89a7c]">Atmosphere</div>
                  {(['full', 'subtle', 'minimal'] as Atmosphere[]).map((a) => (
                    <button key={a} onClick={() => { setAtmosphere(a); setAtmOpen(false); }} className={`flex w-full flex-col rounded-lg px-3 py-2 text-left transition hover:bg-[#e8c476]/10 ${atmosphere === a ? 'bg-[#e8c476]/15' : ''}`}>
                      <span className="text-sm capitalize text-[#fdf6e3]">{a} {atmosphere === a && '✓'}</span>
                      <span className="text-[11px] text-[#a89a7c]">{a === 'full' ? 'Rich particles, drift & cinematic motion' : a === 'subtle' ? 'Beauty kept, motion softened' : 'Still, lightweight, calm'}</span>
                    </button>
                  ))}
                  <button onClick={() => { onCodex(); setAtmOpen(false); }} className="mt-1 flex w-full items-center justify-between rounded-lg border-t border-[#e8c476]/20 px-3 py-2 text-left text-xs text-[#a89a7c] transition hover:bg-white/5">
                    Integration guide & changelog <span>→</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <button onClick={onSoulHub} className="rounded-full bg-gradient-to-r from-[#8a5a1c] to-[#c99a3f] px-3 py-1.5 text-xs font-semibold text-[#120b2e] shadow-[0_0_18px_rgba(232,196,118,.4)] transition hover:brightness-110" title="Return to Soul Hub">
            ✦ Soul Hub
          </button>
        </div>
      </div>
    </header>
  );
}

export function SoulHubNotice({ route, onClose, onEdit }: { route: string; onClose: () => void; onEdit: (r: string) => void }) {
  const [val, setVal] = useState(route);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass ornate-frame ornate-corner w-full max-w-md rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="font-display text-2xl font-semibold text-[#fdf6e3]">Return to Soul Hub</h3>
          <button onClick={onClose} className="rounded-full border border-white/15 p-1.5 text-[#a89a7c]" aria-label="Close"><X size={15} /></button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#c9bda0]">
          In the full Inner Orbit universe this control returns you to the <em>Soul Hub</em>. This prototype is standalone, so the route below is configurable — set it to your Soul Hub path now, and the button will navigate there when integrated.
        </p>
        <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a89a7c]">Integration route</label>
        <div className="mt-1.5 flex gap-2">
          <input value={val} onChange={(e) => setVal(e.target.value)} className="flex-1 rounded-lg border border-[#e8c476]/30 bg-black/40 px-3 py-2 font-mono text-sm text-[#f7dd9a] outline-none focus:border-[#e8c476]" aria-label="Soul Hub route" />
          <button onClick={() => { onEdit(val); onClose(); }} className="rounded-lg bg-[#e8c476] px-4 py-2 text-sm font-semibold text-[#1a1030]">Save</button>
        </div>
        <a href={val} onClick={(e) => e.stopPropagation()} className="mt-3 inline-block text-xs text-[#7fb8ff] underline">Try navigating to {val} →</a>
        <p className="mt-3 border-t border-[#e8c476]/20 pt-3 text-[11px] text-[#8a7c5c]">Prototype data (progress, bookmarks, notes) lives only in this browser — nothing here implies a server account.</p>
      </div>
    </div>
  );
}
