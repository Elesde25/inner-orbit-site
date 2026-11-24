import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, BookOpen, Search, Bookmark as BookmarkIcon, Sun, Moon, Sunrise,
  Type, Sparkles, ListOrdered, Maximize, Link2, PenLine, Lamp, VolumeX, Info,
} from 'lucide-react';
import { getBook, getRoom } from '../data/library';
import type { LibraryStore } from '../hooks/useLibraryStore';
import type { Chapter, PassageAnchor } from '../data/types';
import RotatableBook from './RotatableBook';
import PageCurl from './PageCurl';
import Starfield from './Starfield';
import { COLORS, uid } from '../data/persistence';
import { coverImage } from '../data/coverArt';
import { LivingPage } from './LivingPages';

/* ------------------------------- pagination ------------------------------ */
interface PageBlock { heading?: string; lines: {text:string; id:string; offset?:number}[]; }
interface TomePage { blocks: PageBlock[]; }

export function buildPages(ch: Chapter, fontSize: number): TomePage[] {
  const perPage = fontSize <= 17 ? 9 : fontSize <= 20 ? 7 : 5;
  const pages: TomePage[] = [];
  let cur: PageBlock[] = [];
  let count = 0;
  const push = () => { if (cur.length) { pages.push({ blocks: cur }); cur = []; count = 0; } };
  for (const v of ch.verses) {
    // heading starts fresh-ish
    if (v.heading && count > perPage - 2 && count > 0) push();
    let block: PageBlock = { heading: v.heading, lines: [] };
    for (const line of v.lines) {
      block.lines.push({text:line.text, id:line.id, offset:0});
      count++;
      if (count >= perPage) { cur.push(block); push(); block = { lines: [] }; }
    }
    if (block.lines.length || block.heading) {
      if (block.lines.length || cur.length === 0) cur.push(block);
      else if (cur.length) cur.push(block);
    }
  }
  push();
  return pages.length ? pages : [{ blocks: [] }];
}

/** Fit text to a physical leaf, splitting long paragraphs only at word boundaries. */
function fitPages(ch:Chapter, fontSize:number, lineSpacing:number, width:number, height:number, headerHeight:number, fontFamily:string):TomePage[] {
 const ctx=document.createElement('canvas').getContext('2d')!; ctx.font=`${fontSize}px ${fontFamily}`;
 const lineHeight=fontSize*lineSpacing, capacity=Math.max(lineHeight*3,height-185), pages:TomePage[]=[];
 let blocks:PageBlock[]=[], used=Math.min(headerHeight,Math.max(0,capacity-lineHeight*2));
 const push=()=>{pages.push({blocks});blocks=[];used=0};
 ch.verses.forEach((v)=>{
  let block:PageBlock={heading:v.heading,lines:[]};let headingCost=v.heading?fontSize*1.8+12:0;
  if(used+headingCost+lineHeight>capacity && (blocks.length || used>0)){push()}
  used+=headingCost;
  v.lines.forEach((passage)=>{
   const {text,id}=passage;let off=0;
   if(!text.length){block.lines.push({text,id,offset:0});used+=lineHeight;return}
   while(off<text.length){
    let available=Math.floor((capacity-used-fontSize*.35)/lineHeight);
    if(available<1){if(block.heading||block.lines.length)blocks.push(block);push();block={lines:[]};available=Math.max(1,Math.floor((capacity-fontSize*.35)/lineHeight));}
    let cursor=off,rows=1,line='';const words=text.slice(off).match(/\S+\s*|\s+/g)||[];
    for(const word of words){const candidate=line+word;if(line && ctx.measureText(candidate).width>width){if(rows>=available)break;rows++;line=word}else line=candidate;cursor+=word.length;}
    if(cursor===off){ // An unusually long unbroken word still gets a place on a page.
      cursor=Math.min(text.length,off+Math.max(1,Math.floor(width/fontSize)));rows=1;
    }
    block.lines.push({text:text.slice(off,cursor),id,offset:off});off=cursor;used+=rows*lineHeight+fontSize*.35;
    if(off<text.length){blocks.push(block);push();block={lines:[]}}
   }
  });
  if(block.heading||block.lines.length){blocks.push(block);used+=16}
 });
 if(blocks.length || !pages.length)pages.push({blocks});return pages;
}

interface Props {
  bookId: string;
  chapterId: string;
  initialPage?: number;
  initialAnchor?: PassageAnchor;
  skipCover?: boolean;
  store: LibraryStore;
  onClose: () => void;
  onNotes: () => void;
  onNavigate: (bookId: string, chapterId: string, page?: number) => void;
}

type EssenceTab = 'essence' | 'deeper' | 'views' | 'life' | 'reflect' | 'notes';

// Books already unveiled this session skip the cover ceremony on remount.
const OPENED = new Set<string>();

