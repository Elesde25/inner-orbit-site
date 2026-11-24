/**
 * Cosmic Portrait · houses, aspect pairs and synthesis material.
 * Symbolic interpretation only — no calculation happens in this file.
 */

export const ORDINAL = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"];

/** the area of life each house describes, phrased to drop into a sentence */
export const HOUSE_ARENA: string[] = [
  "how you present yourself and start things",
  "money, possessions, skills and your sense of self-worth",
  "everyday communication, learning, siblings and your immediate surroundings",
  "home, family, roots and your private foundations",
  "creativity, romance, play and self-expression for its own sake",
  "daily routines, work habits, health and being useful",
  "committed partnerships and one-to-one relationships",
  "intimacy, shared resources, vulnerability and deep change",
  "travel, higher learning, belief and the search for meaning",
  "career, public reputation and long-term direction",
  "friendships, communities and the future you hope for",
  "solitude, rest, the unconscious and work behind the scenes",
];

export const HOUSE_SHORT: string[] = [
  "self and presence", "resources and worth", "learning and exchange", "home and roots", "creativity and joy", "work and wellbeing",
  "partnership", "depth and intimacy", "meaning and horizons", "calling and visibility", "friends and aspirations", "rest and the unseen",
];

export const SUN_BY_HOUSE: string[] = [
  "With the Sun in your first house — the house of presence — your identity is highly visible; what you are and how you appear tend to be closely aligned, and people often notice you before you have said anything.",
  "With the Sun in your second house, your sense of identity is wrapped up in what you earn, make and value; building something tangible, and learning what you are worth, is part of how you become yourself.",
  "With the Sun in your third house, your identity is expressed through communication, learning and your immediate community; you tend to shine when you are explaining, writing, teaching or connecting the people nearby.",
  "With the Sun in your fourth house, your identity is anchored in home, family and roots; your sense of self may be strongest in private, and what you build at home may matter to you more than public recognition.",
  "With the Sun in your fifth house, your identity is tied to creativity, romance and play; you tend to feel most like yourself when expressing something personal and enjoying it.",
  "With the Sun in your sixth house, your identity is tied to work, service and daily craft; purpose often comes from being useful and from caring about the details of how things run.",
  "With the Sun in your seventh house, your identity develops through partnership; you tend to learn who you are in relation to significant others, and committed one-to-one bonds are central to your sense of purpose.",
  "With the Sun in your eighth house, your identity is shaped by depth, intimacy and transformation; you may be drawn to what lies beneath the surface and to experiences that change you at a fundamental level.",
  "With the Sun in your ninth house, your identity is tied to exploration, belief and learning; purpose often comes through expanding your world — by travel, study or a guiding philosophy.",
  "With the Sun in your tenth house, your identity is closely linked to career and public role; you may feel a strong pull toward visible achievement, and be recognized for what you do.",
  "With the Sun in your eleventh house, your identity is shaped through friendship, community and shared ideals; you tend to feel most like yourself when working with a group toward something you believe in.",
  "With the Sun in your twelfth house, your identity is quieter and more inward; you may shine most in solitude, in imaginative or service-oriented work, or behind the scenes, and may take time to feel fully visible.",
];

export const MOON_BY_HOUSE: string[] = [
  "With the Moon in your first house, your feelings sit close to the surface and are visible to others; your emotional state tends to color how you present yourself.",
  "With the Moon in your second house, emotional security is connected to material stability, your body and your sense of self-worth; comfort comes through having enough and through tangible routines.",
  "With the Moon in your third house, your feelings find expression in words; talking, writing and staying in touch with siblings, neighbors or close contacts feeds you emotionally.",
  "With the Moon in your fourth house — its natural home — your emotional world is tied to family, home and roots; you may feel the pull of your past strongly and need a real retreat.",
  "With the Moon in your fifth house, your emotions flow into creativity, romance and play; you tend to need joy and self-expression to feel emotionally alive.",
  "With the Moon in your sixth house, your emotional wellbeing is tied to daily routine, health and work; being useful soothes you, and so can small rituals.",
  "With the Moon in your seventh house, your emotional security is tied to close partnership; you tend to feel most settled when you have a trusted person to share your inner life with.",
  "With the Moon in your eighth house, your emotions run deep and may be intense; you may be strongly affected by intimacy, loss and shared vulnerabilities.",
  "With the Moon in your ninth house, your emotional wellbeing is nourished by exploration, belief and learning; a sense of meaning is part of feeling safe.",
  "With the Moon in your tenth house, your emotions are tied to your public role; you may feel a need to be recognized and to care for others through your work.",
  "With the Moon in your eleventh house, your emotional life is nourished through friendship and community; belonging to a group of kindred spirits is soothing.",
  "With the Moon in your twelfth house, your emotional world is private and sometimes hard to put into words; solitude and quiet are essential, and your sensitivity may run deeper than others realize.",
];

