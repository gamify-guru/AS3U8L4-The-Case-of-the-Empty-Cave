export interface Option {
  label: string;
  ok?: boolean;
  why?: string;
}

export type ItemKind = "two" | "mc" | "type";

export interface Item {
  id: string;
  kind: ItemKind;
  emoji?: string;
  photoLabel?: string;
  ru?: string;
  prompt?: string;
  options?: Option[];
  answers?: string[];
  note?: string;
  hint?: string;
  label?: string;
}

const ww = (ok: string, wrong: string, why: string): Option[] => [
  { label: ok, ok: true, why },
  { label: wrong, ok: false, why: `Use ${ok} here. ${why}` },
];

const fixIt = (wrong: string, right: string, why: string): Option[] => [
  { label: right, ok: true, why },
  { label: wrong, ok: false, why },
  {
    label: right.replace("There", "They"),
    ok: false,
    why: "We describe a picture with There was / There were, not with They.",
  },
];

export interface Mission {
  id: string;
  code: string;
  tag: string;
  title: string;
  story: string;
  brief: string;
  reward: string;
  items: Item[];
}

/* ------------------------------------------------------------------ *
 *  GRAMMAR — Detective Notes (always available)
 * ------------------------------------------------------------------ */
export interface RuleCard {
  id: string;
  title: string;
  formula: string;
  lines: string[];
  examples: { text: string; emoji?: string }[];
}

export const RULE_CARDS: RuleCard[] = [
  {
    id: "was",
    title: "There was — one thing",
    formula: "There was + a / an / one + singular noun",
    lines: [
      "Use it for ONE thing in the past (or for water, fire, bread — things you cannot count).",
      "was works for he / she / it — and a bowl is “it”!",
    ],
    examples: [
      { text: "There was a stone bowl on the floor.", emoji: "🥣" },
      { text: "There was a small knife near the fire.", emoji: "🔪" },
      { text: "There was some water in the bowl.", emoji: "💧" },
    ],
  },
  {
    id: "were",
    title: "There were — many things",
    formula: "There were + two / three / some / many + plural noun",
    lines: [
      "Plural nouns usually end in -s: coins, tools, bones.",
      "Irregular plurals: knife → knives, shelf → shelves.",
    ],
    examples: [
      { text: "There were twelve old coins in the box.", emoji: "🪙" },
      { text: "There were many bones on the ground.", emoji: "🦴" },
      { text: "There were some knives on the shelf.", emoji: "🗡️" },
    ],
  },
  {
    id: "negative",
    title: "There wasn’t / There weren’t",
    formula: "There wasn’t + singular · There weren’t + plural (+ any)",
    lines: [
      "Negative = was not → wasn’t, were not → weren’t.",
      "After a negative we often use any.",
    ],
    examples: [
      { text: "There wasn’t a label on the case.", emoji: "🏷️" },
      { text: "There weren’t any coins in the box.", emoji: "🚫" },
      { text: "There wasn’t any water in the bowl.", emoji: "💧" },
    ],
  },
  {
    id: "questions",
    title: "Questions & short answers",
    formula: "Was there…? / Were there…?  →  Yes, there was/were. · No, there wasn’t/weren’t.",
    lines: [
      "Put Was / Were first, then there.",
      "The short answer repeats was or were — never “Yes, there is”.",
    ],
    examples: [
      { text: "Was there a fire in the cave? — Yes, there was.", emoji: "🔥" },
      { text: "Were there any tools near the wall? — Yes, there were.", emoji: "🔨" },
      { text: "Were there any coins? — No, there weren’t.", emoji: "🪙" },
    ],
  },
  {
    id: "gallery",
    title: "In the cave — evidence gallery",
    formula: "Look at the cave. What was there? What were there?",
    lines: [
      "One thing → there was. Many things → there were.",
      "Say the sentence out loud, then write it in your journal.",
    ],
    examples: [
      { text: "There was a lantern on the stone block.", emoji: "🏮" },
      { text: "There was a spiral on the flat stone.", emoji: "🌀" },
      { text: "There were empty cases and old bones.", emoji: "🦴" },
      { text: "There were cave paintings on the wall.", emoji: "🖌️" },
    ],
  },
  {
    id: "mistakes",
    title: "Typical detective mistakes",
    formula: "Read the case file of errors",
    lines: [
      "Don’t mix singular and plural in one sentence.",
      "Don’t use There is / There are for past events.",
    ],
    examples: [
      { text: "❌ There were a bowl on the floor. → ✅ There was a bowl on the floor." },
      { text: "❌ There was many coins. → ✅ There were many coins." },
      { text: "❌ There was two bowl. → ✅ There were two bowls." },
      { text: "❌ Yes, there is. → ✅ Yes, there was." },
    ],
  },
];

