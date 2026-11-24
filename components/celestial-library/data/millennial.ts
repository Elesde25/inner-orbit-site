import type { Book } from './types';

export const millennialTao: Book = {
  id: 'millennial-tao',
  title: 'The Millennial Tao',
  author: 'Inner Orbit · Original Companion',
  roomId: 'becoming',
  tradition: 'Inner Orbit Original · Companion to the Tao Te Ching',
  subjects: ['Daoism', 'Modern Life', 'Practice'],
  themes: ['wu-wei', 'simplicity', 'language', 'adaptability', 'humility'],
  status: 'complete',
  featured: true,
  pagesEstimate: 'Introductory edition · 3 chapters',
  cover: { material: 'silk', base: '#0b1e3a,#274a7a', accent: '#ffe9a8', motif: 'millennial', gem: '#7fe0ff' },
  description:
    'An original Inner Orbit companion that translates the Tao Te Ching’s ancient current into contemporary language — notifications, deadlines, group chats, and all. This is not a translation and never pretends to be: it is a friendly bridge to the original, grounded chapter by chapter in real Daoist concepts, with practices for ordinary days. Introductory edition: three substantive chapters.',
  edition: {
    edition: 'Inner Orbit Introductory Edition v0.1 — three chapters',
    source: 'Written originally for the Celestial Library; Daoist concepts verified against Legge (1891) and standard scholarship.',
    rights: '© Inner Orbit (original work). Free to read in the Library.',
    contentType: 'original',
    completeness: 'Complete introductory edition (3/3 chapters). Structured for later chapter-by-chapter expansion.',
  },
  related: [
    { bookId: 'tao-te-ching', reason: 'The source spring — read each Millennial chapter beside its Tao Te Ching root.' },
    { bookId: 'enchiridion', reason: 'Ancient East and West agree: hold plans lightly, act cleanly.' },
    { bookId: 'consciousness-primer', reason: 'What the un-named mind looks like to modern science.' },
  ],
  chapters: [
    {
      id: 'mt-1',
      title: 'The Map Is Not the Morning',
      subtitle: 'After Tao Te Ching, Chapter 1 · On language and fixed definitions',
      sourceLabel: 'The Millennial Tao · Chapter 1 · Original text',
      attribution: 'Original Inner Orbit writing. Philosophical foundation: Tao Te Ching Ch. 1 (Legge 1891, public domain).',
      verses: [
        {
          heading: 'Philosophical Foundation',
          lines: [
            { id: '78816ac7-2015-4e17-bc03-21b9e12fc0fc', text: 'The Tao Te Ching opens with a warning label: the Tao that can be named is not the eternal Tao. Before Laozi tells you anything, he tells you that telling has limits — that every name is a handle, and reality refuses to be carried by its handles.' },
            { id: '8be36486-31cf-4590-9e7d-f3c28a30aa4f', text: 'This is not mysticism being evasive. It is philosophy being precise: definitions draw borders, and the living world keeps crossing them. The chapter gives us the “nameless” (mystery, origin) and the “named” (the distinct things of daily life) — same reality, two modes of meeting it.' },
          ],
        },
        {
          heading: 'The Contemporary Current',
          lines: [
            { id: '18014203-1c1a-4454-ac3a-871dd244263e', text: 'You live inside the most naming-saturated civilization in history. Algorithms label you (high-intent buyer, anxious attacher, type-A); you label yourself back (burnt out, behind, “not a morning person”); everyone performs nouns — founder, creator, healer — as if the noun were the person.' },
            { id: 'c6a93a50-dea0-4fe9-b0d7-9e0854325db8', text: 'The ancient warning fits this world like it was written yesterday: every label is a map, and you keep mistaking your maps for mornings. The profile is not the person. The diagnosis is not the destiny. The five-year plan is not the life — it is a sketch of one, drawn by someone (past-you) who knew less than present-you.' },
            { id: 'e2f6e25d-979c-4623-b65f-c23359c8ae1f', text: 'None of this means abandoning language. Laozi wrote eighty-one chapters, after all. It means holding names the way you hold a good map on a real hike: grateful for guidance, eyes up for the actual trail, willing to fold the map when the mountain disagrees.' },
          ],
        },
        {
          heading: 'A Small Practice of Un-Naming',
          lines: [
            { id: '5ce64c3c-86ea-4240-90a9-45413102ddfd', text: 'Pick one fixed definition you carry — about yourself or someone close. (“I’m bad with money.” “She never listens.” “I’m an introvert, so I can’t.”) For one week, treat it as a hypothesis instead of a fact. Collect one counter-example per day. Most people find the label was a cage with the door open.' },
            { id: 'f2f4dafb-92ce-4316-a98e-7c8b75f127a8', text: 'The gate of the subtle and wonderful, the old text says, opens where the Mystery is deepest. Translation for moderns: curiosity lives on the far side of certainty. Un-name one thing, and watch aliveness leak back in.' },
          ],
        },
      ],
      essence:
        'Words are maps; life is the territory. You navigate partly by labels — roles, diagnoses, identities — but freedom begins when you remember they are tools, not truths. Hold every definition lightly enough to update it, and the world gets bigger, kinder, and more possible.',
      deeper: [
        'The chapter’s wordplay (tao as both “way” and “to speak”) performs its own message — language wobbling even as it points. Modern linguistics agrees: categories shape perception (the Sapir-Whorf vicinity), which is why rigid labels literally narrow what you can see.',
        'Psychology rediscovered this as “cognitive defusion” (ACT therapy): you are not your story about yourself. And Carol Dweck’s growth-mindset research shows fixed self-definitions (“I’m not a math person”) measurably degrade performance.',
        'Important nuance: un-naming is not vagueness and never an excuse to dodge accountability. “Labels are limited” cannot launder “I refuse to be described.” The Taoist holds names lightly — and still answers to them.',
      ],
      perspectives: [
        { label: 'Daoist', text: 'Names divide the undivided; wisdom keeps one foot in the nameless while functioning skillfully among names.' },
        { label: 'Stoic (compare)', text: 'Epictetus agrees from the West: “It is not things but opinions about things” — labels — “that disturb us.” Different tradition, same leverage point. Neither claims the traditions are identical.' },
        { label: 'Skeptical', text: 'A fair objection: some names (medical diagnoses, legal categories) save lives precisely by being fixed. The chapter’s answer: fix them where precision serves; release them where it strangles.' },
      ],
      bringToLife: [
        { title: 'The bio audit', text: 'Read your own social-media bio. Notice what it claims you are. Ask: what true thing about me would never fit here? That remainder is the nameless peeking through.' },
        { title: 'The difficult person', text: 'Someone you’ve filed under a noun — “narcissist,” “flake,” “difficult.” Try one interaction with the file closed. You may meet a verb (a person becoming) instead.' },
        { title: 'Career labels', text: '“I’m a designer, so I can’t write strategy” — the map forbidding the territory. The un-named professional experiments first and updates the title later.' },
      ],
      reflection: {
        questions: [
          'What three labels do you introduce yourself with most? Which one is most overdue for revision?',
          'Where has a label about someone else become a self-fulfilling prophecy — you stopped seeing anything but the noun?',
          'What would you attempt this month if your fixed self-definition were suspended?',
        ],
        exercise: 'The Un-Name Journal: each evening, write one sentence beginning “Today I was more than ___” and one beginning “Today ___ surprised me by ___.” Seven days. Notice the loosening.',
        journeyHook: 'Designed to become a “Beginner’s Mind” practice path in Your Journey — label audits and curiosity streaks.',
      },
      livingPage: 'breath-mandala',
      connections: [
        { bookId: 'tao-te-ching', chapterId: 'ttc-1', reason: 'Read the 2,300-year-old source this chapter translates.' },
        { bookId: 'varieties-experience', reason: 'James on the “ineffable” quality of mystical states — the nameless, studied.' },
      ],
    },
    {
      id: 'mt-2',
      title: 'Flow, Don’t Force',
      subtitle: 'After Tao Te Ching, Chapter 8 · On wu wei in a hustle world',
      sourceLabel: 'The Millennial Tao · Chapter 2 · Original text',
      attribution: 'Original Inner Orbit writing. Philosophical foundation: Tao Te Ching Ch. 8 (Legge 1891, public domain).',
      verses: [
        {
          heading: 'Philosophical Foundation',
          lines: [
            { id: '49eb45be-19f3-4d00-a7f1-6069f38fad04', text: '“The highest excellence is like water,” says Chapter 8. Water benefits everything, contends with nothing, settles into the low places everyone else avoids — and in the end shapes stone. This is the portrait of wu wei: not passivity, not laziness, not “doing nothing,” but action without unnecessary forcing — timely, responsive, frictionless.' },
            { id: '4f41e115-4172-4622-97f1-54951195fee3', text: 'The chapter then applies water-logic everywhere: stillness of mind, skill in affairs, timeliness in movement, humility in position. Wu wei is not one technique; it is a way of moving through a whole life the way water moves through a landscape.' },
          ],
        },
        {
          heading: 'The Contemporary Current',
          lines: [
            { id: '7d98b338-a2e2-4e20-a623-5590981f3ace', text: 'Hustle culture worships hardness: push through, grind, dominate, never settle. It works — until it doesn’t. The forced launch flops, the pressured relationship cracks, the white-knuckled creative session produces clenched, joyless work. Force borrows from tomorrow’s energy at brutal interest.' },
            { id: '59b8c9aa-7860-4039-b7df-856b49e2087c', text: 'Water-logic proposes the opposite experiment. The email that needs “the right moment” — wait for it. The conflict that tightens every time you push — try the low place: ask a question instead of making a point. The project that feels like dragging stone — ask what wants to happen (what the material, the market, the moment allows) and align effort with that grain instead of against it.' },
            { id: 'f7ab09be-8d53-4e1d-89b0-5b437219befa', text: 'Athletes call it the zone; musicians call it groove; psychologists call it flow. The Taoists just called it Tuesday. Wu wei is the discovery that your best work usually feels less like wrestling and more like steering something already moving.' },
          ],
        },
        {
          heading: 'Forcing vs. Flowing: A Field Guide',
          lines: [
            { id: '836b1271-abd8-41f3-9012-e7ae1e97fc00', text: 'Forcing feels like: tight chest, tunnel vision, irritability at obstacles, exhaustion disproportionate to output, and a strange hollowness even when you “win.”' },
            { id: 'b5f8c341-3de0-451a-8fb1-02ea8a69c97e', text: 'Flowing feels like: alert relaxation, obstacles registering as information rather than insult, time dilating, energy sustained, and work that surprises you with its quality.' },
            { id: 'aa5fdf2a-208b-4a49-b427-87f37a6ca0af', text: 'The practice is embarrassingly simple to state and endlessly subtle to live: several times a day, ask “Am I water right now, or am I stone arguing with stone?” Then make one small adjustment toward water — soften the grip, change the timing, take the low place, or rest so the silt settles.' },
          ],
        },
      ],
      essence:
        'Stop arguing with stone and start studying water. Wu wei means acting with the grain of the moment — right timing, soft persistence, no wasted force — rather than grinding against it. It is not doing less; it is forcing less, so that what you do lands.',
      deeper: [
        'Wu wei (無為) is among the most mistranslated terms in philosophy. “Non-action” misleads English readers toward passivity; scholars increasingly prefer “effortless action” (Slingerland) or “action without overdoing.” The water of Chapter 8 is extremely active — it nourishes all things — but never contentious.',
        'Flow research (Csikszentmihalyi) converges strikingly: optimal experience arises when challenge meets skill, goals are clear, and the self-conscious “forcer” drops out. Different vocabulary, same river.',
        'The “low place” deserves care: it is strategic humility, not self-erasure. Water takes the low place and thereby gathers all streams. The chapter promises influence through non-contention — not disappearance.',
      ],
      perspectives: [
        { label: 'Daoist', text: 'Align with the Tao’s own movement; force reveals misalignment, not virtue.' },
        { label: 'Stoic (compare)', text: 'Marcus would add: control your effort, release the outcome. Wu wei governs the how; Stoicism guards the heart toward results. Complementary, not identical.' },
        { label: 'Caution', text: '“Going with the flow” must never baptize avoidance or injustice. Water also floods; discernment chooses when to yield and when to carve.' },
      ],
      bringToLife: [
        { title: 'The deadline crunch', text: 'Forcing: fourteen frantic hours, snapping at collaborators, shipping something brittle. Water: ruthless prioritization, one honest conversation about scope, protected sleep — often shipping better work in fewer hours.' },
        { title: 'Traffic', text: 'You cannot force the highway. The water-driver picks the lane that moves, breathes, listens to something good — arriving minutes later and hours calmer.' },
        { title: 'Creative work', text: 'Stuck on the blank page? Forcing produces clenched drafts. Walk, shower, sleep — the silt settles, the water clears, and the sentence you needed surfaces like a fish.' },
      ],
      reflection: {
        questions: [
          'Where are you currently “stone arguing with stone”? Describe the forcing in one paragraph.',
          'What would the water-version of your next move be — softer timing, lower place, different channel?',
          'When did flow last find you? What conditions preceded it — and can you garden those conditions?',
        ],
        exercise: 'The Water Audit: three times tomorrow, pause and rate forcing-vs-flowing 1–10. For each forcing-moment, make one micro-adjustment (breathe, re-time, ask, yield). Log what changed.',
        journeyHook: 'A natural “Flow Experiments” track for Your Journey — daily forcing/flow check-ins.',
      },
      livingPage: 'tao-water',
      connections: [
        { bookId: 'tao-te-ching', chapterId: 'ttc-8', reason: 'The source chapter on water-excellence, in Legge’s 1891 English.' },
        { bookId: 'enchiridion', chapterId: 'ench-2', reason: '“Demand not that events happen as you wish” — the Western companion to wu wei.' },
      ],
    },
    {
      id: 'mt-3',
      title: 'Enough Is a Place',
      subtitle: 'After Tao Te Ching, Chapters 11 & 25 · On simplicity, desire, and contentment',
      sourceLabel: 'The Millennial Tao · Chapter 3 · Original text',
      attribution: 'Original Inner Orbit writing. Foundations: Tao Te Ching Chs. 11 & 25 (Legge 1891, public domain).',
      verses: [
        {
          heading: 'Philosophical Foundation',
          lines: [
            { id: '2527dda1-8ed5-45a4-aa67-8ec72ad84be3', text: 'Two chapters, one teaching. Chapter 11: the wheel works because of its empty hub, the vessel because of its hollowness, the room because of its space. Usefulness lives in emptiness. Chapter 25: humanity nested in Earth, Earth in Heaven, all in the self-so Tao — belonging as the deepest fact, not acquisition.' },
            { id: '91631c01-6671-4801-8fb5-4fd5b8b2926e', text: 'Together they diagnose the modern disease with ancient precision: we keep adding spokes while ignoring the hub, filling rooms until no one can move, and chasing belonging through accumulation — when belonging was the starting condition and usefulness was always about space.' },
          ],
        },
        {
          heading: 'The Contemporary Current',
          lines: [
            { id: 'aaea3d5c-9fee-4c76-8272-831d90ce3a1f', text: 'Desire, in the attention economy, is manufactured on industrial lines. Every feed is a catalog of lives shinier than yours; every “limited drop” is urgency synthesized in a marketing meeting. The result is what psychologists call the hedonic treadmill and what the Taoists would call a room with no empty space — full, and therefore useless.' },
            { id: '813ca346-466c-41b9-8c7d-e96a1821da03', text: '“Enough” is not a number. It is a place — a settled recognition that the vessel of your life is already hollow in the right shape to be useful. Practices that relocate you there are unglamorous and undefeated: the cleared surface, the finished (not perfect) project, the phone in another room, the want-list that must age thirty days before it becomes a buy-list.' },
            { id: '9565544f-c036-421c-8ba7-f2bfa5282f09', text: 'And beneath the tactics sits Chapter 25’s consolation: you are already nested. The stars over the parking lot are the same vastness the old sages praised. Contentment is not having everything; it is remembering where — and in what — you already are.' },
          ],
        },
        {
          heading: 'The Soft Strength of Less',
          lines: [
            { id: 'e0b1c70b-8928-4d6b-85d2-9a4ede1e6543', text: 'Adaptability, humility, non-contention — the chapter-cluster’s quiet virtues — all turn out to be strengths of the soft. The person who needs less can bend further, wait longer, and walk away cleaner. Every desire you release is a negotiation you no longer have to win.' },
            { id: '1f457e52-9dc6-4749-93e2-9ebde0d0f451', text: 'Try the ancient audit in modern dress: for each recurring want, ask “Which emptiness would this fill — and is that emptiness actually the useful part?” Genuine needs answer clearly. Manufactured ones dissolve under the question like mist — hevel, as the Hebrew Teacher would say.' },
          ],
        },
      ],
      essence:
        'Usefulness lives in emptiness and belonging precedes acquisition — so the good life is less about adding and more about protecting space. “Enough” is not a finish line you cross but a place you return to: the clear hub, the breathable room, the already-nested self.',
      deeper: [
        'Chapter 11’s triad (wheel, vessel, room) is design philosophy: form serves void. Minimalist movements from Shaker furniture to Marie Kondo unknowingly preach it; the Tao Te Ching preached it first.',
        'Desire research supports the diagnosis: beyond sufficiency, additional consumption barely moves well-being (the Easterlin vicinity), while “wanting” circuitry (dopamine) is distinct from “liking” circuitry — you can be driven to chase what will not satisfy.',
        'Non-contention (不爭) as strength: game theory’s cooperative strategies, negotiation’s “best alternative,” and the martial arts’ yielding throws all formalize what Chapter 8 intuited — softness as power.',
      ],
      perspectives: [
        { label: 'Daoist', text: 'Return to the uncarved block (pu): simplicity not as poverty but as undifferentiated potential.' },
        { label: 'Stoic (compare)', text: 'Seneca: “It is not the man who has too little, but the man who craves more, that is poor.” Same arithmetic, Roman ledger.' },
        { label: 'Justice note', text: 'Contentment-talk must never shame real need. The teaching addresses manufactured want amid sufficiency — not poverty, which deserves remedy, not sermons.' },
      ],
      bringToLife: [
        { title: 'The thirty-day list', text: 'Every non-essential want goes on a dated list. If you still want it in thirty days, consider it. Most entries will embarrass their authors — that embarrassment is Chapter 11 working.' },
        { title: 'The one clear surface', text: 'Keep a single surface — desk, nightstand, kitchen counter — permanently clear. It becomes a shrine to the useful void and a daily reminder of Enough.' },
        { title: 'Enough, stated', text: 'Write your “enough” for money, stuff, followers, busyness — concrete numbers. Unwritten enoughs inflate forever; written ones can be arrived at.' },
      ],
      reflection: {
        questions: [
          'What room in your life (literal or figurative) has lost its emptiness? What would one clear cubic foot change?',
          'Whose manufactured desire are you currently carrying as if it were your own?',
          'Describe your “Enough” in one paragraph. When did you last visit that place?',
        ],
        exercise: 'The Emptiness Audit: empty one container, cancel one subscription of attention (a feed, a newsletter, a grudge), and leave one hour unscheduled this week. Journal the usefulness of each void.',
        journeyHook: '“Enough Is a Place” could anchor a Your Journey season on simplicity — audits, clearings, and contentment check-ins.',
      },
      livingPage: 'fibonacci-spiral',
      connections: [
        { bookId: 'tao-te-ching', chapterId: 'ttc-11', reason: 'The wheel, the vessel, the room — the 2,300-year-old original.' },
        { bookId: 'sacred-geometry-primer', chapterId: 'sg-2', reason: 'Nature’s own “enough”: the spirals that grow by perfect proportion.' },
        { bookId: 'ecclesiastes', chapterId: 'eccl-1', reason: '“The eye is not satisfied with seeing” — Hebrew wisdom on the same treadmill.' },
      ],
    },
  ],
};