/** two phrasings per planet so repeated house sentences never read identically */
export const HOUSE_FRAME: Record<string, [string, string]> = {
  mercury: [
    "With Mercury in your {ord} house, your attention and conversation tend to gather around {arena}; this is where you collect information and make up your mind.",
    "Mercury’s placement in your {ord} house points your curiosity toward {arena}, which is likely where you do much of your thinking and talking.",
  ],
  venus: [
    "Venus in your {ord} house directs your affection and appreciation toward {arena}; that is where you look for harmony, enjoyment and reasons to care.",
    "With Venus in your {ord} house, you tend to seek pleasure and connection in matters of {arena}, and that is where your sense of what is beautiful gets exercised.",
  ],
  mars: [
    "Mars in your {ord} house sends your energy into {arena}; this is where you are most likely to push, compete and assert yourself.",
    "With Mars in your {ord} house, your drive tends to show up in matters of {arena} — and friction, if it arises there, is likely to feel most personal.",
  ],
  jupiter: [
    "Jupiter in your {ord} house points your optimism toward {arena}; it is often where opportunity and generosity seem to appear.",
    "With Jupiter in your {ord} house, matters of {arena} are an area where you tend to expand — and where it helps to keep enthusiasm tethered to realistic limits.",
  ],
  saturn: [
    "Saturn in your {ord} house places your sense of responsibility in {arena}; this is an area where you may feel the weight of expectation, and where patience tends to pay off.",
    "With Saturn in your {ord} house, matters of {arena} ask for steady, committed effort; competence here is usually earned slowly and then stays.",
  ],
  uranus: [
    "Uranus in your {ord} house brings a streak of independence to {arena}; this is where you may break from convention or meet sudden change.",
    "With Uranus in your {ord} house, you need freedom in matters of {arena} and are most likely to do things your own way there.",
  ],
  neptune: [
    "Neptune in your {ord} house softens the edges around {arena}; it can bring inspiration and idealism there, and also a tendency to see what you hope to see.",
    "With Neptune in your {ord} house, matters of {arena} carry an imaginative, sometimes dreamlike quality, and clear information helps keep them grounded.",
  ],
  pluto: [
    "Pluto in your {ord} house concentrates intensity around {arena}; this is where deep transformation tends to happen across a lifetime.",
    "With Pluto in your {ord} house, matters of {arena} are an area of depth and renewal, where holding on too tightly tends to be the thing worth examining.",
  ],
};

export const PLANET_NOUN: Record<string, string> = {
  sun: "your sense of self", moon: "your emotional needs", mercury: "your thinking", venus: "your affections and values",
  mars: "your drive", jupiter: "your optimism and appetite for growth", saturn: "your sense of structure and responsibility",
  uranus: "your independence", neptune: "your imagination and sensitivity", pluto: "your intensity and capacity for change",
};

export const PLANET_PULL: Record<string, string> = {
  sun: "being fully yourself", moon: "feeling safe and settled", mercury: "understanding and being understood",
  venus: "closeness and harmony", mars: "acting and asserting yourself", jupiter: "expanding and trusting",
  saturn: "being careful and responsible", uranus: "being free", neptune: "dreaming and merging", pluto: "going deep and making real change",
};

