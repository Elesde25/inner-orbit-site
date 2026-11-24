import type { Book } from './types';

export const visionaryBooks: Book[] = [
  {
    id: 'consciousness-primer',
    title: 'The Luminous Mind — A Field Guide to Consciousness',
    author: 'Inner Orbit · Original Work',
    roomId: 'visionary',
    tradition: 'Inner Orbit Original · Science, philosophy & contemplative inquiry',
    subjects: ['Consciousness', 'Perception', 'Psychology'],
    themes: ['awareness', 'perception', 'attention', 'mystery'],
    status: 'selection',
    featured: true,
    pagesEstimate: 'Original · 2 chapters',
    cover: { material: 'crystal', base: '#1a0f3a,#5c2e8a', accent: '#c9b8ff', motif: 'eye', gem: '#7fe0ff' },
    description:
      'An original, carefully sourced introduction to the hardest problem in science: what consciousness is, how perception constructs your world, and what contemplative traditions and laboratories each reveal. Science, philosophy, and spiritual interpretation are clearly distinguished throughout.',
    edition: {
      edition: 'Inner Orbit First Edition — in serial release',
      source: 'Written for the Library from standard sources (peer-reviewed literature, classic texts). Key claims cited in-chapter.',
      rights: '© Inner Orbit (original work).',
      contentType: 'original',
      completeness: 'Two chapters complete; further chapters (attention, dreams, meditation science) in preparation.',
    },
    related: [
      { bookId: 'varieties-experience', reason: 'James’s classic casebook of the experiences this primer frames.' },
      { bookId: 'dhammapada', reason: 'The contemplative science of mind that anticipated much of this research.' },
    ],
    chapters: [
      {
        id: 'cm-1',
        title: 'The Hard Problem & the Controlled Hallucination',
        subtitle: 'Why awareness itself is the mystery',
        sourceLabel: 'The Luminous Mind · Chapter 1 · Original',
        attribution: 'Original Inner Orbit writing. Scientific claims per citations below.',
        verses: [
          {
            heading: 'Two Problems',
            lines: [
              { id: '721c7192-4890-44cd-88f7-364da1d48d54', text: 'In 1995 the philosopher David Chalmers drew a line that organized the entire field. The “easy problems” of consciousness — how the brain processes vision, directs attention, controls speech — are hard in practice but straightforward in principle: they ask how functions are performed.' },
              { id: '09e3be61-b3d1-4738-8a6d-1938ccfbdb4a', text: 'The “hard problem” is different: why is any of it accompanied by subjective experience at all? Why does red look like something, pain hurt like something, Bach sound like something — why isn’t the whole machine running “in the dark”? Explaining functions, Chalmers argued, still leaves the inner light unexplained.' },
            ],
          },
          {
            heading: 'Your World Is a Controlled Hallucination',
            lines: [
              { id: 'fe6d7f5c-cd90-4cc8-95b0-a756ebf3cfaa', text: 'Meanwhile neuroscience delivered a stranger verdict about the world you seem to inhabit directly. Perception is not a window but a construction: the brain generates a predictive model of reality and corrects it with sensory input. As neuroscientist Anil Seth puts it, we all hallucinate — perception is simply hallucination constrained by the senses.' },
              { id: 'a91c3af6-d875-48f2-bc05-0b39c0076cef', text: 'Consider the blind spot: each eye has a hole in its vision where the optic nerve exits, yet you never see holes — the brain paints over them. Consider color: wavelengths carry no hue; your visual cortex invents it. The seamless movie of your life is an edited production, and the editor never takes a credit.' },
            ],
          },
          {
            heading: 'What This Means (and Doesn’t)',
            lines: [
              { id: '37803edc-6fcd-458a-b2f5-f17700902c7c', text: 'SCIENTIFIC FINDING: perception is substantially predictive and constructive (well-established; see e.g. predictive-processing literature). PHILOSOPHICAL SPECULATION: what this implies about the ultimate nature of mind — materialist, panpsychist, idealist, mysterian — remains genuinely open, and honest thinkers disagree.' },
              { id: '1bb64c61-0d5d-4028-b947-62ea70925765', text: 'SPIRITUAL INTERPRETATION (clearly marked as such): contemplative traditions heard something like this millennia ago — “life is opinion” (Marcus), “mind the forerunner” (Dhammapada), maya as the constructed veil (Vedanta). The resonance is real and thought-provoking; it is not the same as scientific confirmation, and this Library will never blur the two.' },
            ],
          },
        ],
        essence:
          'Your brain doesn’t show you reality — it stages a brilliant, useful simulation of it. And beneath that staging lies the deeper mystery: why there is an experiencer at all. Hold both truths together — the constructed world and the undeniable light of awareness — and you are standing at the threshold every tradition in this room explores.',
        deeper: [
          'Predictive processing (Friston, Clark, Hohwy) is currently the leading framework: the brain as prediction machine minimizing “surprise.” It elegantly explains illusions, dreams (unconstrained prediction), and aspects of psychosis — but critics note it addresses mechanisms of experience, not experience’s existence.',
          'Chalmers’ hard problem has generated major research programs: Global Workspace Theory (Baars, Dehaene), Integrated Information Theory (Tononi), higher-order theories — each with real evidence and real gaps. No consensus exists; beware anyone selling one.',
          'The blind-spot and change-blindness demonstrations are classroom staples because they make construction undeniable in seconds: you literally perceive things (filled-in pattern, stable scene) that are not in the sensory data.',
        ],
        perspectives: [
          { label: 'Materialist', text: 'Experience will ultimately be explained by neural mechanisms; the “hard problem” dissolves with better theory.' },
          { label: 'Mysterian / Dual-aspect', text: 'Experience is irreducible or fundamental (Chalmers, Nagel, Spinoza-influenced views) — science maps its correlates, not its essence.' },
          { label: 'Contemplative', text: 'Direct investigation of awareness itself (meditation, inquiry) is a valid complementary instrument — first-person science with 2,500 years of replication.' },
        ],
        bringToLife: [
          { title: 'The argument replay', text: 'You replay the quarrel as “what happened.” It was your brain’s edited cut. Asking “what did their camera capture?” is predictive-processing as peacemaking.' },
          { title: 'Noticing the editor', text: 'Stare at an illusion (the dress, the spinning dancer) and feel construction happening. That felt wobble is the machinery showing through — wonder, on demand.' },
        ],
        reflection: {
          questions: [
            'If perception is construction, what in your current life might be “painted over blind spot” — assumed rather than seen?',
            'Which stance toward the hard problem attracts you — and what would change it?',
          ],
          exercise: 'The Editor Hunt: find one blind-spot demo online, experience your brain inventing reality, and journal the feeling. Genuine seeing-that-you-don’t-see is the chapter’s whole lesson in ten seconds.',
        },
        connections: [
          { bookId: 'dhammapada', chapterId: 'dhp-1', reason: '“Mind the forerunner” — the 2,300-year-old statement of construction.' },
          { bookId: 'meditations', chapterId: 'med-4', reason: '“Life is opinion” — Stoic predictive processing.' },
        ],
      },
      {
        id: 'cm-2',
        title: 'Attention Is the Potter’s Hand',
        subtitle: 'What you attend to, you become',
        sourceLabel: 'The Luminous Mind · Chapter 2 · Original',
        attribution: 'Original Inner Orbit writing.',
        verses: [
          {
            heading: 'The Spotlight and the Clay',
            lines: [
              { id: '9f71f0cb-c563-4b6f-ab0c-dcb515e26244', text: 'Psychologist William James wrote in 1890 that “my experience is what I agree to attend to” — and that attention sculpts the mind the way a potter shapes clay. Modern neuroscience agrees with embarrassing enthusiasm: attention gates perception, consolidates memory, and through neuroplasticity physically rewires the brain that pays it.' },
              { id: '4e5c2c85-ff42-4325-aafd-e0404f15b2ef', text: 'Inattentional blindness (Simons & Chabris’s invisible gorilla) proves the gate: looking straight at something without attending is functionally blind. Memory research proves the consolidation: unattended experience barely encodes. And contemplative neuroscience (Lazar, Davidson, Brewer) shows long-term meditators with measurably altered attention networks — the potter’s hand, visible on brain scans.' },
            ],
          },
          {
            heading: 'The Ancient Attention Sciences',
            lines: [
              { id: 'f9cbb535-d707-4509-9f6a-ac1cf6063b95', text: 'Every wisdom tradition in this Library is, among other things, an attention technology. Stoic prosochē (vigilant attention to impressions), Buddhist sati (mindfulness) and samadhi (collectedness), Daoist “abysmal stillness” (Tao Te Ching 8), the Jesus Prayer’s and dhikr’s repetitive gathering — different cosmologies, converging instrument: train attention, transform experience.' },
              { id: '18fea22b-37d2-4954-af2c-32c57b825e92', text: 'This convergence is evidence of a kind — cross-cultural replication across millennia — but note its type: first-person and pragmatic (practitioners report similar fruits), not third-person controlled-trial evidence. The modern mindfulness literature supplies the latter, with appropriate modesty: real benefits for stress, attention, and relapse prevention; real hype exceeding the data; research ongoing.' },
            ],
          },
        ],
        essence:
          'Attention is not a spotlight that reveals your world — it is a sculptor that builds it, and rebuilds the brain behind it. Every tradition worth its salt is an attention gym. Train the beam deliberately, or the loudest bidder (outrage, novelty, fear) will aim it for you.',
        deeper: [
          'Key findings, honestly framed: 8-week mindfulness courses (MBSR/MBCT) show moderate effects on stress/anxiety and strong evidence for depression-relapse prevention; brief practices improve focused attention; claims beyond this (compassion transformation, enlightenment-by-app) outrun the data.',
          'Attention’s gate explains the Dhammapada mechanistically: unattended provocations don’t consolidate into grudges; attended breath stabilizes the predictive machine. Ancient instruction, modern mechanism — neither reducible to the other.',
          'The attention economy is applied inattention-science: variable rewards, infinite scroll, and outrage are engineered captures of the potter’s hand. Heedfulness (appamāda) is now a counter-technology.',
        ],
        perspectives: [
          { label: 'Scientific', text: 'Attention training works modestly and measurably; mechanisms increasingly mapped; hype discounted.' },
          { label: 'Contemplative', text: 'Attention is sacred: “where your attention goes, your life goes” — and ultimately, your liberation.' },
          { label: 'Critical', text: 'Mindfulness divorced from ethics becomes calm complicity (“McMindfulness”). The traditions embedded attention in moral training for a reason.' },
        ],
        bringToLife: [
          { title: 'The first-hour rule', text: 'The day’s first attended object sets the clay’s theme. Phone-first shapes one mind; breath-and-intention-first shapes another. Same morning, different potter.' },
          { title: 'Listening as practice', text: 'Full attention on one speaker for five minutes — no rehearsing replies — is samadhi in business casual.' },
        ],
        reflection: {
          questions: [
            'Audit yesterday’s attention: what got the most hours? Did you choose it, or was it captured?',
            'Which attention technology (Stoic, Buddhist, Daoist, other) calls to you — and what is one rep you could do today?',
          ],
          exercise: 'Single-task one routine act daily for a week (tea, commute, dishwashing) with full gathered attention. Log the texture change. This is the laboratory.',
          journeyHook: 'An “Attention Garden” tracker for Your Journey — reps, streaks, and texture notes.',
        },
        livingPage: 'breath-mandala',
        connections: [
          { bookId: 'dhammapada', chapterId: 'dhp-2', reason: 'Heedfulness (appamāda) as the Buddha’s attention doctrine.' },
        ],
      },
    ],
  },
  {
    id: 'varieties-experience',
    title: 'The Varieties of Religious Experience',
    author: 'William James',
    roomId: 'visionary',
    tradition: 'Psychology of religion · Harvard, 1902',
    subjects: ['Psychology', 'Mysticism', 'Philosophy'],
    themes: ['mysticism', 'conversion', 'ineffability', 'pluralism'],
    status: 'selection',
    pagesEstimate: 'Selection · 2 lectures',
    cover: { material: 'leather', base: '#1a2340,#2e3d6b', accent: '#e8c476', motif: 'dream' },
    description:
      'The founding classic of the psychology of religion: James’s Gifford Lectures treating mystical states, conversion, and saintliness as psychological facts worthy of respect. Presented from the 1902 first edition (public domain).',
    edition: {
      edition: 'Longmans, Green & Co., 1902 (first edition)',
      source: 'Public-domain edition; attributed by the prototype to this edition; transcription requires editorial review.',
      rights: 'Public domain in the United States (1902 edition); rights elsewhere require review. Commentary © Inner Orbit (original).',
      contentType: 'public-domain',
      completeness: 'Selection: Lecture XVI–XVII (Mysticism) abridged; “sick soul” passage. Excerpts clearly marked.',
    },
    related: [
      { bookId: 'consciousness-primer', reason: 'The modern science of the states James catalogued.' },
      { bookId: 'tao-te-ching', reason: 'Ineffability East and West: the Tao that cannot be told.' },
    ],
    chapters: [
      {
        id: 'vj-myst',
        title: 'Mysticism — The Four Marks',
        subtitle: 'Ineffable, noetic, transient, passive',
        sourceLabel: 'Varieties · Lectures XVI–XVII, abridged · 1902',
        attribution: 'William James (1902). Public domain. Light abridgment noted with ellipses.',
        verses: [
          {
            heading: 'The Four Marks',
            lines: [
              { id: 'bb0d735c-075b-412e-8211-659f27d3e27e', text: '“...I propose to you four marks which, when an experience has them, may justify us in calling it mystical...”' },
              { id: 'dd3a305a-a2f2-406f-9cc9-5b2fec2f9136', text: '“Ineffability — ...the subject of it immediately says that it defies expression, that no adequate report of its contents can be given in words. It follows from this that its quality must be directly experienced; it cannot be imparted or transferred to others...”' },
              { id: '2948e98a-3941-489e-9608-64b26fe746cd', text: '“Noetic quality — ...mystical states seem to those who experience them to be also states of knowledge. They are states of insight into depths of truth unplumbed by the discursive intellect. They are illuminations, revelations, full of significance and importance, all inarticulate though they remain...”' },
              { id: '6347a581-ab54-48a6-ba81-7f8835cfc146', text: '“Transiency — ...mystical states cannot be sustained for long...”' },
              { id: '710dd850-e30f-4972-ae04-0826220d636f', text: '“Passivity — ...the mystic feels as if his own will were in abeyance, and indeed sometimes as if he were grasped and held by a superior power...”' },
            ],
          },
          {
            heading: 'Fruits, Not Roots',
            lines: [
              { id: '88a955a3-ceea-4b01-8404-adc322494ae4', text: '“...By their fruits ye shall know them, not by their roots... The highest flights of charity, devotion, trust, patience, bravery to which the wings of human nature have spread themselves have been flown for religious ideals.”' },
              { id: 'dcc48631-ae16-4326-a32f-95374cb91e8b', text: 'James’s pragmatist verdict: judge experiences by the lives they produce — “...if the fruits for life... are good, we ought to idealize and venerate them, even though they be a piece of natural psychology...”' },
            ],
          },
        ],
        essence:
          'Mystical experiences share four fingerprints: they cannot be spoken (ineffable), yet feel like knowing (noetic); they pass quickly (transient); and they arrive uncommanded (passive). James’s genius was his test: don’t argue their metaphysics — examine their fruits. Do they make people kinder, braver, more alive? Then honor them, whatever they ultimately are.',
        deeper: [
          'The four marks remain the standard scholarly definition of mysticism (used by Stace, Hood’s Mysticism Scale, and modern psychedelic research) — a 1902 framework still structuring 21st-century laboratories.',
          '“Noetic quality” names mysticism’s central provocation: the experiencer’s certainty of having learned something. Philosophy still wrestles with whether such certainty evidences anything beyond brain states.',
          'James’s “fruits not roots” is pragmatism applied to religion: sidestep unresolvable origin-debates (divine? neural? both?) and evaluate by consequences for character and conduct.',
        ],
        perspectives: [
          { label: 'Psychological', text: 'Mysticism as natural fact: classifiable, measurable, and continuous with ordinary consciousness.' },
          { label: 'Perennialist', text: 'The marks’ cross-cultural recurrence suggests one underlying Reality variously described.' },
          { label: 'Constructivist critique', text: 'Later scholars (Katz) argue experiences are shaped by their traditions — there is no uninterpreted “core.” The debate continues.' },
        ],
        bringToLife: [
          { title: 'Trusting the fruits', text: 'Someone returns from retreat, grief, or wilderness visibly kinder. James says: that transformation is the evidence that matters — honor it without demanding a theory.' },
          { title: 'Your own transiency', text: 'Moments of oceanic peace in music, nature, or love — brief, certain, unspeakable. You have likely tasted all four marks already.' },
        ],
        reflection: {
          questions: [
            'Have you ever known something “all inarticulate” — certain, yet unsayable? Describe the knowing without explaining it.',
            'Apply the fruits-test to your own peak moments: what did they make of you afterward?',
          ],
          exercise: 'Write a 200-word “variety” of your own: one unusual state of consciousness, described with Jamesian neutrality — marks noted, metaphysics suspended, fruits honestly listed.',
        },
        connections: [
          { bookId: 'consciousness-primer', chapterId: 'cm-1', reason: 'What neuroscience now says about the states James described.' },
        ],
      },
      {
        id: 'vj-sick',
        title: 'The Sick Soul & the Divided Self',
        subtitle: 'On melancholy, conversion, and unification',
        sourceLabel: 'Varieties · Lectures VI–IX, abridged · 1902',
        attribution: 'William James (1902). Public domain.',
        verses: [
          {
            heading: 'The Sick Soul',
            lines: [
              { id: '3b1f9486-51d7-4245-8c1e-436c417a997f', text: '“...the sick soul... finds all things hollow... ‘All is vanity’ — the Hebrew Preacher’s verdict — names the conviction exactly.”' },
              { id: '692bccae-2ecf-44bc-a47a-7d7925705fa0', text: '“...Evil is not a surface disorder but an integral part of the universe... The healthy-minded optimism of the hour may paper it over, but the sick soul knows better — and demands a religion that knows it too.” (paraphrase of James’s argument; direct quotes above)' },
              { id: '715c9ff3-f32a-4250-a158-6d92bb673761', text: 'James insists this temperament sees something real: “...the completest religions would... be those in which the pessimistic elements are best developed...” — Buddhism and Christianity foremost, because they take suffering as central rather than accidental.' },
            ],
          },
          {
            heading: 'The Divided Self Made Whole',
            lines: [
              { id: 'be5abdb3-3c48-4e92-a2c2-408437997fa2', text: '“...There are persons whose existence is little more than a series of zigzags... their spirit wars with their flesh...” — the divided self, which conversion (gradual or sudden) may unify.' },
              { id: '0b967c1c-2622-4ff1-a040-f54bd5f288f8', text: '“...To be converted... is for a man to pass from one centre of energy to another — the hot place in consciousness shifts, and what was peripheral becomes central...” (abridged)' },
              { id: '5951d8a3-e133-4ac4-9fd8-322caa52d730', text: 'Whether by crisis or by slow “wilting of the lower desires,” the outcome James honors is the same: a self no longer at war with itself, with energies gathered around a new centre.' },
            ],
          },
        ],
        essence:
          'Some souls are “healthy-minded,” skating over evil; others are “sick souls” who feel the world’s wound as their own — and James sides, tenderly, with the wounded: they see deeper, and they need religions deep enough to meet them. Healing, when it comes, is conversion in the broad sense: the hot centre of energy shifts, the divided self unifies, and life reorganizes around what matters most.',
        deeper: [
          'James’s typology (healthy-minded vs. sick soul, once-born vs. twice-born) drew on his own severe depression — the famous “panic fear” passage is autobiographical. The lectures are self-portraiture disguised as psychology.',
          '“The hot place in consciousness” anticipates modern salience and value-based models of the self: identity as whatever the motivational system currently centers. Conversion is re-centering.',
          'James treats sudden conversion (Paul, Edwards’s converts) and gradual “wilting” as one phenomenon at different speeds — a unification of the divided will that psychology (and AA, which James influenced via Jung) still studies.',
        ],
        perspectives: [
          { label: 'Clinical (modern)', text: 'The “sick soul” maps partly onto depression — treatable, medical, and real. James would welcome treatment AND honor the temperament’s insights.' },
          { label: 'Religious', text: 'Twice-born religion (redemption through crisis) vs. once-born (harmony uninterrupted) — a lasting typology of spiritual paths.' },
          { label: 'Existential', text: 'The divided self as universal: everyone zigzags; unification is everyone’s work, religious or not.' },
        ],
        bringToLife: [
          { title: 'Honoring melancholy', text: 'The friend who “can’t just be positive” may be a sick soul seeing truly. James prescribes depth, not cheer — meet them there.' },
          { title: 'Your conversions', text: 'Becoming a parent, surviving illness, leaving a faith or finding one — each shifted your hot centre. Name your re-centerings; they are your varieties.' },
        ],
        reflection: {
          questions: [
            'Are you, by temperament, once-born or twice-born? What evidence does your history offer?',
            'Where is your “hot place” centred now — and is it where you want it?',
            'What would unification look like for your most divided area?',
          ],
          exercise: 'Map your divided self: two columns (“wars with” / “wars against”), then one paragraph on what a new centre might gather. No fixing required — mapping is the medicine.',
        },
        connections: [
          { bookId: 'ecclesiastes', chapterId: 'eccl-1', reason: 'James quotes Qoheleth directly — the sick soul’s scripture.' },
          { bookId: 'meditations', chapterId: 'med-2', reason: 'Morning preparation as daily micro-conversion toward the chosen centre.' },
        ],
      },
    ],
  },
  {
    id: 'sacred-plants-history',
    title: 'Sacred Plants & Human History — An Educational Survey',
    author: 'Inner Orbit · Original Work',
    roomId: 'visionary',
    tradition: 'Inner Orbit Original · History, anthropology & science',
    subjects: ['History', 'Anthropology', 'Neuroscience'],
    themes: ['entheogens', 'ritual', 'research', 'caution'],
    status: 'selection',
    pagesEstimate: 'Original · 1 chapter (educational)',
    cover: { material: 'papyrus', base: '#1e3a24,#3a6b3a', accent: '#ffe9a8', motif: 'lotus' },
    description:
      'A strictly educational, balanced survey of humanity’s historical relationship with entheogenic plants and fungi — archaeology, anthropology, prohibition, and the modern research renaissance. Non-promotional, harm-aware, and clear that this is information, never encouragement or instruction.',
    edition: {
      edition: 'Inner Orbit Educational Survey v1.0',
      source: 'Standard academic sources; no instructions, dosages, or sourcing content of any kind.',
      rights: '© Inner Orbit (original educational work).',
      contentType: 'original',
      completeness: 'One survey chapter complete. Educational scope only.',
    },
    related: [{ bookId: 'varieties-experience', reason: 'James’s mysticism-marks now structure modern psychedelic research.' }],
    chapters: [
      {
        id: 'sp-1',
        title: 'A Responsible History of Sacred Plants',
        subtitle: 'What scholarship knows — and what caution requires',
        sourceLabel: 'Sacred Plants & Human History · Survey Chapter · Original (educational)',
        attribution: 'Original Inner Orbit educational writing. Informational only — not medical, legal, or personal advice.',
        verses: [
          {
            heading: 'Deep History (Archaeological & Anthropological Record)',
            lines: [
              { id: '6feacb9a-797d-4dbe-a23e-c2d6c84cb1a6', text: 'HISTORICAL ACCOUNT: Human use of psychoactive plants reaches deep into prehistory — from Mesoamerican mushroom imagery to the soma/haoma of Indo-Iranian texts to the kykeon of Eleusis (composition debated; hypotheses only). Indigenous American sacramental traditions (peyote in the Native American Church, ayahuasca in Amazonian lineages) are living religions, not historical curiosities, and deserve the respect — and legal protections — afforded to sincere worship.' },
              { id: '9914d614-b915-4b95-9b7f-0c5402a4f17e', text: 'What archaeology shows is breadth (many cultures, many plants) and context: these substances overwhelmingly appear inside ritual frames — preparation, guidance, song, community, interpretation — never as isolated chemical events. The frame, scholars stress, was half the pharmacology.' },
            ],
          },
          {
            heading: 'Prohibition and the Research Renaissance (20th–21st century)',
            lines: [
              { id: 'aee5298b-60d5-453b-af72-b3c454aeaae0', text: 'HISTORICAL ACCOUNT: The mid-20th century saw enthusiastic psychiatric research (over 1,000 papers, tens of thousands of patients) followed by prohibition amid countercultural turbulence (US Controlled Substances Act 1970; global analogues). Research largely halted for decades.' },
              { id: 'f65bd13b-1be0-4ba0-99e2-0a10bbcf05d5', text: 'SCIENTIFIC FINDING (current, honestly framed): Since the 2000s, regulated trials at major universities have found that supervised psilocybin-assisted therapy shows significant promise for treatment-resistant depression, end-of-life distress, and addiction — with effects correlated to mystical-type experiences (Griffiths, Carhart-Harris, et al.). MDMA-assisted therapy has advanced through Phase 3 trials for PTSD. Crucially: these are supervised medical protocols with screening, preparation, and integration — results do not transfer to unsupervised use, risks (psychological, cardiac, interactional, legal) are real, and research continues.' },
            ],
          },
          {
            heading: 'What This Library Will and Will Not Do',
            lines: [
              { id: '0e01d3c0-f5bc-4fde-8288-9fa783da8df6', text: 'This Library provides history, anthropology, and research literacy — and nothing else. It will never provide instructions for obtaining, preparing, dosing, or using any controlled or psychoactive substance; never encourage use; never minimize risks; and never present spiritual interpretations of such experiences as established fact.' },
              { id: 'a5f00634-d78b-4a08-95c2-2b0439a7d2aa', text: 'Readers drawn to visionary experience are invited toward the room’s lawful, safe contemplative paths — meditation, dreamwork, art, nature, breath — and toward professional care where suffering is concerned. Wonder is abundant; it does not require pharmacology. If you or someone you love struggles with substance use, please contact local health services or crisis lines.' },
            ],
          },
        ],
        essence:
          'Humans have long met psychoactive plants inside sacred ritual frames; the 20th century prohibited them; the 21st is carefully re-studying them in medical settings with promising but preliminary results. This Library teaches that history with respect and rigor — offering understanding, never encouragement, and pointing always toward safe, lawful paths of inner exploration.',
        deeper: [
          'The “set and setting” principle (Leary, refined by Zinberg) is the field’s most robust finding: outcomes depend enormously on mindset, environment, and guidance — which is why ritual frames and clinical protocols, not molecules alone, structure both traditional and modern use.',
          'Legal status varies sharply by jurisdiction and changes over time; nothing here constitutes legal advice. Religious exemptions (e.g., NAC peyote use, ayahuasca decisions in some countries) are narrow, litigated, and specific.',
          'Indigenous reciprocity is an emerging ethical norm: traditions that stewarded these medicines merit respect, benefit-sharing, and protection from appropriation — scholarship increasingly centers indigenous voices over colonial collecting.',
        ],
        perspectives: [
          { label: 'Scientific', text: 'Promising clinical signals under supervision; mechanisms (DMN modulation, plasticity, mystical-type experience) under active study; unsupervised use an entirely different risk profile.' },
          { label: 'Anthropological', text: 'Sacramental use as religion: meaning, community, and cosmology — not “drug use” in the recreational sense.' },
          { label: 'Spiritual (interpretive, marked)', text: 'Some traditions interpret visionary states as genuine perception of deeper reality; others (including many Buddhist lineages) treat them as side-effects to note and release. The Library presents both without endorsing either.' },
        ],
        bringToLife: [
          { title: 'Reading the headlines', text: '“Psychedelics cure depression” overstates trial data; “dangerous drugs with no value” ignores it. The educated stance: supervised promise, real risk, research ongoing.' },
          { title: 'Respecting lineages', text: 'Encountering ayahuasca tourism or “shamanic” branding? Ask who benefits, who is centered, and what reciprocity flows back to source communities.' },
        ],
        reflection: {
          questions: [
            'What drew you to this chapter — curiosity, suffering, wonder? Which lawful path in this Library might serve that need?',
            'How do you distinguish, in your own reading, scientific findings from spiritual interpretations from hype?',
          ],
          exercise: 'Media-literacy practice: find one sensational headline on this topic and rewrite it in this chapter’s three-voice style (finding / history / interpretation). Notice how much changes.',
        },
        connections: [
          { bookId: 'consciousness-primer', chapterId: 'cm-1', reason: 'The neuroscience of constructed perception behind visionary states.' },
          { bookId: 'varieties-experience', chapterId: 'vj-myst', reason: 'James’s four marks — now the standard measure in psychedelic research.' },
        ],
      },
    ],
  },
  {
    id: 'inner-cinema-dreams',
    title: 'The Inner Cinema — Dreams & the Night Mind',
    author: 'Inner Orbit · Original Work (forthcoming)',
    roomId: 'visionary',
    tradition: 'Inner Orbit Original · Psychology & contemplative practice',
    subjects: ['Dreams', 'Psychology', 'Practice'],
    themes: ['dreams', 'sleep', 'symbols'],
    status: 'forthcoming',
    pagesEstimate: 'Awaiting content',
    cover: { material: 'crystal', base: '#0f1e3a,#2e4a7a', accent: '#b8d4ff', motif: 'dream', gem: '#b8d4ff' },
    description:
      'Sleep science, dream history (Artemidorus to Aserinsky), lucid-dreaming research, and contemplative dream practices — with dream-journaling tools designed for Your Journey integration.',
    edition: {
      edition: 'In composition',
      source: 'Original work in preparation.',
      rights: '© Inner Orbit (forthcoming).',
      contentType: 'forthcoming',
      completeness: 'Forthcoming — no readable content yet.',
    },
    related: [{ bookId: 'consciousness-primer', reason: 'Dreams as the predictive brain, unconstrained.' }],
    chapters: [],
  },
  {
    id: 'doors-reference',
    title: 'The Doors of Perception — A Reader’s Guide (Reference Entry)',
    author: 'About Aldous Huxley (1954) — guide only, no excerpts',
    roomId: 'visionary',
    tradition: 'Reference entry · Modern classic (copyrighted)',
    subjects: ['Reference', 'Consciousness'],
    themes: ['perception', 'reference'],
    status: 'forthcoming',
    pagesEstimate: 'Reference only',
    cover: { material: 'leather', base: '#3a2a0f,#6b5223', accent: '#ffe9a8', motif: 'eye' },
    description:
      'Huxley’s 1954 account of mescaline experience remains under copyright and will never be reproduced here. This forthcoming entry will offer only a lawful reader’s guide: context, themes, and critical perspectives.',
    edition: {
      edition: 'Reference entry in preparation — no copyrighted text will ever appear',
      source: 'Guide only.',
      rights: 'The underlying work is copyrighted; this Library respects that fully.',
      contentType: 'forthcoming',
      completeness: 'Reference entry forthcoming. No excerpts — ever.',
    },
    related: [{ bookId: 'sacred-plants-history', reason: 'The responsible historical frame for Huxley’s era.' }],
    chapters: [],
  },
];