export default function LivingTome({ bookId, chapterId, initialPage, initialAnchor, store, onClose, onNavigate, onNotes, skipCover }: Props) {
  const book = getBook(bookId)!;
  const room = getRoom(book.roomId);
  const [journalStatus,setJournalStatus]=useState('');
  const { store: s, updateProgress, toggleBookmark, saveNote, pushRecent, setReaderPrefs } = store;
  const prefs = s.readerPrefs;
  const motionOff = prefs.motionSafe || s.atmosphere === 'minimal' || (typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  const chIndex = Math.max(0, book.chapters.findIndex((c) => c.id === chapterId));
  const chapter = book.chapters[chIndex];
  const saved = s.progress[book.id];
  const [page, setPage] = useState(() => {
    if (typeof initialPage === 'number') return initialPage;
    if (saved && saved.chapterId === chapter.id) return saved.page;
    return 0;
  });
  const [anchor,setAnchor] = useState<PassageAnchor|null>(() => initialAnchor ?? (initialPage===undefined && saved?.chapterId===chapter.id ? saved.anchor : undefined) ?? null);
  const [selectMode,setSelectMode]=useState(false);
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 700);
  const [stage, setStage] = useState<'cover' | 'opening' | 'reading'>(skipCover || OPENED.has(bookId) ? 'reading' : 'cover');
  const [panel, setPanel] = useState<null | EssenceTab>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [find, setFind] = useState('');
  const [livingOpen, setLivingOpen] = useState(false);
  const [, setIsFullscreen] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const flipFrontRef = useRef<HTMLDivElement>(null);
  const flipLock = useRef(false);
  const flipTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [pageFallback, setPageFallback] = useState(false);
  const onPageFailure = useCallback(() => setPageFallback(true), []);
  const [flip, setFlip] = useState<{direction:'next'|'prev'; node:HTMLElement; mode?:'drag'|'settle'; progress?:number}|null>(null);
  const dragRef = useRef<{direction:'next'|'prev'; startX:number; width:number; progress:number}|null>(null);
  const gesture = useRef<{x:number;y:number;pointer:number;at:number;selectable:boolean}|null>(null);
  const [fontRevision,setFontRevision]=useState(0);
  useEffect(()=>{const fonts=document.fonts;if(!fonts)return;let live=true;const update=()=>{if(live)setFontRevision(n=>n+1)};fonts.addEventListener('loadingdone',update);fonts.ready.then(update);return()=>{live=false;fonts.removeEventListener('loadingdone',update)}},[]);
  const [pageMetrics,setPageMetrics]=useState<{width:number;height:number;header:number;font:string}|null>(null);
  useLayoutEffect(() => { if (flip && flipFrontRef.current) flipFrontRef.current.replaceChildren(flip.node); }, [flip?.node,pageFallback]);
  useEffect(() => () => { flipTimers.current.forEach(clearTimeout); }, []);
  const turnTo = useCallback((direction:'next'|'prev', commit:()=>void, crossChapter=false) => {
    if (flipLock.current) return;
    if (motionOff) { commit(); return; }
    const nodes = bookRef.current?.querySelectorAll<HTMLElement>('.tome-page');
    const original = nodes && nodes.length ? nodes[direction==='next' ? nodes.length-1 : 0] : null;
    if (!original) { commit(); return; }
    const node = original.cloneNode(true) as HTMLElement;
    node.removeAttribute('id'); node.querySelectorAll('[data-passage]').forEach(el=>el.removeAttribute('data-passage'));
    flipLock.current = true; setFlip({direction,node});
    flipTimers.current.push(setTimeout(() => { if (!crossChapter) commit(); }, 950));
    flipTimers.current.push(setTimeout(() => { setFlip(null); flipLock.current=false; if (crossChapter) commit(); }, 1900));
  }, [motionOff]);
  const [selection, setSelection] = useState<{passage:string;start:number;end:number;quote:string}|null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<string|null>(null);
  const selectionTimer = useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  useEffect(() => {
    const capture = () => {
      clearTimeout(selectionTimer.current);
      selectionTimer.current = setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return;
        const range=sel.getRangeAt(0);
        const el=(range.startContainer.nodeType === 1 ? range.startContainer as Element : range.startContainer.parentElement)?.closest('[data-passage]') as HTMLElement|null;
        const endEl=(range.endContainer.nodeType === 1 ? range.endContainer as Element : range.endContainer.parentElement)?.closest('[data-passage]');
        if (!el || el !== endEl) return;
        const before=range.cloneRange(); before.selectNodeContents(el); before.setEnd(range.startContainer,range.startOffset);
        const start=before.toString().length+Number(el.dataset.offset || 0), quote=range.toString();
        if (quote.trim()) { setSelection({passage:el.dataset.passage!,start,end:start+quote.length,quote}); setSelectedHighlight(null); }
      }, 180);
    };
    document.addEventListener('selectionchange', capture);
    return () => { document.removeEventListener('selectionchange',capture); clearTimeout(selectionTimer.current); };
  }, [chapter.id]);
  const paintLine = (text:string, passage:string, offset=0) => {
    const fullText=chapter.verses.flatMap(v=>v.lines).find(l=>l.id===passage)?.text;
    const marks = store.highlights.filter(h => h.bookId===bookId && h.chapterId===chapterId && h.passage===passage && h.start<offset+text.length && h.end>offset && fullText?.slice(h.start,h.end)===h.quote);
    const boundaries = Array.from(new Set([0,text.length,...marks.flatMap(h=>[Math.max(0,h.start-offset),Math.min(text.length,h.end-offset)])])).sort((a,b)=>a-b);
    return boundaries.slice(0,-1).map((a,i) => { const z=boundaries[i+1], mark=marks.find(h=>h.start<=a+offset && h.end>=z+offset); return mark ? <mark key={a} onClick={() => {setSelection(null);setSelectedHighlight(mark.id)}} style={{background:COLORS[mark.color] || COLORS.Gold,color:'#231a19',borderRadius:3,cursor:'pointer'}}>{text.slice(a,z)}</mark> : text.slice(a,z); });
  };
  const applyColor = (color:string) => {
    if (selectedHighlight) store.setHighlights(hs=>hs.map(h=>h.id===selectedHighlight?{...h,color,updated:Date.now()}:h));
    else if(selection) { const h={...selection,id:uid(),bookId,chapterId,color,note:'',updated:Date.now()}; store.setHighlights(hs=>[...hs,h]); setSelectedHighlight(h.id); setSelection(null); window.getSelection()?.removeAllRanges(); }
  };
  const noteKey = `${book.id}:${chapter.id}`;
  const [noteDraft, setNoteDraft] = useState(s.notes[noteKey]?.text ?? '');

  const pages = useMemo(() => pageMetrics ? fitPages(chapter,prefs.fontSize,prefs.lineSpacing,pageMetrics.width,pageMetrics.height,pageMetrics.header,pageMetrics.font) : buildPages(chapter, prefs.fontSize), [chapter, prefs.fontSize,prefs.lineSpacing,pageMetrics,fontRevision]);
  useLayoutEffect(()=>{
    const el=bookRef.current;if(stage!=='reading'||!el)return;
    const measure=()=>{const leaf=el.querySelector<HTMLElement>('.tome-page');if(!leaf)return;const style=getComputedStyle(leaf),body=leaf.querySelector<HTMLElement>('.reader-body');const width=leaf.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);const height=leaf.clientHeight;const header=leaf.querySelector<HTMLElement>('header');const h=header?header.offsetHeight+20:190;const font=body?getComputedStyle(body).fontFamily:'Georgia';if(width>50&&height>100)setPageMetrics(prev=>prev&&Math.abs(prev.width-width)<2&&Math.abs(prev.height-height)<2&&Math.abs(prev.header-h)<2&&prev.font===font?prev:{width,height,header:h,font})};
    const ro=new ResizeObserver(measure);ro.observe(el);measure();return()=>ro.disconnect();
  },[stage,wide,prefs.fontSize,panel,chapter.id]);
  const step = wide ? 2 : 1;
  const maxStart = wide ? Math.max(0, (Math.ceil(pages.length / 2) - 1) * 2) : pages.length - 1;
  const anchorPage=anchor ? pages.findIndex(p=>p.blocks.some(b=>b.lines.some(l=>l.id===anchor.passageId && anchor.offset >= (l.offset||0) && anchor.offset < (l.offset||0)+Math.max(1,l.text.length)))) : -1;
  const currentPage=anchorPage>=0?anchorPage:page;
  const start = wide ? Math.floor(Math.min(currentPage,maxStart)/2)*2 : Math.min(currentPage, maxStart);
  const anchorAt=(index:number):PassageAnchor|null=>{const line=pages[index]?.blocks.flatMap(b=>b.lines)[0];return line?{passageId:line.id,offset:line.offset||0}:null};
  const changePage=(index:number)=>{const p=Math.max(0,Math.min(maxStart,index));setPage(p);setAnchor(anchorAt(p));};
  useEffect(()=>{if(stage==='reading'&&pageMetrics&&!anchor){const a=anchorAt(start);if(a)setAnchor(a)}},[stage,pageMetrics,anchor,start,pages]);
  const visible = wide ? [pages[start], pages[start + 1] || {blocks:[]}] : [pages[start]];

  useEffect(() => {
    const h = () => setWide(window.innerWidth >= 700);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  useEffect(() => { pushRecent(book.id, chapter.id); /* eslint-disable-next-line */ }, [chapter.id]);
  useEffect(() => {
    if (stage !== 'reading' || !pageMetrics || !anchor) return;
    const total = pages.length;
    updateProgress({ bookId: book.id, bookTitle: book.title, chapterId: chapter.id, chapterTitle: chapter.title, page: start, anchor, totalPages: total, percent: (start + step) / total > 1 ? 1 : (start + step) / total, updated: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, stage,anchor,pageMetrics]);

  const openBook = () => {
    OPENED.add(book.id);
    if (motionOff) { setStage('reading'); return; }
    setStage('opening');
    flipTimers.current.push(setTimeout(() => setStage('reading'), 2500));
  };

  const goPage = useCallback((p: number, d: 'next' | 'prev') => {
    turnTo(d, () => changePage(p));
  }, [maxStart, turnTo,pages]);

  const next = useCallback(() => {
    if (start + step <= maxStart) goPage(start + step, 'next');
    else if (chIndex < book.chapters.length - 1) turnTo('next', () => onNavigate(book.id, book.chapters[chIndex + 1].id), true);
  }, [start, step, maxStart, chIndex, book, onNavigate, goPage, turnTo]);

  const prev = useCallback(() => {
    if (start - step >= 0) goPage(start - step, 'prev');
    else if (chIndex > 0) turnTo('prev', () => onNavigate(book.id, book.chapters[chIndex - 1].id), true);
  }, [start, step, chIndex, book, onNavigate, goPage, turnTo]);

  const beginDrag = (direction:'next'|'prev', e:React.PointerEvent<HTMLDivElement>, startX=e.clientX) => {
    if (flipLock.current || (direction==='next' && start+step>maxStart && chIndex===book.chapters.length-1) || (direction==='prev' && start===0 && chIndex===0)) return;
    const nodes=bookRef.current?.querySelectorAll<HTMLElement>('.tome-page');
    const original=nodes?.[direction==='next' ? nodes.length-1 : 0];
    if (!original) return;
    e.currentTarget.setPointerCapture(e.pointerId); window.getSelection()?.removeAllRanges();
    const node=original.cloneNode(true) as HTMLElement;
    node.querySelectorAll('[data-passage]').forEach(el=>el.removeAttribute('data-passage'));
    flipLock.current=true; dragRef.current={direction,startX,width:Math.max(140,original.getBoundingClientRect().width),progress:0};
    setFlip({direction,node,mode:'drag',progress:0});
  };
  const moveDrag = (e:React.PointerEvent<HTMLDivElement>) => {
    const d=dragRef.current; if(!d)return;
    const travel=(e.clientX-d.startX)*(d.direction==='next'?-1:1);
    d.progress=Math.max(0,Math.min(1,travel/(d.width*.8)));
    setFlip(f=>f?{...f,progress:d.progress}:f);
  };
  const endDrag = (e:React.PointerEvent<HTMLDivElement>, cancelled=false) => {
    const d=dragRef.current; if(!d)return; dragRef.current=null;
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
    const complete=!cancelled && (d.progress>=.27 || Math.abs(e.clientX-d.startX)<6);
    const crossing=d.direction==='next' ? start+step>maxStart : start-step<0;
    const commit=()=>{
      if(d.direction==='next') { if(!crossing) changePage(start+step); else if(chIndex<book.chapters.length-1) onNavigate(book.id,book.chapters[chIndex+1].id); }
      else { if(!crossing) changePage(start-step); else if(chIndex>0) onNavigate(book.id,book.chapters[chIndex-1].id); }
    };
    if(motionOff) {setFlip(null);flipLock.current=false;if(complete)commit();return;}
    setFlip(f=>f?{...f,mode:'settle',progress:complete?1:0}:f);
    if(complete && !crossing)flipTimers.current.push(setTimeout(commit,550));
    flipTimers.current.push(setTimeout(()=>{setFlip(null);flipLock.current=false;if(complete && crossing)commit()},1150));
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (stage !== 'reading') { if(e.key === 'Escape') { OPENED.delete(bookId); onClose(); } return; }
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      if (e.key === 'Escape') { if (livingOpen) setLivingOpen(false); else if (panel) setPanel(null); else if (tocOpen) setTocOpen(false); else { OPENED.delete(bookId); onClose(); } }
      if (e.key === 'b') toggleBookmark({ bookId: book.id, chapterId: chapter.id, page: start, anchor:anchorAt(start) ?? undefined, label: `${book.title} — ${chapter.title} · p.${start + 1}` });
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [next, prev, livingOpen, panel, tocOpen, onClose, book, chapter, start, toggleBookmark, stage, bookId]);

  const isBookmarked = s.bookmarks.some((b) => b.bookId === book.id && b.chapterId === chapter.id && (b.anchor ? pages.slice(start,start+step).some(p=>p.blocks.some(block=>block.lines.some(l=>l.id===b.anchor?.passageId && b.anchor.offset >= (l.offset||0) && b.anchor.offset < (l.offset||0)+Math.max(1,l.text.length)))) : b.page === start));

  const findResults = useMemo(() => {
    const q = find.trim().toLowerCase();
    if (!q) return [];
    const out: { chId: string; chTitle: string; pageIdx: number; snippet: string }[] = [];
    for (const c of book.chapters) {
      const pg = pageMetrics ? fitPages(c,prefs.fontSize,prefs.lineSpacing,pageMetrics.width,pageMetrics.height,pageMetrics.header,pageMetrics.font) : buildPages(c, prefs.fontSize);
      pg.forEach((p, pi) => {
        const text = p.blocks.flatMap((b) => b.lines.map(l => l.text)).join(' ');
        const idx = text.toLowerCase().indexOf(q);
        if (idx >= 0) out.push({ chId: c.id, chTitle: c.title, pageIdx: pi, snippet: '…' + text.slice(Math.max(0, idx - 40), idx + 90) + '…' });
      });
    }
    return out.slice(0, 20);
  }, [find, book, prefs.fontSize,prefs.lineSpacing,pageMetrics,fontRevision]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    else document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
  };

  const themeCls = prefs.theme === 'night' ? 'page-paper-night' : prefs.theme === 'dawn' ? 'page-paper-dawn' : 'page-paper';
  const shadowL = prefs.theme === 'night' ? 'page-left-shadow-night' : 'page-left-shadow';
  const shadowR = prefs.theme === 'night' ? 'page-right-shadow-night' : 'page-right-shadow';
  const night = prefs.theme === 'night';


  /* ------------------------------ cover stage ----------------------------- */
  if (stage === 'cover' || stage === 'opening') {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#060312]">
        <img src={room.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060312]/60 to-[#060312]" />
        <Starfield atmosphere={motionOff ? "minimal" : s.atmosphere} />
        <button onClick={onNotes} className="absolute right-4 top-4 z-10 rounded-full border border-[#e8c476]/40 bg-black/60 px-4 py-2 text-sm text-[#f7dd9a]">▤ My Notes</button>
        <button onClick={() => {OPENED.delete(bookId); onClose();}} className="absolute left-4 top-4 z-10 rounded-full border border-[#e8c476]/40 bg-black/60 px-4 py-2 text-sm text-[#f7dd9a]">← Library</button>
        <div className="relative flex max-h-[90dvh] w-full flex-col items-center overflow-y-auto px-5 text-center">
          <div className="text-[10px] uppercase tracking-[.35em] text-[#e8c476]">The Living Tome</div>
          <h2 className="font-display mt-2 text-3xl font-semibold text-[#fdf6e3] sm:text-4xl">{book.title}</h2>
          <p className="mt-1 text-sm text-[#c9bda0]">{chapter.title}</p>
          <RotatableBook book={book} opening={stage==='opening'} motion={!motionOff && s.atmosphere==='full'} />
          {stage==='cover' && <button onClick={openBook} className="mt-3 rounded-full bg-gradient-to-r from-[#a57732] to-[#edce83] px-7 py-2.5 text-sm font-semibold text-[#1a1030] shadow-[0_0_24px_rgba(232,196,118,.3)]">Open the book</button>}
          {stage==='opening' && <p className="mt-3 text-sm text-[#e8c476]">Opening the tome…</p>}
        </div>
      </div>
    );
  }

  const TABS: { id: EssenceTab; label: string; icon: React.ReactNode }[] = [
    { id: 'essence', label: 'The Essence', icon: <Sparkles size={13} /> },
    { id: 'deeper', label: 'Deeper Meaning', icon: <BookOpen size={13} /> },
    { id: 'views', label: 'Perspectives', icon: <Info size={13} /> },
    { id: 'life', label: 'Into Life', icon: <Sun size={13} /> },
    { id: 'reflect', label: 'Reflection', icon: <PenLine size={13} /> },
    { id: 'notes', label: 'My Notes', icon: <BookmarkIcon size={13} /> },
  ];

  return (
    <div className="fixed inset-0 z-[55] flex flex-col overflow-hidden bg-[#060312]">
      {/* backdrop */}
      <div className="absolute inset-0">
        <img src={room.image} alt="" className="h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060312]/70 via-[#060312]/80 to-[#060312]" />
      </div>
      <Starfield atmosphere={!motionOff && s.atmosphere === 'full' ? 'subtle' : 'minimal'} density={0.6} />

      {/* top bar */}
      <div className="relative z-10 flex flex-wrap items-center gap-1.5 border-b border-[#e8c476]/20 bg-[#060312]/80 px-2 py-2 backdrop-blur-md sm:gap-2 sm:px-4">
        <button onClick={() => {OPENED.delete(bookId); onClose();}} className="flex items-center gap-1.5 rounded-full border border-[#e8c476]/30 px-3 py-1.5 text-xs text-[#e8c476] transition hover:bg-[#e8c476]/10" aria-label="Return to library">
          <X size={14} /> <span className="hidden sm:inline">Library</span>
        </button>
        <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
          <span className="truncate font-display text-[17px] font-semibold text-[#fdf6e3]">{book.title}</span>
          <span className="shrink-0 text-[#8a7c5c]">·</span>
          <button onClick={() => setTocOpen(!tocOpen)} className="flex min-w-0 items-center gap-1.5 truncate rounded-full border border-white/10 px-3 py-1 text-xs text-[#c9bda0] transition hover:border-[#e8c476]/40">
            <ListOrdered size={13} /> <span className="truncate">{chapter.title}</span>
          </button>
        </div>
        <div className="reader-tools ml-auto flex items-center gap-1 sm:gap-1.5">
          <button onClick={onNotes} className="rounded-full border border-[#e8c476]/40 px-3 py-2 text-xs text-[#f7dd9a]" aria-label="My Notes">▤ My Notes</button>
          <button onClick={() => setFindOpen(!findOpen)} className="rounded-full border border-white/10 p-2 text-[#c9bda0] transition hover:border-[#e8c476]/40 hover:text-[#f7dd9a]" title="Search within this book" aria-label="Search within this book"><Search size={15} /></button>
          <button onClick={() => setReaderPrefs({ fontSize: Math.max(15, prefs.fontSize - 1) })} className="rounded-full border border-white/10 p-2 text-[#c9bda0]" title="Smaller text" aria-label="Smaller text"><Type size={13} /></button>
          <span className="hidden text-[11px] tabular-nums text-[#8a7c5c] sm:inline">{prefs.fontSize}</span>
          <button onClick={() => setReaderPrefs({ fontSize: Math.min(26, prefs.fontSize + 1) })} className="rounded-full border border-white/10 p-2 text-[#c9bda0]" title="Larger text" aria-label="Larger text"><Type size={17} /></button>
          <button onClick={() => setReaderPrefs({ theme: prefs.theme === 'parchment' ? 'night' : prefs.theme === 'night' ? 'dawn' : 'parchment' })} className="rounded-full border border-white/10 p-2 text-[#c9bda0]" title={`Theme: ${prefs.theme}`} aria-label="Change reading theme">
            {prefs.theme === 'parchment' ? <Sun size={15} /> : prefs.theme === 'night' ? <Moon size={15} /> : <Sunrise size={15} />}
          </button>
          <button onClick={() => setReaderPrefs({ motionSafe: !prefs.motionSafe })} className={`flex items-center gap-1 rounded-full border p-2 ${prefs.motionSafe ? 'border-[#8fd6a0]/60 text-[#8fd6a0]' : 'border-white/10 text-[#c9bda0]'}`} title="Animation-free reading mode" aria-label="Toggle animation-free mode"><VolumeX size={15} /></button>
          <button onClick={toggleFullscreen} className="hidden rounded-full border border-white/10 p-2 text-[#c9bda0] sm:block" title="Full-screen reading" aria-label="Toggle fullscreen"><Maximize size={15} /></button>
          <button onClick={() => toggleBookmark({ bookId: book.id, chapterId: chapter.id, page: start, anchor:anchorAt(start) ?? undefined, label: `${book.title} — ${chapter.title} · p.${start + 1}` })} className={`rounded-full border p-2 ${isBookmarked ? 'border-[#e8c476] bg-[#e8c476]/20 text-[#f7dd9a]' : 'border-white/10 text-[#c9bda0]'}`} title="Bookmark this page (B)" aria-label="Bookmark this page"><BookmarkIcon size={15} fill={isBookmarked ? 'currentColor' : 'none'} /></button>
          <button onClick={() => {setSelectMode(v=>!v);window.getSelection()?.removeAllRanges();}} aria-pressed={selectMode} aria-label="Text selection mode" title="Toggle text selection mode" className={`rounded-full border px-3 py-2 text-xs ${selectMode?'border-[#e8c476] bg-[#e8c476]/20 text-[#f7dd9a]':'border-white/10 text-[#c9bda0]'}`}>✎ <span className="hidden sm:inline">{selectMode?'Selecting':'Select text'}</span></button>
          <button onClick={() => setPanel(panel ? null : 'essence')} className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${panel ? 'bg-[#e8c476] text-[#1a1030]' : 'bg-gradient-to-r from-[#8a5a1c] to-[#c99a3f] text-[#120b2e]'}`} aria-expanded={!!panel}>
            <Lamp size={14} /> Illuminate
          </button>
        </div>
        {/* mobile title */}
        <div className="flex w-full items-center gap-2 px-2 pb-1 md:hidden">
          <button onClick={() => setTocOpen(!tocOpen)} className="flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-lg border border-white/10 px-2.5 py-1.5 text-left text-xs text-[#c9bda0]">
            <ListOrdered size={13} className="shrink-0" /> <span className="truncate">{chapter.title}</span>
          </button>
        </div>
      </div>

      {/* TOC drawer */}
      {tocOpen && (
        <div className="nebula-panel relative z-20 max-h-[45vh] overflow-y-auto border-b border-[#e8c476]/20 p-3 backdrop-blur">
          <div className="mx-auto grid max-w-4xl gap-1.5 sm:grid-cols-2">
            {book.chapters.map((c, i) => (
              <button key={c.id} onClick={() => { onNavigate(book.id, c.id); setTocOpen(false); }} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${c.id === chapter.id ? 'bg-[#e8c476]/20 text-[#f7dd9a]' : 'text-[#c9bda0] hover:bg-white/5'}`}>
                <span className="font-display text-[#8a7c5c]">{i + 1}.</span>
                <span className="min-w-0 flex-1 truncate">{c.title}{c.livingPage ? ' ✦' : ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* find drawer */}
      {findOpen && (
        <div className="nebula-panel relative z-20 max-h-[45vh] overflow-y-auto border-b border-[#e8c476]/20 p-3 backdrop-blur">
          <div className="mx-auto max-w-2xl">
            <input value={find} onChange={(e) => setFind(e.target.value)} placeholder={`Search within ${book.title}…`} className="w-full rounded-lg border border-[#e8c476]/30 bg-black/40 px-3.5 py-2 text-sm text-[#fdf6e3] outline-none" aria-label="Search within this book" autoFocus />
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {findResults.map((r, i) => (
                <button key={i} onClick={() => { setFindOpen(false); onNavigate(book.id, r.chId, r.pageIdx); }} className="w-full rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-left text-xs transition hover:border-[#e8c476]/40">
                  <span className="font-medium text-[#f7dd9a]">{r.chTitle} · p.{r.pageIdx + 1}</span>
                  <span className="block truncate text-[#a89a7c]">{r.snippet}</span>
                </button>
              ))}
              {find.trim() && findResults.length === 0 && <p className="py-2 text-center text-xs text-[#8a7c5c]">No matches in this volume.</p>}
            </div>
          </div>
        </div>
      )}

      {/* stage */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
        <div
          className={`tome-stage flex min-h-0 flex-1 items-stretch justify-center gap-0 overflow-y-auto p-3 transition-all sm:items-center sm:p-6 ${panel ? 'lg:mr-[400px]' : ''}`}

        >
          {/* prev */}
          <button onClick={prev} disabled={start === 0 && chIndex === 0} className="z-10 mr-1 hidden h-12 w-12 shrink-0 items-center justify-center self-center rounded-full border border-[#e8c476]/40 bg-black/50 text-[#e8c476] backdrop-blur transition hover:bg-[#e8c476]/20 disabled:opacity-25 lg:flex" aria-label="Previous page"><ChevronLeft size={20} /></button>

          <div className={`tome-shell ${wide ? 'spread' : 'single'}`} style={{'--binding-accent':book.cover.accent, '--binding-base':book.cover.base.split(',')[0], backgroundImage:`linear-gradient(0deg,rgba(12,7,8,.42),rgba(12,7,8,.42)),url("${coverImage(book.title)}")`} as React.CSSProperties}>
          <div ref={bookRef} className={`tome-book flex w-full rounded-sm ${selectMode?'select-mode':''}`} aria-busy={!!flip}
            onPointerDown={e=>{if(e.button!==0||flipLock.current||selectMode||e.altKey||(e.target as HTMLElement).closest('button,mark,a'))return;gesture.current={x:e.clientX,y:e.clientY,pointer:e.pointerId,at:Date.now(),selectable:!!(e.target as HTMLElement).closest('[data-passage]')};}}
            onPointerMove={e=>{if(dragRef.current){moveDrag(e);return}const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dy)>Math.abs(dx)*1.2 && Math.abs(dy)>14){gesture.current=null;return}if(Math.abs(dx)>24 && Math.abs(dx)>Math.abs(dy)*1.2){if(g.selectable && e.pointerType!=='mouse' && Date.now()-g.at>400){gesture.current=null;return}const direction=dx<0?'next':'prev';beginDrag(direction,e,g.x);gesture.current=null;moveDrag(e)}}}
            onPointerUp={e=>{gesture.current=null;endDrag(e)}} onPointerCancel={e=>{gesture.current=null;endDrag(e,true)}}>
            {visible.map((pg, vi) => {
              const pageNo = start + vi;
              const isLeft = wide ? vi === 0 : false;
              return (
                <div key={vi} className={`tome-page relative flex-1 ${themeCls} ${wide ? (isLeft ? shadowL : shadowR) : ''} px-6 py-7 sm:px-10 sm:py-9 ${wide && vi === 0 ? 'border-r border-[#8a5a1c]/30' : ''}`}>
                  <div className={`page-curl ${wide ? (isLeft ? 'curl-left' : 'curl-right') : 'hidden'}`} />
                  {pageNo === 0 && (
                    <header className="mb-5 text-center">
                      <div className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${night ? 'text-[#e8c476]' : 'text-[#8a5a1c]'}`}>{book.title}</div>
                      <h2 className={`font-display mt-1.5 text-2xl font-semibold leading-tight sm:text-[28px] ${night ? 'text-[#fdf6e3]' : 'text-[#2b1d0e]'}`}>{chapter.title}</h2>
                      {chapter.subtitle && <p className={`font-display mt-1 text-[16px] italic ${night ? 'text-[#c9bda0]' : 'text-[#6b5322]'}`}>{chapter.subtitle}</p>}
                      <div className={`mx-auto mt-3 h-px w-32 ${night ? 'bg-[#e8c476]/40' : 'bg-[#8a5a1c]/40'}`} />
                      <p className={`mt-2 text-[11px] italic ${night ? 'text-[#8a7c5c]' : 'text-[#8a6f3e]'}`}>{chapter.sourceLabel}</p>
                    </header>
                  )}
                  <div className="reader-body font-reading" style={{ fontSize: prefs.fontSize, lineHeight: prefs.lineSpacing }}>
                    {pg.blocks.map((b, bi) => (
                      <div key={bi} className="mb-4">
                        {b.heading && <h3 className={`font-display mb-2 text-[1.15em] font-semibold ${night ? 'text-[#f7dd9a]' : 'text-[#5c3d12]'}`}>{b.heading}</h3>}
                        {b.lines.map((ln, li) => (
                          <p key={li} data-passage={ln.id} data-offset={ln.offset || 0} className="verse-line">{paintLine(ln.text,ln.id,ln.offset || 0)}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                  <footer className={`mt-auto flex items-center justify-between pt-5 text-[11px] ${night ? 'text-[#8a7c5c]' : 'text-[#8a6f3e]'}`}>
                    <span>{pageNo < pages.length ? chapter.attribution : ''}</span>
                    <span className="tabular-nums">{pageNo < pages.length ? pageNo + 1 : ''}</span>
                  </footer>
                </div>
              );
            })}
          </div>

          {flip && !pageFallback && <PageCurl flip={flip} wide={wide} night={night} onFailure={onPageFailure} />}
          {flip && pageFallback && <div aria-hidden="true" className={`turn-layer ${flip.direction} ${wide ? 'spread' : 'single'} ${night ? 'turn-night' : ''} ${flip.mode || ''}`}>
            <div className="turn-leaf" style={flip.mode ? {animation:'none', transform:`rotateY(${(flip.direction==='next'?-1:1)*180*(flip.progress||0)}deg)`, transition:flip.mode==='settle'?'transform 1.1s ease-in-out':'none'} : undefined}><div ref={flipFrontRef} className="turn-face turn-front"/><div className="turn-face turn-back"><div className="turn-back-ornament">❧</div></div></div>
          </div>}

          </div>

          {/* next */}
          <button onClick={next} disabled={start + step > maxStart && chIndex === book.chapters.length - 1} className="z-10 ml-1 hidden h-12 w-12 shrink-0 items-center justify-center self-center rounded-full border border-[#e8c476]/40 bg-black/50 text-[#e8c476] backdrop-blur transition hover:bg-[#e8c476]/20 disabled:opacity-25 lg:flex" aria-label="Next page"><ChevronRight size={20} /></button>
        </div>

        {/* essence panel */}
        {panel && (
          <aside className="nebula-panel relative z-20 flex max-h-[46vh] w-full shrink-0 flex-col border-t border-[#e8c476]/25 backdrop-blur-xl lg:absolute lg:inset-y-0 lg:right-0 lg:max-h-none lg:w-[400px] lg:border-l lg:border-t-0" role="complementary" aria-label="Inner Orbit interpretation layers">
            <div className="flex items-center justify-between border-b border-[#e8c476]/20 px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8c476]"><Lamp size={13} /> Illuminations · {chapter.title}</span>
              <button onClick={() => setPanel(null)} className="rounded-full border border-white/15 p-1.5 text-[#a89a7c]" aria-label="Close illuminations"><X size={14} /></button>
            </div>
            <div className="flex gap-1 overflow-x-auto border-b border-[#e8c476]/15 p-2 no-scrollbar" role="tablist">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={panel === t.id} onClick={() => setPanel(t.id)} className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${panel === t.id ? 'bg-[#e8c476] text-[#1a1030]' : 'border border-white/10 text-[#c9bda0] hover:border-[#e8c476]/40'}`}>{t.icon} {t.label}</button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-[13.5px] leading-relaxed">
              {panel === 'essence' && (
                <div>
                  <Badge>Inner Orbit commentary — not the author’s text</Badge>
                  <h4 className="font-display mt-2 text-xl font-semibold text-[#f7dd9a]">The Essence</h4>
                  <p className="mt-2 text-[#e8dcc0]">{chapter.essence}</p>
                  <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-[#a89a7c]">Source: <span className="italic">{chapter.sourceLabel}</span>. The passage on the page is the source (or identified translation); everything in this panel is Inner Orbit’s modern illumination.</div>
                </div>
              )}
              {panel === 'deeper' && (
                <div>
                  <Badge>Inner Orbit commentary</Badge>
                  <h4 className="font-display mt-2 text-xl font-semibold text-[#f7dd9a]">Deeper Meaning</h4>
                  <ul className="mt-2 space-y-2.5">{chapter.deeper.map((d, i) => (<li key={i} className="border-l-2 border-[#e8c476]/40 pl-3 text-[#d8cdb4]">{d}</li>))}</ul>
                </div>
              )}
              {panel === 'views' && (
                <div>
                  <Badge>Multiple legitimate readings — no single orthodoxy imposed</Badge>
                  <h4 className="font-display mt-2 text-xl font-semibold text-[#f7dd9a]">Different Perspectives</h4>
                  <div className="mt-2 space-y-2.5">{chapter.perspectives.map((p, i) => (<div key={i} className="rounded-lg border border-white/10 bg-black/25 p-3"><div className="text-xs font-semibold uppercase tracking-widest text-[#e8c476]">{p.label}</div><div className="mt-1 text-[#d8cdb4]">{p.text}</div></div>))}</div>
                </div>
              )}
              {panel === 'life' && (
                <div>
                  <Badge>Inner Orbit commentary</Badge>
                  <h4 className="font-display mt-2 text-xl font-semibold text-[#f7dd9a]">Bring It Into Your Life</h4>
                  <div className="mt-2 space-y-2.5">{chapter.bringToLife.map((e, i) => (<div key={i} className="rounded-lg border border-white/10 bg-black/25 p-3"><div className="font-display text-[16px] font-semibold text-[#fdf6e3]">{e.title}</div><div className="mt-1 text-[#d8cdb4]">{e.text}</div></div>))}</div>
                </div>
              )}
              {panel === 'reflect' && (
                <div>
                  <Badge>Optional · private · never shared</Badge>
                  <h4 className="font-display mt-2 text-xl font-semibold text-[#f7dd9a]">A Moment of Reflection</h4>
                  <ol className="mt-2 list-decimal space-y-2 pl-5 text-[#d8cdb4]">{chapter.reflection.questions.map((q, i) => (<li key={i}>{q}</li>))}</ol>
                  {chapter.reflection.exercise && <div className="mt-3 rounded-lg border border-[#8fd6a0]/30 bg-[#8fd6a0]/5 p-3"><div className="text-xs font-semibold uppercase tracking-widest text-[#8fd6a0]">Practice</div><div className="mt-1 text-[#d8cdb4]">{chapter.reflection.exercise}</div></div>}
                  {chapter.reflection.journeyHook && <div className="mt-2 text-xs italic text-[#8a7c5c]">Future Your Journey hook: {chapter.reflection.journeyHook}</div>}
                  {chapter.connections.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#7fb8ff]"><Link2 size={12} /> Follow the thread</div>
                      <div className="mt-2 space-y-1.5">{chapter.connections.filter(c => getBook(c.bookId)?.chapters.length).map((c, i) => (
                        <button key={i} onClick={() => { const b = getBook(c.bookId); if (b) onNavigate(c.bookId, c.chapterId ?? b.chapters[0]?.id ?? ''); }} className="w-full rounded-lg border border-[#7fb8ff]/25 bg-black/25 p-2.5 text-left transition hover:bg-[#7fb8ff]/10">
                          <span className="text-[13px] font-medium text-[#d6e6ff]">{getBook(c.bookId)?.title}</span>
                          <span className="block text-xs italic text-[#8a7c5c]">Why: {c.reason}</span>
                        </button>
                      ))}</div>
                    </div>
                  )}
                </div>
              )}
              {panel === 'notes' && (
                <div>
                  <Badge>Private reading reflections · account sync when signed in</Badge>
                  <h4 className="font-display mt-2 text-xl font-semibold text-[#f7dd9a]">My Notes</h4>
                  <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} rows={8} placeholder="What stirs in you as you read? Questions, resolutions, lines to remember…" className="mt-2 w-full rounded-lg border border-[#e8c476]/30 bg-black/40 p-3 text-sm text-[#fdf6e3] outline-none placeholder:text-[#8a7c5c] focus:border-[#e8c476]" aria-label="Private reflection notes" />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button onClick={() => saveNote(noteKey, noteDraft)} className="rounded-full bg-[#e8c476] px-4 py-1.5 text-xs font-semibold text-[#1a1030]">Save privately</button><button disabled={!noteDraft.trim()} onClick={async()=>{try{const context='/library?'+new URLSearchParams({book:book.id,chapter:chapter.id}).toString();const r=await fetch('/api/orbit/journal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:chapter.reflection||('Reflection on '+chapter.title),answer:noteDraft,context})});const data:any=await r.json();if(!r.ok)throw Error(data.error);saveNote(noteKey,noteDraft);setJournalStatus('Saved a separate reflection to your Soul Journal.')}catch(e){setJournalStatus((e as Error).message)}}} className="mt-2 rounded-full border border-[#e8c476]/40 px-4 py-2 text-xs">Save a copy to Soul Journal</button><p role="status" className="text-sm">{journalStatus}</p>
                    {s.notes[noteKey] && <span className="text-[11px] text-[#8a7c5c]">Saved privately · {new Date(s.notes[noteKey].updated).toLocaleDateString()}</span>}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {(selection || selectedHighlight) && <div className="relative z-30 flex flex-wrap items-center justify-center gap-2 border-t border-[#e8c476]/30 bg-[#130e25] p-2 text-xs text-[#fdf6e3]" role="toolbar" aria-label="Highlight selection">
        <span>{selectedHighlight ? 'Edit highlight' : 'Highlight selected passage'}</span>
        {Object.entries(COLORS).map(([name,color])=><button key={name} aria-label={name} title={name} onMouseDown={e=>e.preventDefault()} onClick={()=>applyColor(name)} style={{background:color}} className="h-7 w-7 rounded-full border-2 border-white/60" />)}
        {selectedHighlight && <><button onClick={()=>{const h=store.highlights.find(x=>x.id===selectedHighlight); if(!h)return; const text=prompt('Note for this highlight',h.note); if(text!==null) store.setHighlights(hs=>hs.map(x=>x.id===h.id?{...x,note:text,updated:Date.now()}:x));}} className="rounded border border-white/30 px-2 py-1">Add note</button><button onClick={()=>{store.setHighlights(hs=>hs.filter(h=>h.id!==selectedHighlight));setSelectedHighlight(null)}} className="rounded border border-white/30 px-2 py-1">Remove</button></>}
        <button onClick={()=>{setSelection(null);setSelectedHighlight(null);window.getSelection()?.removeAllRanges()}} className="px-2 py-1">Close</button>
      </div>}
      {/* bottom bar */}
      <div className="relative z-10 flex items-center gap-2 border-t border-[#e8c476]/20 bg-[#060312]/85 px-3 py-2.5 backdrop-blur-md sm:px-5">
        <button onClick={prev} disabled={start === 0 && chIndex === 0} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8c476]/40 text-[#e8c476] transition hover:bg-[#e8c476]/15 disabled:opacity-25 lg:hidden" aria-label="Previous page"><ChevronLeft size={18} /></button>
        <button onClick={() => chIndex > 0 && turnTo('prev', () => onNavigate(book.id, book.chapters[chIndex - 1].id), true)} disabled={chIndex === 0} className="hidden max-w-[180px] truncate rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#a89a7c] transition hover:border-[#e8c476]/40 disabled:opacity-30 sm:block">
          ← {chIndex > 0 ? book.chapters[chIndex - 1].title : 'First reading'}
        </button>
        <div className="flex flex-1 flex-col items-center gap-1 px-1">
          <div className="text-[11px] tabular-nums text-[#a89a7c]">{wide ? `Pages ${start + 1}${pages[start + 1] ? `–${start + 2}` : ''} of ${pages.length}` : `Page ${start + 1} of ${pages.length}`} · Reading {chIndex + 1} of {book.chapters.length} <span className="hidden sm:inline">· {selectMode ? 'Selection mode: select text to highlight · page buttons still work' : 'Drag to turn · choose Select text to highlight'}</span></div>
          <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={Math.round(((start + step) / pages.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
            <div className="h-full rounded-full bg-gradient-to-r from-[#8a5a1c] via-[#e8c476] to-[#f7dd9a]" style={{ width: `${Math.min(100, ((start + step) / pages.length) * 100)}%` }} />
          </div>
        </div>
        <button onClick={() => chIndex < book.chapters.length - 1 && turnTo('next', () => onNavigate(book.id, book.chapters[chIndex + 1].id), true)} disabled={chIndex === book.chapters.length - 1} className="hidden max-w-[180px] truncate rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#a89a7c] transition hover:border-[#e8c476]/40 disabled:opacity-30 sm:block">
          {chIndex < book.chapters.length - 1 ? book.chapters[chIndex + 1].title : 'Last reading'} →
        </button>
        {chapter.livingPage && (
          <button onClick={() => setLivingOpen(true)} className="flex items-center gap-1.5 rounded-full border border-[#c9a8ff]/50 bg-[#c9a8ff]/10 px-3.5 py-1.5 text-xs text-[#c9a8ff] transition hover:bg-[#c9a8ff]/25 sm:flex" title="Open Living Page">
            <Sparkles size={13} /> Living Page
          </button>
        )}
        <button onClick={next} disabled={start + step > maxStart && chIndex === book.chapters.length - 1} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#8a5a1c] to-[#c99a3f] text-[#120b2e] transition hover:brightness-110 disabled:opacity-30 lg:hidden" aria-label="Next page"><ChevronRight size={18} /></button>
      </div>

      {/* living page overlay */}
      {livingOpen && chapter.livingPage && (
        <div className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6" onClick={() => setLivingOpen(false)}>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex justify-end">
              <button onClick={() => setLivingOpen(false)} className="flex items-center gap-1.5 rounded-full border border-[#e8c476]/40 bg-black/60 px-4 py-1.5 text-xs text-[#e8c476]"><X size={13} /> Return to the page</button>
            </div>
            <LivingPage id={chapter.livingPage} motionSafe={motionOff} />
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full border border-[#c9a8ff]/40 bg-[#c9a8ff]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9a8ff]">{children}</span>;
}