export const PLANET_PRACTICE: Record<string, string> = {
  sun: "choosing at least one activity a week because it feels like you rather than because it is expected",
  moon: "noticing what you feel before you decide what to do about it",
  mercury: "writing a thought down before you debate it",
  venus: "naming what you value and asking for it plainly",
  mars: "giving your energy a physical or purposeful outlet before it turns into irritation",
  jupiter: "saying yes to growth while still checking the facts",
  saturn: "committing to one manageable routine rather than an overhaul",
  uranus: "making room for one small, deliberate break from routine",
  neptune: "pairing imagination with one concrete, checkable step",
  pluto: "letting go of something you have outgrown, gently and on purpose",
};

/** order-insensitive pair flavors, keyed by body ids in chart order (sun<moon<mercury<…) */
export const PAIR_FLAVOR: Record<string, { ease: string; tension: string; blend: string }> = {
  "sun-moon": {
    ease: "Your Sun and Moon work together: what you want and what you need are on speaking terms, which can give your life a sense of inner coherence.",
    tension: "Your Sun and Moon pull in different directions: what drives you and what comforts you are not always the same thing, which can feel like an inner negotiation between ambition and security.",
    blend: "Your Sun and Moon are closely joined, so your identity and your emotional needs tend to act as one: you may feel exactly like yourself, and find it hard to separate your own needs from your sense of who you are.",
  },
  "sun-mercury": {
    ease: "Mercury supports your Sun, so your ideas and your sense of self cooperate.",
    tension: "Mercury and your Sun sit at an awkward angle, so what you think and who you feel you are can briefly disagree.",
    blend: "Mercury stays so close to your Sun that your thinking and your identity are bound together: you tend to speak as you are, and may take disagreement with your ideas personally.",
  },
  "sun-venus": {
    ease: "Venus supports your Sun, lending your self-expression charm and an easy appreciation of others.",
    tension: "Venus and your Sun sit at an awkward angle, so wanting to be liked and wanting to be yourself may occasionally disagree.",
    blend: "Venus accompanies your Sun closely, which tends to give your self-expression charm and a natural taste for harmony.",
  },
  "sun-mars": {
    ease: "Your Sun and Mars cooperate, so confidence and action tend to meet easily: you can usually act on what you believe in with energy and clear purpose.",
    tension: "Your Sun and Mars meet at an angle that adds friction, so your will can feel pushed — a source of great energy, along with a potential for impatience or conflict that is worth noticing.",
    blend: "Your Sun and Mars are joined, which tends to fuel assertive, self-propelled energy; it can be a powerful engine and may be impatient with delay.",
  },
  "sun-jupiter": {
    ease: "Your Sun and Jupiter support each other, lending your identity optimism, generosity and a feeling that opportunity tends to meet you halfway.",
    tension: "Your Sun and Jupiter push against each other, which can inflate confidence or promises — enthusiasm that is wonderful when aimed and costly when it outruns the facts.",
    blend: "Your Sun and Jupiter are joined, which traditionally adds a magnanimous, expansive quality to your sense of self.",
  },
  "sun-saturn": {
    ease: "Your Sun and Saturn cooperate, giving your identity a steadiness and sense of responsibility that you can actually use rather than merely carry.",
    tension: "Your Sun and Saturn are in a challenging aspect, a combination often associated with self-doubt or a heavy sense of duty; it can also build uncommon resilience and self-discipline over time.",
    blend: "Your Sun and Saturn are joined, which can make identity feel serious, disciplined and hard-won; confidence tends to come slowly, and then lasts.",
  },
  "sun-uranus": {
    ease: "Your Sun and Uranus cooperate, supporting your individuality and giving you comfort with being different.",
    tension: "Your Sun and Uranus are in a challenging aspect: your need to be yourself and your need to be free can clash with routines and expectations, sometimes producing sudden changes of direction.",
    blend: "Your Sun and Uranus are joined, giving a strongly independent, original streak to your identity.",
  },
  "sun-neptune": {
    ease: "Your Sun and Neptune cooperate, lending imagination and sensitivity to how you express yourself.",
    tension: "Your Sun and Neptune are in a challenging aspect, which can make your sense of self feel elusive at times; clear goals and honest feedback can steady it while preserving your imagination.",
    blend: "Your Sun and Neptune are joined, which can blur the edges of identity — a gift for empathy and imagination, along with a need for grounding.",
  },
  "sun-pluto": {
    ease: "Your Sun and Pluto cooperate, giving your identity considerable inner strength and a capacity for reinvention.",
    tension: "Your Sun and Pluto are in a challenging aspect, often described as an intense relationship with power and control; it may bring formidable determination and moments of personal reinvention.",
    blend: "Your Sun and Pluto are joined, which can concentrate your identity into a powerful, focused intensity.",
  },
  "moon-mercury": {
    ease: "Your Moon and Mercury cooperate, helping you put feelings into words and think clearly about what you need.",
    tension: "Your Moon and Mercury are in a challenging aspect, so thinking and feeling may disagree — you might talk yourself out of a feeling, or let a mood color your reasoning.",
    blend: "Your Moon and Mercury are joined, so mind and mood tend to travel together; you may think best when you feel something, and feel what you think.",
  },
  "moon-venus": {
    ease: "Your Moon and Venus cooperate, adding warmth, grace and ease in giving and receiving affection.",
    tension: "Your Moon and Venus are in a challenging aspect, which can make the wish for comfort and the wish for love pull slightly apart; indulgence and people-pleasing are worth noticing.",
    blend: "Your Moon and Venus are joined, which tends to bring a gentle, affectionate nature and a strong appreciation of comfort and beauty.",
  },
  "moon-mars": {
    ease: "Your Moon and Mars cooperate, helping you act on your feelings with courage and giving your emotions a healthy outlet.",
    tension: "Your Moon and Mars are in a challenging aspect, which can give feelings a quick temper or a sharp edge; physical movement and honest, early communication tend to help.",
    blend: "Your Moon and Mars are joined, which tends to give strong, fast and passionate emotional reactions.",
  },
  "moon-jupiter": {
    ease: "Your Moon and Jupiter cooperate, adding warmth, generosity and a naturally hopeful emotional outlook.",
    tension: "Your Moon and Jupiter are in a challenging aspect, which can magnify feelings or encourage emotional excess; the same big-heartedness is a real gift when kept in proportion.",
    blend: "Your Moon and Jupiter are joined, which traditionally brings emotional generosity and a trusting, optimistic disposition.",
  },
  "moon-saturn": {
    ease: "Your Moon and Saturn cooperate, offering emotional steadiness and a capacity to stay composed and dependable for others.",
    tension: "Your Moon and Saturn are in a challenging aspect, often associated with emotional restraint or an early sense of having to be strong; it can also yield remarkable emotional maturity once you permit yourself softness.",
    blend: "Your Moon and Saturn are joined, which tends to give feelings a serious, guarded quality — you may be emotionally dependable and slow to ask for care.",
  },
  "moon-uranus": {
    ease: "Your Moon and Uranus cooperate, giving your emotional life freshness and adaptability.",
    tension: "Your Moon and Uranus are in a challenging aspect, which can make emotional life feel changeable, with sudden needs for space or change; stable routines can help you stay centered.",
    blend: "Your Moon and Uranus are joined, which tends to bring an independent, sometimes unpredictable emotional temperament.",
  },
  "moon-neptune": {
    ease: "Your Moon and Neptune cooperate, deepening intuition and compassion.",
    tension: "Your Moon and Neptune are in a challenging aspect, which can make you very porous to other people’s moods; boundaries and regular grounding routines tend to be especially helpful.",
    blend: "Your Moon and Neptune are joined, which tends to give a deeply sensitive, imaginative inner life.",
  },
  "moon-pluto": {
    ease: "Your Moon and Pluto cooperate, giving emotional depth and resilience.",
    tension: "Your Moon and Pluto are in a challenging aspect, often described as emotionally intense, with strong attachments and a tendency to hold things in until they surface forcefully.",
    blend: "Your Moon and Pluto are joined, which tends to make feelings powerful and private, with a strong capacity for emotional renewal.",
  },
  "mercury-venus": {
    ease: "Mercury and Venus cooperate, giving you a pleasing way with words and a taste for graceful conversation.",
    tension: "Mercury and Venus sit at an awkward angle, so saying what is true and saying what is pleasant may occasionally disagree.",
    blend: "Mercury and Venus are joined, which tends to give a pleasing way with words and a taste for graceful conversation.",
  },
  "mercury-mars": {
    ease: "Mercury and Mars cooperate, giving your thinking speed and your speech conviction.",
    tension: "Mercury and Mars are in a challenging aspect, which can make debate sharp and impatient; the quickness is a real asset when it is paired with listening.",
    blend: "Mercury and Mars are joined, giving a quick, argumentative, energetic mind.",
  },
  "mercury-jupiter": {
    ease: "Mercury and Jupiter cooperate, helping you see the big picture and communicate it generously.",
    tension: "Mercury and Jupiter are in a challenging aspect, which can produce big ideas with loose details; checking facts is the useful companion to your enthusiasm.",
    blend: "Mercury and Jupiter are joined, which tends to give an optimistic, wide-ranging mind.",
  },
  "mercury-saturn": {
    ease: "Mercury and Saturn cooperate, supporting disciplined, careful thinking and reliable communication.",
    tension: "Mercury and Saturn are in a challenging aspect, which can bring self-consciousness about speaking or a harsh inner critic; it often matures into precise, thoughtful expression.",
    blend: "Mercury and Saturn are joined, giving a serious, methodical mind that prefers to think before speaking.",
  },
  "mercury-uranus": {
    ease: "Mercury and Uranus cooperate, supporting original, quick thinking.",
    tension: "Mercury and Uranus are in a challenging aspect, which can bring sudden insights and some mental restlessness or nervous energy.",
    blend: "Mercury and Uranus are joined, giving a brilliant, inventive and sometimes unconventional mind.",
  },
  "mercury-neptune": {
    ease: "Mercury and Neptune cooperate, adding imagination and intuition to how you think.",
    tension: "Mercury and Neptune are in a challenging aspect, which can make details slippery; writing things down helps your imagination without losing the facts.",
    blend: "Mercury and Neptune are joined, giving an intuitive, image-rich mind that may find literal detail less natural.",
  },
  "mercury-pluto": {
    ease: "Mercury and Pluto cooperate, supporting penetrating, investigative thought.",
    tension: "Mercury and Pluto are in a challenging aspect, which can make thinking obsessive or intense; the same focus can be exceptional in research.",
    blend: "Mercury and Pluto are joined, giving a probing, persuasive mind.",
  },
  "venus-mars": {
    ease: "Venus and Mars cooperate, so desire and affection tend to move together.",
    tension: "Venus and Mars are in a challenging aspect, which can make attraction vivid and relationships dynamic, with a push-and-pull between what you want and what you give.",
    blend: "Venus and Mars are joined, which tends to give strong chemistry and a passionate approach to love.",
  },
  "venus-jupiter": {
    ease: "Venus and Jupiter cooperate, adding warmth, generosity and ease in social settings.",
    tension: "Venus and Jupiter are in a challenging aspect, which can lean toward indulgence — more is not always more satisfying.",
    blend: "Venus and Jupiter are joined, a combination traditionally associated with charm, generosity and an appreciation of abundance.",
  },
  "venus-saturn": {
    ease: "Venus and Saturn cooperate, supporting loyal, committed and durable relationships.",
    tension: "Venus and Saturn are in a challenging aspect, which can bring caution or a fear of rejection in love; it often yields steadfast loyalty once trust is established.",
    blend: "Venus and Saturn are joined, which tends to give a reserved, serious approach to love and values.",
  },
  "venus-uranus": {
    ease: "Venus and Uranus cooperate, supporting freedom and originality in relationships.",
    tension: "Venus and Uranus are in a challenging aspect, which can bring a need for both closeness and independence, sometimes with sudden shifts in attraction.",
    blend: "Venus and Uranus are joined, which tends to give unconventional tastes and a strong need for freedom in love.",
  },
  "venus-neptune": {
    ease: "Venus and Neptune cooperate, adding tenderness, artistry and romantic imagination.",
    tension: "Venus and Neptune are in a challenging aspect, which can idealize partners; seeing people clearly is the gift to cultivate.",
    blend: "Venus and Neptune are joined, a romantic, artistic and compassionate combination that may idealize those it loves.",
  },
  "venus-pluto": {
    ease: "Venus and Pluto cooperate, giving affection depth and loyalty.",
    tension: "Venus and Pluto are in a challenging aspect, which can make love intense and sometimes possessive; honesty about what you need is the bridge.",
    blend: "Venus and Pluto are joined, a combination associated with deep, all-or-nothing attachment.",
  },
  "mars-jupiter": {
    ease: "Mars and Jupiter cooperate, adding confidence and courage to your initiative.",
    tension: "Mars and Jupiter are in a challenging aspect, which can lead to overreaching; pacing is a skill that makes your energy go farther.",
    blend: "Mars and Jupiter are joined, adding enthusiasm, big-hearted energy and an appetite for adventure.",
  },
  "mars-saturn": {
    ease: "Mars and Saturn cooperate, supporting disciplined, enduring effort.",
    tension: "Mars and Saturn are in a challenging aspect, which can feel like pressing the accelerator and the brake at the same time; it often develops remarkable stamina once you learn to pace it.",
    blend: "Mars and Saturn are joined, giving controlled, persistent energy.",
  },
  "mars-uranus": {
    ease: "Mars and Uranus cooperate, giving your actions a spark of originality.",
    tension: "Mars and Uranus are in a challenging aspect, which can bring impulsiveness and restlessness; movement and variety are useful outlets.",
    blend: "Mars and Uranus are joined, giving a bold, restless and independent energy.",
  },
  "mars-neptune": {
    ease: "Mars and Neptune cooperate, channeling energy through imagination and compassion.",
    tension: "Mars and Neptune are in a challenging aspect, which can scatter your drive or make assertiveness feel difficult; clear, small goals tend to help.",
    blend: "Mars and Neptune are joined, a gentle, idealistic drive that works best when pointed at something inspiring.",
  },
  "mars-pluto": {
    ease: "Mars and Pluto cooperate, giving you stamina and strategic power.",
    tension: "Mars and Pluto are in a challenging aspect, which can intensify drive and conflict; channeling it into demanding work is usually healthier than into power struggles.",
    blend: "Mars and Pluto are joined, giving formidable focus and determination.",
  },
  "jupiter-saturn": {
    ease: "Jupiter and Saturn cooperate, balancing optimism and realism so that growth tends to be sustainable.",
    tension: "Jupiter and Saturn are in a challenging aspect, so the urge to expand and the instinct to be careful pull against each other; learning when to follow which is the long work.",
    blend: "Jupiter and Saturn are joined, a combination that asks you to blend big vision with careful structure.",
  },
};

