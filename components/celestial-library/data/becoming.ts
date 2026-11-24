import type { Book } from './types';

export const becomingBooks: Book[] = [
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    roomId: 'becoming',
    tradition: 'Stoicism · Rome, c. 170–180 CE',
    subjects: ['Stoicism', 'Philosophy', 'Resilience'],
    themes: ['acceptance', 'duty', 'impermanence', 'mind', 'purpose'],
    status: 'selection',
    featured: true,
    pagesEstimate: 'Selection · 3 readings',
    cover: { material: 'stone', base: '#2b2b33,#4a4a55', accent: '#e8c476', motif: 'stoic', gem: '#cfd4ff' },
    description:
      'The private notebook of a Roman emperor at war — never meant for publication, never flinching. Stoic philosophy as a daily practice of perception, action, and will. Presented in George Long’s 1862 translation (public domain).',
    edition: {
      translator: 'George Long (1800–1879)',
      edition: 'The Meditations of Marcus Aurelius Antoninus (1862)',
      source: 'Public-domain edition; attributed by the prototype to this edition; transcription requires editorial review.',
      rights: 'Public domain in the United States; rights elsewhere require jurisdictional review. Commentary © Inner Orbit (original).',
      contentType: 'public-domain',
      completeness: 'Curated selection from Books II and IV. Excerpts clearly marked.',
    },
    related: [
      { bookId: 'enchiridion', reason: 'The emperor and the freed slave: two voices, one Stoa.' },
      { bookId: 'bhagavad-gita', reason: 'Two warriors on duty — detached action East and West.' },
      { bookId: 'millennial-tao', reason: 'Stoic acceptance and Daoist flow as twin tools for modern pressure.' },
    ],
    chapters: [
      {
        id: 'med-2',
        title: 'Book II — The Morning Preparation',
        subtitle: 'Meeting the day as it is',
        sourceLabel: 'Meditations · Book II, opening · Long (1862)',
        attribution: 'Translated by George Long. Public domain.',
        verses: [
          {
            lines: [
              { id: '90082c04-9c63-44d8-b7b9-b442a90c2b1a', text: 'Begin the morning by saying to thyself, I shall meet with the busy-body, the ungrateful, arrogant, deceitful, envious, unsocial.' },
              { id: '5767fb10-a315-4477-b3ad-b20c93294fa1', text: 'All these things happen to them by reason of their ignorance of what is good and evil.' },
              { id: '0faa5be9-6c94-4a92-bbf7-0984d59b81ed', text: 'But I who have seen the nature of the good that it is beautiful, and of the bad that it is ugly, and the nature of him who does wrong, that it is akin to me —' },
              { id: 'fb2e693e-d1e9-42c5-9b32-d664a02dfbf8', text: 'not only of the same blood or seed, but that it participates in the same intelligence and the same portion of the divinity —' },
              { id: '6a689b65-88d5-4f80-a731-3f1699ff4c6f', text: 'I can neither be injured by any of them, for no one can fix on me what is ugly, nor can I be angry with my kinsman, nor hate him.' },
              { id: 'b0957737-d0d8-48c8-a269-29be4e9cf4fc', text: 'For we are made for co-operation, like feet, like hands, like eyelids, like the rows of the upper and lower teeth.' },
              { id: '5d548248-f89c-4060-91fb-f53324522a85', text: 'To act against one another then is contrary to nature; and it is acting against one another to be vexed and to turn away.' },
            ],
          },
        ],
        essence:
          'Before the world disappoints you, decide in advance that it will — and that none of it can touch your true good. Difficult people act from ignorance, not malice; they are your kin, and you were made to work with them like hands with feet. Offense becomes impossible once expectation becomes honest.',
        deeper: [
          'This is the premeditatio malorum — the “pre-meditation of troubles” — a core Stoic exercise: rehearse the day’s frictions in advance so they arrive as expected weather, not personal attacks.',
          '“No one can fix on me what is ugly” states the Stoic doctrine of the inner citadel: your character is the only good truly yours, and no insult can alter it without your consent.',
          'The body imagery (feet, hands, eyelids, teeth) renders the Stoic doctrine of oikeiosis — natural affiliation. To hate a fellow human is as absurd as the teeth biting each other.',
        ],
        perspectives: [
          { label: 'Therapeutic', text: 'Cognitive reframing avant la lettre: change the appraisal (“ignorance, not malice”) and the anger dissolves.' },
          { label: 'Ethical', text: 'A universal kinship ethic — striking from an absolute monarch who could have chosen contempt.' },
          { label: 'Political', text: 'Written by an emperor on campaign: leadership as practiced patience with the ungrateful and arrogant.' },
        ],
        bringToLife: [
          { title: 'The inbox meditation', text: 'Before opening email, recite your version: “I shall meet with the terse, the demanding, the passive-aggressive…” Watch how pre-acceptance defuses the sting.' },
          { title: 'Family gatherings', text: 'The uncle who provokes, the sibling who competes — arrive having already granted them their ignorance, and keep your eyelids’ cooperation with your eyes.' },
        ],
        reflection: {
          questions: [
            'Who are your “busy-bodies and ungrateful” — and what ignorance (fear? pain? habit?) might actually drive them?',
            'What would change if you truly believed no one could “fix on you what is ugly”?',
          ],
          exercise: 'Write tomorrow’s morning preparation tonight: name three frictions you will likely meet and the kinship-response you choose. Read it before your phone.',
          journeyHook: 'A “Morning Stoa” ritual for Your Journey — streakable daily preparation.',
        },
        connections: [
          { bookId: 'dhammapada', chapterId: 'dhp-1', reason: '“Hatred ceases by love” and “made for co-operation” — one ethic, two rivers.' },
        ],
      },
      {
        id: 'med-4',
        title: 'Book IV — The Soul Dyed by Thought',
        subtitle: 'Retreat into yourself',
        sourceLabel: 'Meditations · Book IV (selections) · Long (1862)',
        attribution: 'Translated by George Long. Public domain.',
        verses: [
          {
            heading: 'The Country Retreat Within',
            lines: [
              { id: 'c9513334-54cd-482a-a042-f53ed18fada7', text: 'Men seek retreats for themselves, houses in the country, sea-shores, and mountains; and thou too art wont to desire such things very much.' },
              { id: '58d6d901-1fe0-4f4f-b5b8-5643a63a96c2', text: 'But this is altogether a mark of the most common sort of men, for it is in thy power whenever thou shalt choose to retire into thyself.' },
              { id: 'b08255f4-d9ee-48a5-8e28-14f26908a6e6', text: 'For nowhere either with more quiet or more freedom from trouble does a man retire than into his own soul.' },
            ],
          },
          {
            heading: 'The Dye of Thought',
            lines: [
              { id: '523210ef-c672-4290-babc-9b5ebcc50e4f', text: 'The universe is transformation: life is opinion.' },
              { id: '79af5b1b-085c-4f67-aeec-b45ba18ec32b', text: 'If thou art pained by any external thing, it is not this thing that disturbs thee, but thy own judgment about it. And it is in thy power to wipe out this judgment now.' },
              { id: '09c01aad-c193-4c77-9d83-49d957858346', text: 'The soul becomes dyed with the color of its thoughts.' },
              { id: '28b7f2a7-bc98-4ef1-96b4-17ccad598e89', text: 'Constantly then give to thyself this retreat, and renew thyself.' },
            ],
          },
          {
            heading: 'The Present Moment',
            lines: [
              { id: '2197e3f6-41e2-4b7e-a12d-d54a7f8a1b09', text: 'He who lives in harmony with himself lives in harmony with the universe.' },
              { id: 'fec551bd-eee7-48e8-b8c4-c1c66651b92d', text: 'Remember that man lives only in the present, in this fleeting instant: all the rest of his life is either past and gone, or not yet revealed.' },
              { id: 'b2f61263-ca1e-46a8-ae54-7055dda3dc2d', text: 'Short then is the time which every man lives, and small the nook of the earth where he lives.' },
            ],
          },
        ],
        essence:
          'Stop searching for peace in places — the quietest retreat is the one you carry. Your pain comes not from events but from your judgments about them, and judgments can be wiped away like writing from a wax tablet. Your soul takes the color of whatever you repeatedly think; choose the dye, and keep returning to the present, which is the only time you ever actually live.',
        deeper: [
          '“Life is opinion” (hypolēpsis) is the epistemological core of Stoicism: between event and emotion stands assent — and assent is yours.',
          'The “retreat into thyself” was written on the Danube frontier, amid war and plague. Its credibility comes from its address: not a monastery but a military tent.',
          '“Short the time… small the nook” is the View from Above in miniature — cosmic perspective as therapy for rumination.',
        ],
        perspectives: [
          { label: 'Cognitive', text: 'The founding text of what became cognitive-behavioral therapy: disturb yourself with judgments, heal yourself by revising them.' },
          { label: 'Contemplative', text: 'A Western parallel to Buddhist mindfulness: return to the present, observe judgments, renew.' },
          { label: 'Existential', text: 'Radical responsibility: if life is opinion, then your inner life is your own craftsmanship — no excuses remain.' },
        ],
        bringToLife: [
          { title: 'The delayed train', text: 'The delay is external; the fury is judgment. Wipe it: “I am delayed; I will read.” Same platform, different soul-color.' },
          { title: 'Sunday dread', text: 'The weekend is present; the dread is opinion about Monday. Return to the nook of now.' },
        ],
        reflection: {
          questions: [
            'What “external thing” is paining you most right now? Write the event in one sentence, then your judgment about it in another. Can you wipe the second?',
            'What color is your soul being dyed this month — and is it the color you would choose?',
          ],
          exercise: 'Take a 60-second inner retreat: close your eyes, release one judgment deliberately, and notice what remains. That remainder is the citadel.',
          journeyHook: '“Inner Retreat” micro-practice — one minute, three times daily.',
        },
        livingPage: 'stoic-dichotomy',
        connections: [
          { bookId: 'dhammapada', chapterId: 'dhp-1', reason: 'The dyed soul and the forerunning mind — identical diagnosis, twin prescriptions.' },
          { bookId: 'consciousness-primer', reason: 'Modern psychology on appraisal, attention, and the constructed mind.' },
        ],
      },
      {
        id: 'med-5',
        title: 'Book V — The Work of a Human Being',
        subtitle: 'Rise to the common good',
        sourceLabel: 'Meditations · Book V, opening (selection) · Long (1862)',
        attribution: 'Translated by George Long. Public domain.',
        verses: [
          {
            lines: [
              { id: '8cd13762-8b1e-4341-96b8-d82c01f56abe', text: 'In the morning when thou risest unwillingly, let this thought be present — I am rising to the work of a human being.' },
              { id: '3207992b-a9da-45fc-aa5b-38246ab25a2d', text: 'Why then am I dissatisfied if I am doing the things for which I exist and for which I was brought into the world?' },
              { id: '71a58fc6-5bcf-4348-8881-98a008522034', text: 'Or have I been made for this, to lie in the bed-clothes and keep myself warm?' },
              { id: '5fa189df-d8fe-47c5-972c-a88d01e88a70', text: 'But this is more pleasing. Dost thou exist then to take thy pleasure, and not at all for action or exertion?' },
              { id: '6a339ef4-ff7c-4318-bc64-13a4c4ac11cc', text: 'Dost thou not see the little plants, the little birds, the ants, the spiders, the bees working together to put in order their several parts of the universe?' },
              { id: 'fac17b7a-de79-4b55-a453-0441f8f1c8a6', text: 'And art thou unwilling to do the work of a human being, and dost thou not make haste to do that which is according to thy nature?' },
            ],
          },
        ],
        essence:
          'When the bed holds you, remember what you are for. Every creature rises to its work — ants, bees, birds — and yours is the work of a rational, social being: to act for the common good. Pleasure is a side-effect of nature, never its purpose. Get up; the universe has assigned you a part.',
        deeper: [
          'The passage defines human nature functionally: a human is for rational, prosocial action as the eye is for seeing. “According to thy nature” is Stoicism’s entire ethic in one phrase.',
          'Note the gentleness beneath the sternness — Marcus writes to himself, not to shame but to rally. Self-address (“thou”) is the Meditations’ characteristic tenderness.',
          'The catalogue of nature (plants, birds, ants, spiders, bees) invokes the Stoic cosmopolis: all beings as fellow-workers in one ordered whole.',
        ],
        perspectives: [
          { label: 'Motivational', text: 'Antiquity’s great alarm clock — purpose as the antidote to comfort.' },
          { label: 'Ecological', text: 'Humanity as one working part among many: duty to the whole, not dominion over it.' },
          { label: 'Gentle critique (modern)', text: 'Readers with depression or burnout should hear the rallying tone as aspirational, not condemning — Marcus also counsels rest “according to nature.”' },
        ],
        bringToLife: [
          { title: 'The snooze debate', text: 'Tomorrow’s argument with the alarm is this passage in miniature. Try Marcus’s line verbatim: “I am rising to the work of a human being.”' },
          { title: 'Meaning at work', text: 'Boring tasks transform when framed as parts of the whole — the ant does not find the crumb meaningless.' },
        ],
        reflection: {
          questions: [
            'What is “the work of a human being” for you, concretely, this week?',
            'Where does comfort currently outvote nature in your mornings?',
          ],
          exercise: 'Place Marcus’s opening line by your bed tonight. Tomorrow, rise on the first alarm as an experiment in nature — and note the day’s texture.',
        },
        connections: [
          { bookId: 'bhagavad-gita', chapterId: 'gita-2', reason: 'Rise and act without clinging to fruits — emperor and archer agree.' },
        ],
      },
    ],
  },
  {
    id: 'enchiridion',
    title: 'Enchiridion',
    author: 'Epictetus (compiled by Arrian)',
    roomId: 'becoming',
    tradition: 'Stoicism · Nicopolis, c. 125 CE',
    subjects: ['Stoicism', 'Philosophy', 'Freedom'],
    themes: ['control', 'freedom', 'judgment', 'resilience'],
    status: 'selection',
    pagesEstimate: 'Selection · 2 readings',
    cover: { material: 'leather', base: '#3a2415,#6b4423', accent: '#e8c476', motif: 'stoic' },
    description:
      'The “handbook” of a freed slave who taught emperors: fifty-three short chapters that draw one bright line — between what is yours and what is not — and show how freedom lives entirely on your side of it. Presented in Elizabeth Carter’s 1758 translation (public domain).',
    edition: {
      translator: 'Elizabeth Carter (1717–1806)',
      edition: 'All the Works of Epictetus (1758)',
      source: 'Public-domain edition; attributed by the prototype to this edition; transcription requires editorial review.',
      rights: 'Public domain in the United States; rights elsewhere require jurisdictional review. Commentary © Inner Orbit (original).',
      contentType: 'public-domain',
      completeness: 'Selection: Chapters 1, 5, 8. Excerpts clearly marked.',
    },
    related: [
      { bookId: 'meditations', reason: 'The handbook and the journal: study Epictetus, then watch Marcus practice him.' },
      { bookId: 'dhammapada', reason: '“Men are disturbed not by things, but by opinions” — beside the Buddha on intention.' },
    ],
    chapters: [
      {
        id: 'ench-1',
        title: 'Of Things in Our Power',
        subtitle: 'The dichotomy of control',
        sourceLabel: 'Enchiridion · Chapters 1–2 (selection) · Carter (1758)',
        attribution: 'Translated by Elizabeth Carter. Public domain.',
        verses: [
          {
            lines: [
              { id: '388c5277-2a2f-481a-88fa-e22616f1a44b', text: 'Of things, some are in our power, and others are not.' },
              { id: '44e3e974-1942-4bf7-b925-46644fc9296b', text: 'In our power are opinion, pursuit, desire, aversion — and, in one word, whatever are our own actions.' },
              { id: '7747b889-88dd-40b7-bd9f-bfe34f6b693f', text: 'Not in our power are body, property, reputation, command, and, in one word, whatever are not our own actions.' },
              { id: 'f53cf7b3-c2e0-4de8-a92b-471b4780a267', text: 'And the things in our power are by nature free, unrestrained, unhindered; but those not in our power are weak, slavish, restrained, belonging to others.' },
              { id: '0a9625fe-c09f-4c04-a421-498c5fa18d35', text: 'Remember then, that if you suppose things by nature slavish to be free, and what belongs to others to be your own, you will be hindered, you will lament, you will be disturbed, you will find fault both with gods and men.' },
              { id: 'c698355b-0784-41be-b6e3-4b15bd3de89e', text: 'But if you suppose that only to be your own which is your own, and what belongs to others such as it really is, then no one will ever compel you, no one will restrain you, you will find fault with no one, you will accuse no one, you will do no one thing against your will, you will have no enemy, and no one will harm you — for no harm can happen to you.' },
            ],
          },
        ],
        essence:
          'Everything you suffer can be sorted into two baskets: yours (judgments, intentions, responses) and not yours (bodies, outcomes, reputations, events). Freedom is simply the discipline of wanting only from your own basket. Confuse the baskets and you enslave yourself; keep them straight and no one can ever compel you.',
        deeper: [
          'This opening is the most influential paragraph in Stoicism — the “dichotomy of control” that shaped everyone from Marcus to modern cognitive therapy to the Serenity Prayer.',
          'Note the radical claim: your body is “not in your power.” Epictetus means it is not fully yours to command — illness and accident prove it. Only your use of impressions is unconditionally free.',
          '“You will have no enemy” follows logically: enemies require that another can harm your true good — which, on this account, they cannot.',
        ],
        perspectives: [
          { label: 'Liberating', text: 'A total theory of freedom available even to a slave — as Epictetus himself had been.' },
          { label: 'Challenging', text: 'Critics ask: is the dichotomy too sharp? Modern Stoics often add a third basket — things we can influence but not control.' },
          { label: 'Therapeutic', text: 'The direct ancestor of CBT’s focus on appraisals and of acceptance-based approaches to anxiety.' },
        ],
        bringToLife: [
          { title: 'The performance review', text: 'Your preparation: yours. Their mood, the budget, the rating: not yours. Excellence in the first basket; equanimity toward the second.' },
          { title: 'Health anxiety', text: 'Your habits: yours. The outcome: not entirely. The dichotomy prescribes full care with zero demanded guarantees.' },
        ],
        reflection: {
          questions: [
            'Write your current biggest worry. Draw the line: which parts are opinion, pursuit, desire, aversion — and which belong to others?',
            'Where have you been supposing “what belongs to others to be your own”?',
          ],
          exercise: 'The two-basket journal: each evening for a week, sort the day’s events into “mine” and “not mine.” Watch the second basket lose its power.',
          journeyHook: '“Two Baskets” evening review for Your Journey.',
        },
        livingPage: 'stoic-dichotomy',
        connections: [
          { bookId: 'bhagavad-gita', chapterId: 'gita-2', reason: 'Yours: the work. Not yours: the fruit. Same line, drawn in Sanskrit.' },
        ],
      },
      {
        id: 'ench-2',
        title: 'Disturbed by Opinions',
        subtitle: 'Demand that events be as they are',
        sourceLabel: 'Enchiridion · Chapters 5, 8 (selection) · Carter (1758)',
        attribution: 'Translated by Elizabeth Carter. Public domain.',
        verses: [
          {
            heading: 'It Is Opinions That Disturb Us',
            lines: [
              { id: '63ad29a7-1735-41b1-a2d9-b5a10192fd6d', text: 'Men are disturbed, not by things, but by the principles and notions which they form concerning things.' },
              { id: '21d94540-63d1-4e0c-ad6c-ba5c037b1d47', text: 'Death, for instance, is not terrible, else it would have appeared so to Socrates. But the terror consists in our notion of death, that it is terrible.' },
              { id: 'e76f73c7-82d7-4e54-95a8-e5fba315820b', text: 'When therefore we are hindered, or disturbed, or grieved, let us never ascribe it to others, but to ourselves — that is, to our own principles.' },
            ],
          },
          {
            heading: 'Demand Not That Events Happen as You Wish',
            lines: [
              { id: '41693a75-5336-417b-bac8-18e04c21f3e7', text: 'Demand not that events should happen as you wish; but wish them to happen as they do happen, and you will go on well.' },
              { id: 'f1abe36d-2e85-4658-930d-5377c0298c8d', text: 'Sickness is a hindrance to the body, but not to the will, unless the will itself pleases.' },
              { id: 'e652dec9-00cc-4859-bb3d-5a423aaff2d1', text: 'Lameness is a hindrance to the leg, but not to the will. And say this to yourself at everything that happens — for you will find it a hindrance to something else, but not to yourself.' },
            ],
          },
        ],
        essence:
          'Nothing outside you disturbs you — only your notions about it. Death frightened no one until a notion called it terrible; the obstacle blocks your plan but never your will, unless you let it. So reverse the demand: stop insisting events match your wishes, and train your wishes to match events. That reversal is serenity.',
        deeper: [
          'Chapter 5 is the locus classicus of cognitive mediation — the claim that emotion follows interpretation. Socrates’ calm death is Exhibit A: same event, different notion, different experience.',
          'Chapter 8’s amor fati (“wish events to happen as they do”) predates Nietzsche’s famous phrase by 1,750 years — and goes further, making it a daily exercise rather than a heroic ideal.',
          'The body/will distinction is precise: sickness hinders the body (an external) but the will (prohairesis) remains free to respond well — Epictetus, himself lame, wrote from inside this truth.',
        ],
        perspectives: [
          { label: 'Empowering', text: 'Your will is unhinderable — the one fortress no circumstance can storm.' },
          { label: 'Pastoral caution', text: 'This consoles the sufferer who can act; it must never be used to blame victims or dismiss real harm. Epictetus comforts, never accuses.' },
          { label: 'Modern', text: 'The Serenity Prayer (“accept the things I cannot change…”) is this chapter in liturgical dress.' },
        ],
        bringToLife: [
          { title: 'The cancelled flight', text: 'The cancellation hinders the itinerary, not the will. The will can read, rebook, rest — “and you will go on well.”' },
          { title: 'Criticism', text: 'The words are sounds; the wound is your notion (“this means I am worthless”). Examine the notion and the words shrink to size.' },
        ],
        reflection: {
          questions: [
            'What event are you demanding be otherwise? State it plainly — then practice wishing it as it is, for one minute.',
            'Whose death-like “terrible” in your life might actually be a notion, Socrates-style?',
          ],
          exercise: 'At the next hindrance today, pause and say: “This hinders X, but not my will.” Then choose the will’s response deliberately.',
        },
        connections: [
          { bookId: 'meditations', chapterId: 'med-4', reason: '“Wipe out this judgment now” — Marcus practicing Epictetus’s Chapter 5.' },
        ],
      },
    ],
  },
  {
    id: 'seneca-letters',
    title: 'Letters to Lucilius',
    author: 'Seneca the Younger',
    roomId: 'becoming',
    tradition: 'Stoicism · Rome, c. 63–65 CE',
    subjects: ['Stoicism', 'Philosophy', 'Time'],
    themes: ['time', 'friendship', 'death', 'simplicity'],
    status: 'forthcoming',
    pagesEstimate: 'Awaiting content',
    cover: { material: 'papyrus', base: '#4a2c10,#7a5a2e', accent: '#f7dd9a', motif: 'scroll' },
    description:
      '124 letters on time, friendship, and the art of dying well — including the immortal “On the Shortness of Life.” A Gummere (1917–25, public domain) selection is being prepared.',
    edition: {
      translator: 'Richard M. Gummere (in preparation)',
      edition: 'Loeb Classical Library vols. 75–77 — verification in progress',
      source: 'To be attributed by the prototype to this edition; transcription requires editorial reviews.',
      rights: 'Public domain (pending verification).',
      contentType: 'forthcoming',
      completeness: 'Forthcoming — no readable content yet.',
    },
    related: [{ bookId: 'meditations', reason: 'Seneca taught the tradition Marcus embodied.' }],
    chapters: [],
  },
  {
    id: 'art-of-beginning',
    title: 'The Art of Beginning',
    author: 'Inner Orbit · Original Work',
    roomId: 'becoming',
    tradition: 'Inner Orbit Original · Practical philosophy',
    subjects: ['Creativity', 'Practice', 'Courage'],
    themes: ['beginning', 'practice', 'courage', 'craft'],
    status: 'forthcoming',
    pagesEstimate: 'Awaiting content',
    cover: { material: 'leather', base: '#123a2a,#1e6b4a', accent: '#ffe9a8', motif: 'tree', gem: '#8dffb0' },
    description:
      'An original Inner Orbit manual on starting — the blank page, the first step, the imperfect launch. Prototypes of Stoic-Daoist practice adapted for makers, seekers, and late bloomers. In composition.',
    edition: {
      edition: 'Inner Orbit Original — first edition in composition',
      source: 'Written for the Celestial Library.',
      rights: '© Inner Orbit (original work).',
      contentType: 'forthcoming',
      completeness: 'Forthcoming — first chapters in draft.',
    },
    related: [{ bookId: 'millennial-tao', reason: 'Beginning as wu wei: start soft, start small, start now.' }],
    chapters: [],
  },
];