/* ------------------------------------------------------------------ *
 *  CLASS MISSIONS
 * ------------------------------------------------------------------ */
export const MISSIONS: Mission[] = [
  {
    id: "m1",
    code: "Mission 1",
    tag: "Restore the Cave Inventory",
    title: "Old Photos",
    story:
      "The museum archives still keep old photographs of the cave. The labels are gone — read the photo notes and choose the right verb.",
    brief:
      "Look at each photo note. Was it one thing (there was) or many things (there were)?",
    reward: "Fragment restored: the stone bowl",
    items: [
      {
        id: "m1-1",
        kind: "two",
        emoji: "🥣",
        photoLabel: "Photo 01 · the floor",
        prompt: "There ___ a stone bowl on the floor.",
        ru: "На полу была каменная чаша.",
        options: ww("was", "were", "One bowl — a singular noun."),
        note: "a stone bowl = one thing → There was.",
      },
      {
        id: "m1-2",
        kind: "two",
        emoji: "🪙",
        photoLabel: "Photo 02 · the box",
        prompt: "There ___ twelve old coins in the box.",
        ru: "В коробке было двенадцать старых монет.",
        options: ww("were", "was", "Twelve coins = a plural noun."),
        note: "twelve coins = plural → There were.",
      },
      {
        id: "m1-3",
        kind: "two",
        emoji: "🔪",
        photoLabel: "Photo 03 · near the fire",
        prompt: "There ___ a small knife near the fire.",
        ru: "Рядом с огнём был маленький нож.",
        options: ww("was", "were", "A knife — one thing."),
        note: "a small knife = singular → There was.",
      },
      {
        id: "m1-4",
        kind: "two",
        emoji: "🦴",
        photoLabel: "Photo 04 · the ground",
        prompt: "There ___ a lot of animal bones on the ground.",
        ru: "На земле было много костей животных.",
        options: ww("were", "was", "A lot of bones = plural."),
        note: "a lot of bones = plural → There were.",
      },
      {
        id: "m1-5",
        kind: "two",
        emoji: "🗿",
        photoLabel: "Photo 05 · the shelf",
        prompt: "There ___ a clay sculpture on the shelf.",
        ru: "На полке была глиняная скульптура.",
        options: ww("was", "were", "A sculpture — one thing."),
        note: "a clay sculpture = singular → There was.",
      },
      {
        id: "m1-6",
        kind: "two",
        emoji: "🔨",
        photoLabel: "Photo 06 · the wall",
        prompt: "There ___ some ancient tools near the wall.",
        ru: "У стены были какие-то древние инструменты.",
        options: ww("were", "was", "Some tools = plural."),
        note: "some ancient tools = plural → There were.",
      },
      {
        id: "m1-7",
        kind: "two",
        emoji: "📿",
        photoLabel: "Photo 07 · the small case",
        prompt: "There ___ a necklace made of shells.",
        ru: "Там было ожерелье из ракушек.",
        options: ww("was", "were", "A necklace — one thing."),
        note: "a necklace = singular → There was (even with shells inside!).",
      },
      {
        id: "m1-8",
        kind: "two",
        emoji: "🔥",
        photoLabel: "Photo 08 · the middle",
        prompt: "There ___ big fires in the middle of the cave.",
        ru: "В центре пещеры были большие костры.",
        options: ww("were", "was", "Big fires = plural."),
        note: "big fires = plural → There were.",
      },
    ],
  },
  {
    id: "m2",
    code: "Mission 2",
    tag: "Restore the Cave Inventory",
    title: "Single Finds",
    story:
      "Every single object needs its own label. The thief tore them off — write the singular labels again.",
    brief:
      "Read the Russian clue, then pick the correct singular sentence with there was.",
    reward: "Fragment restored: the stone lamp",
    items: [
      {
        id: "m2-1",
        kind: "mc",
        emoji: "🥣",
        ru: "На полу была каменная чаша.",
        label: "Label 1",
        options: [
          { label: "There was a stone bowl on the floor.", ok: true, why: "a stone bowl — singular + article a." },
          { label: "There were a stone bowl on the floor.", why: "were is only for plural nouns." },
          { label: "There was stone bowl on the floor.", why: "A singular countable noun needs an article: a bowl." },
        ],
        note: "There was + a + singular noun.",
      },
      {
        id: "m2-2",
        kind: "mc",
        emoji: "🔪",
        ru: "Рядом с огнём был маленький нож.",
        label: "Label 2",
        options: [
          { label: "There was a small knife near the fire.", ok: true, why: "a small knife — singular." },
          { label: "There was a small knives near the fire.", why: "knives is plural, but the sentence says a." },
          { label: "There were a small knife near the fire.", why: "were needs a plural noun." },
        ],
        note: "One knife → there was a knife.",
      },
      {
        id: "m2-3",
        kind: "mc",
        emoji: "🗿",
        ru: "На полке была глиняная скульптура.",
        label: "Label 3",
        options: [
          { label: "There was a clay sculpture on the shelf.", ok: true, why: "a clay sculpture — singular." },
          { label: "There was an clay sculpture on the shelf.", why: "Use a before a consonant sound: a clay." },
          { label: "There was clay sculpture on shelf.", why: "We need articles: a sculpture, the shelf." },
        ],
        note: "a + consonant sound, an + vowel sound.",
      },
      {
        id: "m2-4",
        kind: "mc",
        emoji: "📿",
        ru: "В коробке было ожерелье из ракушек.",
        label: "Label 4",
        options: [
          { label: "There was a shell necklace in the box.", ok: true, why: "a shell necklace — one thing." },
          { label: "There were a shell necklace in the box.", why: "One necklace → was." },
          { label: "There was some shell necklace in the box.", why: "some goes with plural or uncountable nouns." },
        ],
        note: "The necklace is ONE object → there was.",
      },
      {
        id: "m2-5",
        kind: "mc",
        emoji: "💧",
        ru: "В чаше была вода.",
        label: "Label 5",
        options: [
          { label: "There was some water in the bowl.", ok: true, why: "water is uncountable → there was (+ some)." },
          { label: "There were some water in the bowl.", why: "water cannot be plural here." },
          { label: "There was a water in the bowl.", why: "We don’t use a with uncountable nouns." },
        ],
        note: "Uncountable nouns (water, fire, bread) take there was.",
      },
      {
        id: "m2-6",
        kind: "mc",
        emoji: "🔥",
        ru: "В пещере был огонь.",
        label: "Label 6",
        options: [
          { label: "There was a fire in the cave.", ok: true, why: "a fire — singular." },
          { label: "There were a fire in the cave.", why: "were needs a plural noun." },
          { label: "There was fire in cave.", why: "Articles: a fire, the cave." },
        ],
        note: "There was a fire in the cave.",
      },
      {
        id: "m2-7",
        kind: "mc",
        emoji: "🪨",
        ru: "На земле был старый инструмент.",
        label: "Label 7",
        options: [
          { label: "There was an old tool on the ground.", ok: true, why: "an before a vowel sound: an old." },
          { label: "There was a old tool on the ground.", why: "old starts with a vowel sound → an old." },
          { label: "There were an old tool on the ground.", why: "One tool → was." },
        ],
        note: "an old tool — an + vowel sound.",
      },
    ],
  },
  {
    id: "m3",
    code: "Mission 3",
    tag: "Restore the Cave Inventory",
    title: "Many Finds",
    story:
      "Whole boxes of finds are waiting for new labels. Plurals only — but some plurals are tricky!",
    brief: "Choose the correct plural noun for each label.",
    reward: "Fragment restored: the bone collection",
    items: [
      {
        id: "m3-1",
        kind: "mc",
        emoji: "🪙",
        ru: "двенадцать монет",
        label: "Label 1",
        prompt: "There were twelve ___ in the box.",
        options: [
          { label: "coins", ok: true, why: "coin → coins (regular plural)." },
          { label: "coin", why: "Twelve needs a plural noun." },
          { label: "coines", why: "No -es after a vowel + n." },
        ],
        note: "coin → coins.",
      },
      {
        id: "m3-2",
        kind: "mc",
        emoji: "🦴",
        ru: "много костей",
        label: "Label 2",
        prompt: "There were a lot of animal ___ on the ground.",
        options: [
          { label: "bones", ok: true, why: "bone → bones." },
          { label: "bone", why: "A lot of + plural." },
          { label: "boneses", why: "No double plural." },
        ],
        note: "a lot of + plural noun.",
      },
      {
        id: "m3-3",
        kind: "mc",
        emoji: "🔨",
        ru: "древние инструменты",
        label: "Label 3",
        prompt: "There were many ancient ___ near the wall.",
        options: [
          { label: "tools", ok: true, why: "tool → tools." },
          { label: "tool", why: "many needs a plural noun." },
          { label: "toolies", why: "Tools form the plural with -s." },
        ],
        note: "many + plural.",
      },
      {
        id: "m3-4",
        kind: "mc",
        emoji: "🗡️",
        ru: "ножи (будьте внимательны!)",
        label: "Label 4",
        prompt: "There were some ___ on the shelf.",
        options: [
          { label: "knives", ok: true, why: "knife → knives: -f/-fe becomes -ves." },
          { label: "knifes", why: "Irregular plural: knife → knives." },
          { label: "knive", why: "knive is not a word." },
        ],
        note: "knife → knives (also shelf → shelves).",
      },
      {
        id: "m3-5",
        kind: "mc",
        emoji: "🐚",
        ru: "сотни ракушек",
        label: "Label 5",
        prompt: "There were hundreds of ___ in the cave.",
        options: [
          { label: "shells", ok: true, why: "shell → shells." },
          { label: "shell", why: "Hundreds of + plural." },
          { label: "shellses", why: "No double plural." },
        ],
        note: "hundreds of + plural noun.",
      },
      {
        id: "m3-6",
        kind: "mc",
        emoji: "🪑",
        ru: "три каменные скамейки",
        label: "Label 6",
        prompt: "There were three stone ___ in the corner.",
        options: [
          { label: "benches", ok: true, why: "bench → benches: words after -ch take -es." },
          { label: "benchs", why: "-ch words take -es: benches." },
          { label: "bench", why: "Three needs a plural." },
        ],
        note: "bench → benches (also watch → watches).",
      },
      {
        id: "m3-7",
        kind: "mc",
        emoji: "🕯️",
        ru: "шесть свечей",
        label: "Label 7",
        prompt: "There were six ___ next to the lantern.",
        options: [
          { label: "candles", ok: true, why: "candle → candles (regular)." },
          { label: "candys", why: "candy → candies, but candle → candles." },
          { label: "candle", why: "Six needs a plural." },
        ],
        note: "candle → candles.",
      },
    ],
  },
  {
    id: "m4",
    code: "Mission 4",
    tag: "Boss Battle",
    title: "Mixed Vault",
    story:
      "The boss of the case — The Empty Case Thief — has locked the last labels in the vault. Mix of was, were, negatives and questions!",
    brief: "Fix mistakes, choose short answers and type the missing verb. Every hit opens the vault.",
    reward: "Fragment restored: the cave inventory",
    items: [
      {
        id: "m4-1",
        kind: "two",
        emoji: "🏮",
        ru: "На каменном блоке был фонарь.",
        prompt: "There ___ a lantern on the stone block.",
        options: ww("was", "were", "a lantern — singular."),
        note: "a lantern = singular → there was.",
      },
      {
        id: "m4-2",
        kind: "mc",
        emoji: "🛠️",
        ru: "Найди и исправь ошибку.",
        prompt: "“There were a big stone bowl in the cave.”",
        options: fixIt(
          "There were big stone bowls in the cave.",
          "There was a big stone bowl in the cave.",
          "One bowl → there was.",
        ),
        note: "One bowl → There was a big stone bowl.",
      },
      {
        id: "m4-3",
        kind: "mc",
        emoji: "🪙",
        ru: "Короткий ответ на вопрос.",
        prompt: "Were there any coins in the box?",
        options: [
          { label: "Yes, there were.", ok: true, why: "were → Yes, there were." },
          { label: "Yes, there was.", why: "The question used were." },
          { label: "Yes, there is.", why: "This is past, not now." },
        ],
        note: "Were there…? → Yes, there were.",
      },
      {
        id: "m4-4",
        kind: "two",
        emoji: "🗡️",
        ru: "На столе не было ножей.",
        prompt: "There ___ any knives on the table.",
        options: ww("weren’t", "wasn’t", "knives is plural → weren’t."),
        note: "There weren’t any knives — plural negative.",
      },
      {
        id: "m4-5",
        kind: "mc",
        emoji: "🗿",
        ru: "Короткий ответ на вопрос.",
        prompt: "Was there a sculpture on the shelf?",
        options: [
          { label: "No, there wasn’t.", ok: true, why: "was → No, there wasn’t." },
          { label: "No, there weren’t.", why: "The question used was." },
          { label: "No, there not.", why: "A short answer needs wasn’t / weren’t." },
        ],
        note: "Was there…? → No, there wasn’t.",
      },
      {
        id: "m4-6",
        kind: "mc",
        emoji: "🦴",
        ru: "Найди и исправь ошибку.",
        prompt: "“There was many bones near the wall.”",
        options: fixIt(
          "There was many bone near the wall.",
          "There were many bones near the wall.",
          "many bones is plural → there were.",
        ),
        note: "many bones → There were.",
      },
      {
        id: "m4-7",
        kind: "type",
        emoji: "💧",
        ru: "Напиши глагол was / were.",
        prompt: "There ___ some water in the bowl.",
        answers: ["was"],
        hint: "water is uncountable — it is always singular",
        note: "Water is uncountable → there was.",
      },
      {
        id: "m4-8",
        kind: "mc",
        emoji: "🔥",
        ru: "Выбери первое слово вопроса.",
        prompt: "___ there a fire in the cave?",
        options: [
          { label: "Was", ok: true, why: "a fire is singular → Was there…?" },
          { label: "Were", why: "Were goes with plural nouns." },
          { label: "Is", why: "The case is about the past." },
        ],
        note: "Was there a fire in the cave?",
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 *  GAME DICTATION — Unit 8 Lesson 1 words
 * ------------------------------------------------------------------ */
export interface DictWord {
  id: string;
  word: string;
  emoji: string;
  ru: string;
  syllables: string;
}

export const DICTATION_WORDS: DictWord[] = [
  { id: "d1", word: "museum", emoji: "🏛️", ru: "музей", syllables: "mu·se·um" },
  { id: "d2", word: "history", emoji: "📜", ru: "история", syllables: "his·to·ry" },
  { id: "d3", word: "fire", emoji: "🔥", ru: "огонь, костёр", syllables: "fi·re" },
  { id: "d4", word: "tool", emoji: "🔨", ru: "инструмент", syllables: "tool" },
  { id: "d5", word: "sculpture", emoji: "🗿", ru: "скульптура", syllables: "sculp·ture" },
  { id: "d6", word: "necklace", emoji: "📿", ru: "ожерелье", syllables: "neck·lace" },
  { id: "d7", word: "bowl", emoji: "🥣", ru: "чаша, миска", syllables: "bowl" },
  { id: "d8", word: "knife", emoji: "🔪", ru: "нож", syllables: "knife" },
  { id: "d9", word: "coin", emoji: "🪙", ru: "монета", syllables: "coin" },
  { id: "d10", word: "musical instrument", emoji: "🎶", ru: "музыкальный инструмент", syllables: "mu·si·cal in·stru·ment" },
];

/* ------------------------------------------------------------------ *
 *  HOMEWORK — different from class tasks
 * ------------------------------------------------------------------ */
export const HOMEWORK_NOTES = [
  "There was a big stone bowl in the middle of the cave.",
  "There were many bones on the floor.",
  "There wasn’t any water in the bowl.",
  "There were some old tools near the wall.",
  "There weren’t any coins in the box.",
  "There was a small knife near the fire.",
  "There were five shells on the shelf.",
];

export const HOMEWORK_FIXES: Item[] = [
  {
    id: "hw-f1",
    kind: "mc",
    emoji: "🔪",
    prompt: "“There were a knife on the table.”",
    ru: "Исправь предложение.",
    options: fixIt("There was a knives on the table.", "There was a knife on the table.", "a knife — singular."),
    note: "a knife → there was.",
  },
  {
    id: "hw-f2",
    kind: "mc",
    emoji: "🪙",
    prompt: "“There was five coins in the box.”",
    ru: "Исправь предложение.",
    options: fixIt("There was five coin in the box.", "There were five coins in the box.", "five coins — plural."),
    note: "five coins → there were.",
  },
  {
    id: "hw-f3",
    kind: "mc",
    emoji: "🥣",
    prompt: "“There was two bowl near the fire.”",
    ru: "Исправь предложение.",
    options: fixIt("There was two bowls near the fire.", "There were two bowls near the fire.", "two + plural + were."),
    note: "two bowls → There were two bowls.",
  },
  {
    id: "hw-f4",
    kind: "mc",
    emoji: "🏮",
    prompt: "“There weren’t a lamp in the cave.”",
    ru: "Исправь предложение.",
    options: [
      { label: "There wasn’t a lamp in the cave.", ok: true, why: "a lamp — singular → wasn’t." },
      { label: "There weren’t lamps in the cave.", why: "The sentence is about one lamp." },
      { label: "There wasn’t some lamp in the cave.", why: "some doesn’t go with a singular noun." },
    ],
    note: "There wasn’t + singular noun.",
  },
  {
    id: "hw-f5",
    kind: "mc",
    emoji: "🔨",
    prompt: "“There was some tools on the ground.”",
    ru: "Исправь предложение.",
    options: [
      { label: "There were some tools on the ground.", ok: true, why: "some tools — plural." },
      { label: "There was some tool on the ground.", why: "tools is plural in the original sentence." },
      { label: "There were some tool on the ground.", why: "were needs a plural noun." },
    ],
    note: "some + plural → there were.",
  },
  {
    id: "hw-f6",
    kind: "mc",
    emoji: "🦴",
    prompt: "“Was there any bones in the cave?”",
    ru: "Исправь вопрос.",
    options: [
      { label: "Were there any bones in the cave?", ok: true, why: "bones is plural → Were there…?" },
      { label: "Was there any bone in the cave?", why: "The sentence is about bones (plural)." },
      { label: "Did there any bones in the cave?", why: "We don’t use did with there was / there were." },
    ],
    note: "Were there any bones…?",
  },
  {
    id: "hw-f7",
    kind: "mc",
    emoji: "📿",
    prompt: "“There was three necklace in the box.”",
    ru: "Исправь предложение.",
    options: [
      { label: "There were three necklaces in the box.", ok: true, why: "three + plural + were." },
      { label: "There was three necklaces in the box.", why: "was doesn’t go with three." },
      { label: "There were three necklace in the box.", why: "three needs a plural noun." },
    ],
    note: "necklace → necklaces.",
  },
  {
    id: "hw-f8",
    kind: "mc",
    emoji: "🪨",
    prompt: "“There were a old tool on the floor.”",
    ru: "Исправь предложение.",
    options: [
      { label: "There was an old tool on the floor.", ok: true, why: "one tool → there was an old tool." },
      { label: "There were an old tools on the floor.", why: "an goes with a singular noun." },
      { label: "There was a old tool on the floor.", why: "old starts with a vowel sound → an." },
    ],
    note: "an old tool → there was.",
  },
];

export const HOMEWORK_QUESTIONS: Item[] = [
  {
    id: "hw-q1",
    kind: "mc",
    emoji: "🥣",
    prompt: "Was there a stone bowl in the cave?",
    options: [
      { label: "Yes, there was.", ok: true, why: "There was a big stone bowl." },
      { label: "Yes, there were.", why: "The question used was." },
      { label: "No, there wasn’t.", why: "Read the notes again: the bowl was there." },
    ],
  },
  {
    id: "hw-q2",
    kind: "mc",
    emoji: "🦴",
    prompt: "Were there many bones on the floor?",
    options: [
      { label: "Yes, there were.", ok: true, why: "There were many bones." },
      { label: "Yes, there was.", why: "bones is plural." },
      { label: "No, there weren’t.", why: "The notes say there were many bones." },
    ],
  },
  {
    id: "hw-q3",
    kind: "mc",
    emoji: "💧",
    prompt: "Was there any water in the bowl?",
    options: [
      { label: "No, there wasn’t.", ok: true, why: "There wasn’t any water." },
      { label: "No, there weren’t.", why: "water is uncountable → wasn’t." },
      { label: "Yes, there was.", why: "The notes say there wasn’t any water." },
    ],
  },
  {
    id: "hw-q4",
    kind: "mc",
    emoji: "🪙",
    prompt: "Were there any coins in the box?",
    options: [
      { label: "No, there weren’t.", ok: true, why: "There weren’t any coins." },
      { label: "No, there wasn’t.", why: "coins is plural." },
      { label: "Yes, there were.", why: "The notes say there weren’t any coins." },
    ],
  },
  {
    id: "hw-q5",
    kind: "mc",
    emoji: "🔨",
    prompt: "Were there any tools near the wall?",
    options: [
      { label: "Yes, there were.", ok: true, why: "There were some old tools." },
      { label: "Yes, there was.", why: "tools is plural." },
      { label: "No, there weren’t.", why: "Check the notes again." },
    ],
  },
  {
    id: "hw-q6",
    kind: "mc",
    emoji: "🔪",
    prompt: "Was there a knife near the fire?",
    options: [
      { label: "Yes, there was.", ok: true, why: "There was a small knife near the fire." },
      { label: "Yes, there were.", why: "a knife — singular." },
      { label: "No, there wasn’t.", why: "The notes mention a small knife." },
    ],
  },
  {
    id: "hw-q7",
    kind: "mc",
    emoji: "🐚",
    prompt: "Were there five shells on the shelf?",
    options: [
      { label: "Yes, there were.", ok: true, why: "There were five shells on the shelf." },
      { label: "Yes, there was.", why: "five shells is plural." },
      { label: "No, there weren’t.", why: "The notes say there were five shells." },
    ],
  },
];

export interface GapText {
  intro: string;
  parts: { text: string; gap?: { answers: string[]; hint?: string; id: string } }[];
  title: string;
}

export const HOMEWORK_GAP_TEXT: GapText = {
  title: "Task D · Mini-text with gaps",
  intro:
    "Detective Ella wrote her report about the cave, but the verbs disappeared. Write was, were, wasn’t or weren’t in every gap.",
  parts: [
    { text: "Yesterday Detective Ella visited an old cave. There " },
    { text: "", gap: { id: "g1", answers: ["was"], hint: "a cave visit — one big cave" } },
    { text: " a big stone bowl in the middle. There " },
    { text: "", gap: { id: "g2", answers: ["were"], hint: "many bones = plural" } },
    { text: " many bones on the floor. There " },
    { text: "", gap: { id: "g3", answers: ["wasn’t", "wasn't"], hint: "negative + uncountable water" } },
    { text: " any water in the bowl. There " },
    { text: "", gap: { id: "g4", answers: ["were"], hint: "some old tools = plural" } },
    { text: " some old tools near the wall. There " },
    { text: "", gap: { id: "g5", answers: ["weren’t", "weren't"], hint: "negative + any coins" } },
    { text: " any coins in the box, but there " },
    { text: "", gap: { id: "g6", answers: ["were"], hint: "five shells = plural" } },
    { text: " five shells on the shelf. There " },
    { text: "", gap: { id: "g7", answers: ["was"], hint: "a small knife = singular" } },
    { text: " a small knife near the fire. There " },
    { text: "", gap: { id: "g8", answers: ["wasn’t", "wasn't"], hint: "negative + a museum (singular)" } },
    { text: " a museum in the cave — only the cave itself!" },
  ],
};

export const REPORT_STARTERS = [
  "There was a … in my room yesterday.",
  "There were some … on the table.",
  "There wasn’t a / any …",
  "There weren’t any …",
  "Was there a …? Yes, there was.",
];

/* ------------------------------------------------------------------ *
 *  NAVIGATION
 * ------------------------------------------------------------------ */
export interface NavStep {
  id: string;
  label: string;
  short: string;
  emoji: string;
  group: "class" | "home";
}

export const NAV_STEPS: NavStep[] = [
  { id: "m1", label: "Mission 1 · Old Photos", short: "M1", emoji: "📷", group: "class" },
  { id: "m2", label: "Mission 2 · Single Finds", short: "M2", emoji: "🏷️", group: "class" },
  { id: "m3", label: "Mission 3 · Many Finds", short: "M3", emoji: "🪙", group: "class" },
  { id: "m4", label: "Mission 4 · Mixed Vault", short: "M4", emoji: "🗝️", group: "class" },
  { id: "dictation", label: "Game Dictation", short: "DICT", emoji: "🎧", group: "class" },
  { id: "homework", label: "Homework", short: "HW", emoji: "🏠", group: "home" },
  { id: "results", label: "Case Report", short: "REPORT", emoji: "🏅", group: "home" },
];

export const SPEECH_TIP =
  "Tip for the teacher: the audio button reads the word aloud. If the browser has no voice, use the syllable card or say the word yourself.";