/** Sun→Moon elongation phases, in 45° bins starting at the new Moon. */
export const MOON_PHASES: { name: string; text: string }[] = [
  { name: "new", text: "You were born in the Moon’s new phase, a time symbolically associated with beginnings, instinct and spontaneity; you may feel more like a starter than a finisher, and trust your first impressions." },
  { name: "waxing crescent", text: "You were born in the Moon’s waxing crescent phase, often linked to pushing through early resistance and building on a fresh impulse; effort tends to matter more than inspiration for you." },
  { name: "first quarter", text: "You were born in the Moon’s first quarter, symbolically a time of action and decision; you may be energized by challenges that require you to commit." },
  { name: "waxing gibbous", text: "You were born in the Moon’s waxing gibbous phase, associated with refining and perfecting; you may be a natural improver, always seeing how a thing could be polished a little further." },
  { name: "full", text: "You were born around the full Moon, associated with awareness, relationships and illumination; you may see both sides of a situation vividly, and feel the pull between them." },
  { name: "disseminating", text: "You were born in the Moon’s disseminating phase, often linked to sharing what you have learned; teaching, explaining or passing insight along may come naturally." },
  { name: "last quarter", text: "You were born in the Moon’s last quarter, symbolically a time of reassessing and releasing; you may be drawn to rethinking inherited beliefs and building your own." },
  { name: "balsamic", text: "You were born in the Moon’s balsamic phase, the closing stage of the cycle, associated with reflection, completion and intuition; you may seem old-souled, or drawn to what comes next." },
];

