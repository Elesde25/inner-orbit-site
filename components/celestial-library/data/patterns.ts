import type { Book } from './types';

export const patternsBooks: Book[] = [
  {
    id: 'sacred-geometry-primer',
    title: 'Forms of Eternity — A Sacred Geometry Primer',
    author: 'Inner Orbit · Original Work',
    roomId: 'patterns',
    tradition: 'Inner Orbit Original · Mathematics, history & symbolism',
    subjects: ['Sacred Geometry', 'Mathematics', 'Symbolism'],
    themes: ['proportion', 'solids', 'spirals', 'mandalas', 'harmony'],
    status: 'complete',
    featured: true,
    pagesEstimate: 'Original · 3 chapters',
    cover: { material: 'metal', base: '#101a3a,#2e4a8a', accent: '#f7dd9a', motif: 'geometry', gem: '#9fe8ff' },
    description:
      'An original, hands-on introduction to the mathematics that mystics loved: the five Platonic solids, the golden ratio and Fibonacci growth, and the mandala as cosmos-map. Established mathematics and spiritual associations are rigorously distinguished — wonder without confusion.',
    edition: {
      edition: 'Inner Orbit First Edition — complete in three chapters',
      source: 'Original exposition; mathematical facts standard (Euclid XIII, Fibonacci 1202, Coxeter). Historical claims per cited scholarship.',
      rights: '© Inner Orbit (original work).',
      contentType: 'original',
      completeness: 'Complete (3/3 chapters), each with an interactive Living Page demonstration.',
    },
    related: [
      { bookId: 'tao-te-ching', reason: 'Chapter 11’s wheel and vessel — emptiness made geometric.' },
      { bookId: 'alchemical-symbols', reason: 'Where these forms reappear as alchemical emblems.' },
      { bookId: 'dhammapada', reason: 'Mandalas as Buddhist meditation architecture.' },
    ],
    chapters: [
      {
        id: 'sg-1',
        title: 'The Five Perfect Solids',
        subtitle: 'Why there are exactly five — and what they meant',
        sourceLabel: 'Forms of Eternity · Chapter 1 · Original',
        attribution: 'Original Inner Orbit writing. Mathematics: standard (Euclid, Elements XIII).',
        verses: [
          {
            heading: 'ESTABLISHED MATHEMATICS: Exactly Five',
            lines: [
              { id: '76ada172-d7e9-41a4-b6d7-086eb77401cf', text: 'A Platonic solid is a convex polyhedron with identical regular-polygon faces meeting identically at every vertex. There are exactly five — tetrahedron (4 triangles), cube (6 squares), octahedron (8 triangles), dodecahedron (12 pentagons), icosahedron (20 triangles) — and this was proved by Euclid (Elements, Book XIII, c. 300 BCE): only five angle-combinations can close around a point in three dimensions.' },
              { id: 'adbd432b-013b-402e-a6a5-0d7239b7d414', text: 'Each solid has a dual (faces ↔ vertices): cube ↔ octahedron, dodecahedron ↔ icosahedron, tetrahedron ↔ itself. Euler’s formula (V − E + F = 2) governs them all. These are facts — as certain as anything humans know.' },
            ],
          },
          {
            heading: 'HISTORY: The Solids as Elements',
            lines: [
              { id: 'a270feca-35be-4f14-a671-e156255a6ad0', text: 'Plato’s Timaeus (c. 360 BCE) assigned solids to elements: tetrahedron–fire (sharp), cube–earth (stable), octahedron–air, icosahedron–water — with the dodecahedron reserved for the cosmos itself (“the god used it for the whole”). This was natural philosophy, not mysticism: the best physics of its day, wrong but magnificent.' },
              { id: '10ddc498-7c49-4162-bbd8-1288efdd0978', text: 'The lineage runs through Kepler (who nested the solids to model planetary orbits in Mysterium Cosmographicum, 1596 — wrong, and gloriously productive, leading him to his laws) to modern chemistry, where tetrahedral carbon and icosahedral viruses vindicate the intuition that nature loves these forms.' },
            ],
          },
          {
            heading: 'SPIRITUAL ASSOCIATIONS (interpretive — not mathematics)',
            lines: [
              { id: '3e23f154-7bbd-452d-a833-1f11e351e974', text: 'Esoteric traditions later mapped the solids onto chakras, archangels, and “Metatron’s Cube” (a modern construction, not ancient). These mappings are meaningful to practitioners and historically interesting — but they are associations layered onto the mathematics, not conclusions from it. This Library honors the distinction: the five-fold proof belongs to everyone; the symbolism belongs to its traditions.' },
            ],
          },
        ],
        essence:
          'Only five perfectly regular solids can exist — Euclid proved it — and that austere fact has fascinated everyone from Plato to Kepler to virologists. The solids are genuine meeting-grounds of necessity and beauty; the spiritual meanings layered onto them are human responses to that beauty, precious but distinct from the proof.',
        deeper: [
          'Why five? Around any vertex, face-angles must sum to less than 360°. Only six regular-face combinations qualify; one tiles flat instead of closing. Hence: five. A proof you can verify with paper polygons in an afternoon.',
          'Duality pairs the solids beautifully: join cube face-centres and an octahedron appears. Contemplatives read this as metaphysics (inner/outer, heaven/earth mirroring); mathematicians read it as symmetry — both are responding to something real.',
          '“Sacred geometry” as a modern movement blends genuine mathematics with speculative claims (pyramid energies, “flower of life” antiquity). Enjoy the art; verify the history; cherish the proofs.',
        ],
        perspectives: [
          { label: 'Mathematical', text: 'Classification theorem: complete, proved, eternal. The solids need no symbolism to be wonderful.' },
          { label: 'Historical', text: 'Plato’s and Kepler’s “wrong” uses generated real science — beauty as a productive bet, not a guarantee.' },
          { label: 'Contemplative', text: 'Holding an imagined dodecahedron in meditation is a focusing discipline; its value is experiential, and that is enough.' },
        ],
        bringToLife: [
          { title: 'Build one', text: 'Print a net, fold a tetrahedron. The moment flat paper locks into inevitable form, you feel what “proof” means in your hands.' },
          { title: 'Spot them', text: 'Dice (cube), viruses (icosahedral), pyrite (cubic), garnets (dodecahedral) — the five are hiding in plain sight.' },
        ],
        reflection: {
          questions: [
            'Why does “exactly five” feel meaningful? What does your response reveal about how you relate necessity to beauty?',
            'Where else do you conflate a fact with the feelings it evokes — and is that conflation harmful or fertile?',
          ],
          exercise: 'Rotate each solid in the Living Page below. For each, write one mathematical sentence (true) and one associative sentence (felt) — and label which is which.',
          journeyHook: 'A “Fact & Felt” discernment log for Your Journey.',
        },
        livingPage: 'geometry-solids',
        connections: [
          { bookId: 'tao-te-ching', chapterId: 'ttc-11', reason: 'The vessel’s hollowness — now in foldable, rotatable form.' },
        ],
      },
      {
        id: 'sg-2',
        title: 'The Golden Ratio & the Fibonacci Growth',
        subtitle: 'Phi, spirals, and honest wonder',
        sourceLabel: 'Forms of Eternity · Chapter 2 · Original',
        attribution: 'Original Inner Orbit writing. Mathematics: standard.',
        verses: [
          {
            heading: 'ESTABLISHED MATHEMATICS: Phi and Fibonacci',
            lines: [
              { id: '7e7253a3-5dc4-4f76-8d72-900e242fe579', text: 'The golden ratio φ (phi ≈ 1.618…) is the number where a line divided so that whole : long = long : short. Euclid defined it (Elements VI); it appears in pentagons, Penrose tilings, and continued fractions — genuinely, provably, beautifully.' },
              { id: '65386f85-a5eb-472f-b13b-c9cbd728d655', text: 'The Fibonacci sequence (1, 1, 2, 3, 5, 8, 13…) — published by Leonardo of Pisa in Liber Abaci (1202) — converges on φ: each ratio of neighbors approaches 1.618…. This is theorem, not mystique.' },
              { id: 'ae718e31-5e61-4b98-8553-ede7cc637142', text: 'Phyllotaxis — leaf and seed arrangement — really does favor Fibonacci angles (≈137.5°, the golden angle) because it packs optimally. Sunflowers, pinecones, and pineapples exhibit Fibonacci spirals for reasons of efficiency that botanists understand. Honest wonder needs no exaggeration.' },
            ],
          },
          {
            heading: 'HONEST CORRECTIONS: What Is Oversold',
            lines: [
              { id: 'ad72b427-bb85-49d2-95b3-07f82e05d572', text: 'Nautilus shells are usually NOT golden spirals (they are logarithmic spirals with different growth factors — a beautiful fact displaced by a false one). Claims about the Parthenon, pyramids, and human body often involve cherry-picked measurements. The “most beautiful rectangle” experiments are mixed at best.' },
              { id: '46c03f54-09b5-4c2b-9a12-324accf22239', text: 'This Library’s rule: real phi-phenomena (pentagons, phyllotaxis, Penrose, continued fractions) are astonishing enough. We debunk the fakes to protect the genuine marvels.' },
            ],
          },
          {
            heading: 'SPIRAL GROWTH (interactive below)',
            lines: [
              { id: '02e3004d-2d24-41ce-a8a6-cd1d0eabbed0', text: 'The Living Page lets you grow a Fibonacci spiral square-by-square and compare it against a true golden spiral and a nautilus cross-section — seeing with your own eyes where nature matches the mathematics and where myth overreaches it.' },
            ],
          },
        ],
        essence:
          'Phi is real, Fibonacci growth is real, and sunflowers really do the mathematics — but nautilus shells mostly don’t, and the Parthenon probably doesn’t. The honest golden ratio is more wonderful than the hyped one, because it survives scrutiny. Learn the true cases, release the false, and keep the awe.',
        deeper: [
          'Why 137.5°? It is the angle that never repeats (φ being “most irrational”), so each new seed lands in the largest remaining gap — optimal packing emerging from number theory. Evolution discovered the theorem by survival.',
          'The golden ratio’s aesthetic claims trace largely to 19th-century German psychologists (Zeising, Fechner) — interesting experiments, overstated conclusions, then a century of self-help inflation. Knowing this history inoculates wonder against embarrassment.',
          'Logarithmic spirals (nautilus, galaxies, hurricanes) share self-similarity with golden spirals but differ in growth factor — cousins, not twins. Precision here is a form of respect for nature’s actual variety.',
        ],
        perspectives: [
          { label: 'Mathematical', text: 'φ as algebraic celebrity: continued fractions, pentagon geometry, Penrose aperiodicity — riches enough.' },
          { label: 'Biological', text: 'Phyllotaxis as optimization: nature “uses” Fibonacci the way rivers “use” calculus — by consequence, not contemplation.' },
          { label: 'Symbolic', text: 'Growth-by-proportion as a life image (the Millennial Tao’s “Enough”): expand without distortion, larger yet same-shaped.' },
        ],
        bringToLife: [
          { title: 'Count a sunflower', text: 'Seed-head spirals come in Fibonacci pairs (34/55, 55/89). Counting them in a garden is mathematics as treasure hunt.' },
          { title: 'Grow proportionally', text: 'A project, a team, a life — scaling that preserves shape (values, ratios, rhythms) is phyllotaxis as management philosophy.' },
        ],
        reflection: {
          questions: [
            'Why do false phi-claims spread so eagerly? What hunger does the myth feed that the fact doesn’t — and can the fact be taught to feed it?',
            'Where in your life is growth distorting shape — and what would “golden” (proportional) growth look like?',
          ],
          exercise: 'Use the Living Page to build the spiral to 8 squares, then find one Fibonacci pair in your kitchen (pineapple, cauliflower, banana). Photograph it. You now own this mathematics.',
        },
        livingPage: 'fibonacci-spiral',
        connections: [
          { bookId: 'millennial-tao', chapterId: 'mt-3', reason: '“Enough Is a Place” — growth that keeps its proportion.' },
          { bookId: 'consciousness-primer', reason: 'Why brains love patterns — and sometimes love them into existence (apophenia).' },
        ],
      },
      {
        id: 'sg-3',
        title: 'Mandalas — Cosmos in a Circle',
        subtitle: 'Maps for the eye, architecture for meditation',
        sourceLabel: 'Forms of Eternity · Chapter 3 · Original',
        attribution: 'Original Inner Orbit writing. Art-historical claims per cited scholarship.',
        verses: [
          {
            heading: 'What Mandalas Are (Art History)',
            lines: [
              { id: 'deb11994-fd72-4fa8-bdb0-67e5b4e31d93', text: '“Mandala” (Sanskrit: circle, essence, container) names the geometric cosmos-maps of Hindu and Buddhist tradition: concentric squares and circles, gates at four directions, a deity or bindu-point at the centre. Tibetan sand mandalas (notably Kalachakra), Japanese Shingon’s Womb-and-Diamond worlds, and Hindu temple plans (vastupurusha-mandala) are major families — each a cosmology you can walk with your eyes.' },
              { id: '25877133-2e8f-495b-8115-f7bc6179acb8', text: 'Use is practical: monks memorize mandalas over years, visualize themselves entering them, and dissolve them (sand swept away) to embody impermanence. The mandala is simultaneously map, palace, body, and meditation manual.' },
            ],
          },
          {
            heading: 'ESTABLISHED FACTS vs. ASSOCIATIONS',
            lines: [
              { id: '8a9d8b44-51d4-4d53-a28d-30194194e311', text: 'FACT: mandalas structure real contemplative training with documented attentional effects (focused-visualization practices show standard meditation benefits). FACT: their geometries encode genuine mathematics (radial symmetry groups, nested proportions).' },
              { id: '909d291d-63c7-43a9-be90-a021b5c08fab', text: 'ASSOCIATION (respectful, distinct): Jung’s reading of mandalas as Self-archetypes emerging spontaneously in patients East and West — clinically suggestive, theoretically debated, therapeutically fruitful. INTERPRETATION (marked): New-Age claims of “mandala healing frequencies” exceed evidence; this Library separates Jung’s careful hypotheses from later inflation.' },
            ],
          },
          {
            heading: 'Across Cultures (Comparative, Careful)',
            lines: [
              { id: 'dc7109dc-c038-4687-bd94-95b497df497f', text: 'Circular cosmos-maps recur: Aztec Sun Stone, Chartres labyrinth, Navajo sandpaintings (created and destroyed in healing rites — parallel, not equivalent, to Tibetan practice), Hildegard’s visions, Islamic girih tilings. Comparison illuminates — each tradition’s mandala answers its own cosmology — and must never flatten: a sandpainting is not “a mandala,” it is Diné healing technology with its own protocols, some restricted. Respect means specificity.' },
            ],
          },
        ],
        essence:
          'A mandala is a universe you can hold in your gaze: gates, guardians, and a still centre — walked inward by monks over years and dissolved in an afternoon to teach impermanence. Their power is real (attention, devotion, beauty) and specific (each tradition’s own); honor them by learning their differences, not by melting them into one.',
        deeper: [
          'The centre-and-circumference structure mirrors contemplative phenomenology: distractions at the gates, deities as transformed energies, bindu as nondual awareness. Whether designed from experience or experienced from design, the fit is what makes mandalas work as instruments.',
          'Sand mandala dissolution is philosophy performed: weeks of meticulous beauty swept into a river. Compare Ecclesiastes’ hevel (breath) and the Stoic memento — three traditions staging impermanence, each in its own medium.',
          'Girih tilings (Islamic geometric art) encode quasi-crystalline mathematics centuries before Western discovery (Lu & Steinhardt, 2007) — a reminder that “sacred” and “rigorous” were never opposites.',
        ],
        perspectives: [
          { label: 'Devotional (Tibetan)', text: 'The mandala is the deity’s palace; visualization is invitation, not imagination.' },
          { label: 'Jungian', text: 'Spontaneous mandalas in dreams and psychosis suggest a centre-seeking function of the psyche.' },
          { label: 'Art-historical', text: 'Patronage, pigment, lineage, politics — mandalas as material culture as well as spirit.' },
        ],
        bringToLife: [
          { title: 'Draw one', text: 'Compass, ruler, one hour: a personal mandala of your current life — gates (entries), guardians (protections), centre (what matters). No skill required; attention is the medium.' },
          { title: 'Walk Chartres (or any labyrinth)', text: 'Many cathedrals and parks hold walkable labyrinths — mandalas at foot-scale. One slow circuit teaches more than ten pages.' },
        ],
        reflection: {
          questions: [
            'If your life were a mandala, what stands at the centre right now — and what guards (or blocks) the gates?',
            'What would it mean to build something beautiful for weeks and dissolve it in an afternoon?',
          ],
          exercise: 'Use the Living Page breath-mandala: breathe with the expanding geometry for five minutes, then sketch the after-image. Compare attention before and after.',
        },
        livingPage: 'breath-mandala',
        connections: [
          { bookId: 'dhammapada', chapterId: 'dhp-2', reason: 'Heedfulness as the gate-guardian of the inner mandala.' },
          { bookId: 'consciousness-primer', chapterId: 'cm-2', reason: 'Attention science behind visualization practice.' },
        ],
      },
    ],
  },
  {
    id: 'archetypes-myth',
    title: 'Archetypes & the Mythic Library Within',
    author: 'Inner Orbit · Original Work',
    roomId: 'patterns',
    tradition: 'Inner Orbit Original · Jungian & comparative mythology',
    subjects: ['Archetypes', 'Mythology', 'Psychology'],
    themes: ['archetypes', 'myth', 'symbols', 'hero'],
    status: 'selection',
    pagesEstimate: 'Original · 1 chapter',
    cover: { material: 'leather', base: '#2a1a3a,#5c3a6b', accent: '#e8c476', motif: 'mandala', gem: '#ff9dd0' },
    description:
      'An original introduction to archetypal patterns — Hero, Shadow, Anima/Animus, Trickster, Wise Old One — through Jung, Campbell, and the world’s myths, with careful notes on what is clinical hypothesis, what is literary pattern, and what is speculation.',
    edition: {
      edition: 'Inner Orbit First Edition — opening chapter',
      source: 'Original synthesis of Jung, Campbell, von Franz; critiques (anthropological, feminist) represented.',
      rights: '© Inner Orbit (original work).',
      contentType: 'original',
      completeness: 'Opening chapter complete; Hero, Shadow, and Trickster deep-dives forthcoming.',
    },
    related: [
      { bookId: 'varieties-experience', reason: 'James and Jung: two psychologies of the inner life.' },
      { bookId: 'sacred-geometry-primer', reason: 'Mandala as the Self’s geometric signature.' },
    ],
    chapters: [
      {
        id: 'am-1',
        title: 'The Cast of the Inner Drama',
        subtitle: 'Meeting the archetypes without mystification',
        sourceLabel: 'Archetypes & the Mythic Library · Chapter 1 · Original',
        attribution: 'Original Inner Orbit writing.',
        verses: [
          {
            heading: 'What “Archetype” Means (and Doesn’t)',
            lines: [
              { id: '2334d17e-0e28-4a9d-86de-b2ba44fb95be', text: 'Jung’s archetypes are not inherited images but inherited predispositions — typical ways the human psyche organizes experience, filled in by culture. The Hero, Shadow, Anima/Animus, Trickster, and Wise Old One recur because human situations recur: departure, darkness, otherness, disruption, guidance.' },
              { id: '9ce48f4a-9a2b-442a-a106-de571771ccec', text: 'STATUS CHECK (how to hold this): as clinical hypothesis, archetypal patterns are suggestive and therapeutically useful; as literary pattern (Campbell’s Hero’s Journey, Propp’s folktale functions), they are well-documented; as biology (a “hardwired” collective unconscious), they remain speculative. This chapter uses the middle register: patterns worth knowing, claims held lightly.' },
            ],
          },
          {
            heading: 'Five Figures, Briefly',
            lines: [
              { id: '8b7d775b-7bb5-40d0-ade8-c23efa4bbb1a', text: 'HERO — the ego’s adventure toward competence: departure, trial, return with boon. Your degree, your recovery, your startup: monomyth in modern dress.' },
              { id: '16b13238-6477-4c0a-984c-8fb674bd59e7', text: 'SHADOW — everything exiled from the persona: feared, despised, or merely undeveloped. It leaks (projections, slips) until integrated. “No one can fix on me what is ugly” (Marcus) is Shadow-work in Stoic dress.' },
              { id: '028ed4eb-97d5-4762-bf56-bd4f6eb1b1c7', text: 'ANIMA/ANIMUS — the contrasexual interior (Jung’s gendered frame, now widely reworked): the inner other who mediates depth. Read critically, keep the gold: everyone has an exiled interiority.' },
              { id: 'e1b9c1ad-3a8a-43a5-9acf-51dd5f693e51', text: 'TRICKSTER — boundary-violator and truth-teller: Hermes, Coyote, Eshu, Loki. Appears in lives as disruption that reveals — the glitch exposing the system.' },
              { id: 'e3d55b69-b4a5-4bd2-a587-7f230ed75bd8', text: 'WISE OLD ONE — the guiding function: Gandalf, Athena-as-mentor, your future self. Often dreamed at thresholds — the psyche offering counsel it already holds.' },
            ],
          },
        ],
        essence:
          'Your inner life has a recurring cast — Hero striving, Shadow lurking, Trickster disrupting, Guide whispering. These patterns are lenses, not laws: use them to read your dreams, stories, and stuck places more richly, while remembering they are hypotheses with critics, not doctrines with dogmas.',
        deeper: [
          'Campbell’s Hero’s Journey (1949) fused Jung with comparative myth — inspiring Star Wars and a thousand workshops. Scholars note his selectivity (the myths that don’t fit get less airtime); feminists and postcolonial critics (Murdock, others) have reframed or replaced the journey. Use Campbell as starter-map, not territory.',
          'Shadow-projection explains much ordinary misery: the trait you most despise in others often marks your own exiled material. Integration (owning it) typically deflates both the hatred and the compulsion.',
          'The Trickster deserves special honor in a library: Hermes/Mercury/Thoth/Eshu governs writing, interpretation, and crossroads — every reader’s patron. Expect him in mistranslations, footnotes, and this very chapter’s ironies.',
        ],
        perspectives: [
          { label: 'Jungian', text: 'Archetypes as living psychic realities encountered in dreams, visions, and active imagination.' },
          { label: 'Literary', text: 'Archetypes as narrative technology: patterns that move audiences because they pattern experience.' },
          { label: 'Critical', text: 'Archetypes as overgeneralization: vague enough to fit anything (Barnum risk), gendered in dated ways, in need of updating — which contemporary Jungians actively do.' },
        ],
        bringToLife: [
          { title: 'Cast your week', text: 'Which figure starred? The Hero’s push, the Shadow’s leak, the Trickster’s glitch, the Guide’s whisper? Naming the cast loosens its possession.' },
          { title: 'Meet the Shadow gently', text: 'Name one trait you harshly judge in others. Ask, without self-attack: where does a seed of it live in me — and what might it be protecting?' },
        ],
        reflection: {
          questions: [
            'Which archetype is most active in your life right now? Which is most absent — and is its absence a lack or a peace?',
            'What story (film, myth, memory) is your life currently most like — and what happens next in that story?',
          ],
          exercise: 'Active-imagination letter: let one figure write you a short letter (as the Guide, or from the Shadow). Write fast, edit never, read tomorrow. Note: imaginative exercise, not channeling — the pen is yours throughout.',
        },
        connections: [
          { bookId: 'varieties-experience', chapterId: 'vj-sick', reason: 'The divided self and its unification — James beside Jung.' },
          { bookId: 'bhagavad-gita', chapterId: 'gita-setting', reason: 'Arjuna at the threshold: the Hero refusing — then accepting — the call.' },
        ],
      },
    ],
  },
  {
    id: 'alchemical-symbols',
    title: 'The Alchemical Bestiary — Symbols of Transformation',
    author: 'Inner Orbit · Reference in preparation',
    roomId: 'patterns',
    tradition: 'History of alchemy · Alexandrian to early-modern',
    subjects: ['Alchemy', 'Symbolism', 'History'],
    themes: ['transformation', 'symbols', 'history'],
    status: 'forthcoming',
    pagesEstimate: 'Awaiting content',
    cover: { material: 'metal', base: '#2a1a0f,#5c3a1a', accent: '#ffb060', motif: 'alch', gem: '#ff6b4a' },
    description:
      'Ouroboros, green lion, rebis, philosopher’s egg: the great emblems of alchemy read as history (proto-chemistry), psychology (Jung’s reading), and art — with the Hermetica as their ancestral voice.',
    edition: {
      edition: 'In preparation — image rights review (manuscript illuminations) in progress',
      source: 'Public-domain emblem books (Maier, Khunrath, Mutus Liber) under verification.',
      rights: 'Pending verification of specific facsimiles.',
      contentType: 'forthcoming',
      completeness: 'Forthcoming — no readable content yet.',
    },
    related: [
      { bookId: 'hermetica', reason: '“As above, so below” — alchemy’s founding axiom.' },
      { bookId: 'sacred-geometry-primer', reason: 'The geometries hiding inside alchemical diagrams.' },
    ],
    chapters: [],
  },
  {
    id: 'symbols-astro-numero',
    title: 'Stars & Numbers — Astrology and Numerology as Symbol Systems',
    author: 'Inner Orbit · Reference in preparation',
    roomId: 'patterns',
    tradition: 'Comparative symbolism · Historical survey',
    subjects: ['Astrology', 'Numerology', 'Symbolism'],
    themes: ['symbols', 'correspondence', 'history'],
    status: 'forthcoming',
    pagesEstimate: 'Awaiting content',
    cover: { material: 'stone', base: '#0f1a3a,#2e3d7a', accent: '#c9d4ff', motif: 'star', gem: '#c9d4ff' },
    description:
      'A scholarly, non-predictive survey of astrological and numerological symbolism as cultural systems — what the symbols meant, how they were used, and how modern astronomy and statistics assess their claims. Symbolic literacy, never fortune-telling.',
    edition: {
      edition: 'In preparation',
      source: 'Original survey in preparation.',
      rights: '© Inner Orbit (forthcoming).',
      contentType: 'forthcoming',
      completeness: 'Forthcoming — no readable content yet.',
    },
    related: [{ bookId: 'archetypes-myth', reason: 'Planetary gods as archetypal figures.' }],
    chapters: [],
  },
];