export const ELEMENT_QUALITY: Record<string, string> = {
  Fire: "spontaneous, expressive and action-led",
  Earth: "practical, steady and grounded in the tangible",
  Air: "curious, conversational and able to step back",
  Water: "feeling-led, protective and intuitive",
};

export const ELEMENT_SPARK: Record<string, string> = {
  Fire: "spark, momentum and the willingness to begin",
  Earth: "form, patience and follow-through",
  Air: "ideas, language and the exchange between people",
  Water: "feeling, memory and emotional bonding",
};

export const ELEMENT_PRACTICE: Record<string, string> = {
  Fire: "put something physical or playful into your week on purpose — a walk at speed, a creative experiment, a small risk you actually enjoy",
  Earth: "give your projects a daily anchor — a fixed time, a visible checklist, a place that is reliably yours — so ideas turn into things you can touch",
  Air: "keep a conversation or a notebook going; saying a thought aloud, or putting it on paper, tends to clear the air for you",
  Water: "protect a little quiet time for feeling — journaling, music, time near water, an honest talk with someone safe — before the week asks anything of you",
};

export const MODALITY_LINE: Record<string, { lots: string; few: string }> = {
  Cardinal: {
    lots: "Cardinal signs begin things, and with {n} of your ten bodies there ({members}), starting may come to you more readily than finishing: you are likely at your best when a situation is new and a little unclaimed.",
    few: "With only {n} of your ten bodies in cardinal signs, initiating from a standing start is probably not your default; you may do your best work when something is already moving and you can take it somewhere.",
  },
  Fixed: {
    lots: "Fixed signs sustain, and with {n} of your ten bodies there ({members}), commitment and staying power are likely among your defining traits — and so, at times, is reluctance to change course.",
    few: "With only {n} of your ten bodies in fixed signs, you may find it easier to adapt or to begin than to hold one course for years; deliberate commitments tend to help.",
  },
  Mutable: {
    lots: "Mutable signs adapt and translate, and with {n} of your ten bodies there ({members}), flexibility is probably one of your gifts — along with a tendency to keep options open longer than is comfortable.",
    few: "With only {n} of your ten bodies in mutable signs, changing plans midstream may feel less natural to you than it looks on other people; planning in some slack can help.",
  },
};

export const DIGNITY_LINE: Record<string, string> = {
  domicile: "{P} is in {S}, a sign it traditionally rules — astrologers say a planet in its own sign tends to express itself readily and without much translation.",
  exaltation: "{P} is in {S}, the sign of its traditional exaltation, where its qualities are said to be expressed with particular grace.",
  detriment: "{P} is in {S}, a sign traditionally called its detriment — not a flaw, but a placement where the planet’s natural style has to be adapted, which often builds resourcefulness.",
  fall: "{P} is in {S}, a sign traditionally called its fall — a placement where the planet’s qualities may need more conscious effort to express, and often mature into something quietly distinctive.",
};

export const RETRO_LINE: Record<string, string> = {
  mercury: "Mercury was retrograde at your birth — appearing, from Earth, to move backward. Traditionally this is read as a more inward, reviewing way of thinking: you may mull things over before speaking, and find your best words arrive a little after the moment.",
  venus: "Venus was retrograde at your birth, which is traditionally read as turning affection and values inward: you may reconsider relationships thoughtfully, form deep and selective attachments, and need to be sure of what you want before you say it.",
  mars: "Mars was retrograde at your birth, traditionally read as drive that turns inward before it moves outward: you may take time to start, then prove surprisingly persistent, and handle anger by processing it privately first.",
  jupiter: "Jupiter was retrograde at your birth, which tradition associates with growth that happens inwardly — through reflection and personal conviction — as much as through outer opportunity.",
  saturn: "Saturn was retrograde at your birth, traditionally read as an internalized sense of authority: you may be your own strictest supervisor, and your discipline tends to come from within rather than from outside rules.",
};

export const SUN_ASC_RELATION = {
  same: "Your Sun and Rising sign are both in {sun}, so what people meet at the door and what lives inside you speak the same language. You are likely to come across as consistent, and may feel unusually well seen — though {sunLower} traits can also arrive doubled, strengths and blind spots alike.",
  element: "Your Sun in {sun} and Rising in {asc} share the {el} element, so your outer approach and your inner identity are different expressions of one temperament rather than two separate people.",
  harmonious: "Your {sun} Sun and {asc} Rising are different elements that traditionally support each other: the way you approach the world gives your core motives room to breathe, and each side tends to lend the other something it lacks.",
  friction: "Your {sun} Sun and {asc} Rising speak different elemental languages: the way you meet the world is {ascQ}, while who you are underneath is {sunQ}. People may be a little surprised by the person they find as they get to know you, and you may sometimes feel you are translating between the two.",
  opposite: "Your Sun and Rising sit in opposite signs, {sun} and {asc}. Tradition often links this to a birth near sunset, and a theme of balancing the self you bring to the world with the self that others reflect back to you.",
};

export const TRANSITION = {
  toRising: "If the Sun is the center of your chart, the Rising sign is its doorway.",
  toMoon: "The Sun describes what you do in the light; the Moon describes what you need when the lights are low.",
  toSynth: "Each of these three placements has been described on its own, but you do not experience them one at a time.",
  toMercury: "Beyond the Big Three, the personal planets show how the rest of you works. Mercury comes first, because it governs how you take in and give out information.",
  toVenus: "If Mercury is how you think, Venus is what you think is worth caring about.",
  toMars: "Venus draws toward what you value; Mars is what you do about it.",
  toSocial: "Jupiter and Saturn are the two planets that mark the outer edge of the personal sky: one widens it, the other gives it shape.",
  toOuter: "Beyond Saturn lie the slow outer planets, which take years to cross a single sign and therefore speak first about a generation, and only secondarily about you.",
  toPatterns: "So far we have looked at placements one at a time. A chart is more than a list, though, and the patterns between its parts often say as much as the parts themselves.",
  toGrowth: "Pulling these threads together, a few things stand out about where you may be strong, and where growth may be asked of you.",
  toLife: "A reading is only useful if it makes some small difference when you close it.",
};

export const REFLECTION_BANK = {
  sun: "When did you last feel {seek} — and what were you doing?",
  moon: "When you are frayed, what does your {sign} Moon quietly ask for, and what happens on the days you let yourself have it?",
  saturn: "Saturn’s patience is placed around {arena}. What small, steady step could you take there this month?",
  saturnSign: "Where in your life do you already show the kind of patient commitment that {sign} Saturn describes — and where would you like to?",
  tension: "Where do {a} and {b} pull against each other in your everyday decisions, and what would it look like to honor both before choosing?",
  venus: "What do you value most in the people you love — {valuing} — and how directly do you ask for it?",
  mars: "What is worth your effort right now, and how would you like to spend your energy on it rather than against it?",
  sunHouse: "The Sun’s light falls on {arena}. Is that where you currently spend your best energy, and is that a choice?",
  element: "Your chart leans toward {el}. What would it mean to use that on purpose rather than by default?",
  lacking: "No planet in your chart sits in {el} signs. What would you like to invite in of {spark}?",
  mercury: "How do you think best — talking it out, writing it down or walking it off — and how much of your week allows for that?",
  jupiter: "Where is life currently inviting you to think bigger, and what would make that growth sustainable?",
  noTime: "If you learn your birth time, which of these answers would you most like to see sharpened — your Rising sign, your houses, or your chart ruler?",
};
