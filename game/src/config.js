// Harbour & Honey — configuration: docks, dishes, ingredients, palette.
// One floating kitchen boat, three docks, one menu per dock.
const HH = {
  W: 1280,
  H: 800,
  SHIFT_SECONDS: 180,
  DOCK_SECONDS: 70,
  MAX_TICKETS: 5,
};

// The boat's route: three named docks. The menu changes at every dock.
HH.DOCKS = [
  { name: 'CORAL QUAY', short: 'Coral', sky: '#ffd9a0', sea: '#2e7f8f', catch: 'coral-trout' },
  { name: 'HONEY HARBOUR', short: 'Honey', sky: '#ffe9b8', sea: '#3a8f7a', catch: 'honey-salmon' },
  { name: 'GULL ROCK', short: 'Gull', sky: '#ffc98f', sea: '#2f6f9f', catch: 'crab-cakes' },
];

// dish: id, name, price, raw ingredient, plate colour, garnish colour.
HH.DISHES = {
  'coral-trout':  { name: 'Grilled Coral Trout', price: 18, raw: 'Fish',   plate: '#ff9a5c', garnish: '#7dc383' },
  'prawn-rice':   { name: 'Prawn Rice Bowl',     price: 16, raw: 'Prawns', plate: '#ffb347', garnish: '#e2574c' },
  'sea-soup':     { name: 'Sea Herb Soup',       price: 14, raw: 'Fish',   plate: '#7ec8a9', garnish: '#f2e394' },
  'honey-salmon': { name: 'Honey-Glazed Salmon', price: 22, raw: 'Fish',   plate: '#f28c4b', garnish: '#f7c948' },
  'honey-prawns': { name: 'Honey Chilli Prawns',  price: 19, raw: 'Prawns', plate: '#e2574c', garnish: '#f7c948' },
  'lemon-fish':   { name: 'Lemon Herb Fish',     price: 17, raw: 'Fish',   plate: '#f2e394', garnish: '#7dc383' },
  'crab-cakes':   { name: 'Gull Rock Crab Cakes', price: 24, raw: 'Crab',  plate: '#e07840', garnish: '#7ec8a9' },
  'crab-stew':    { name: 'Rock Crab Stew',       price: 21, raw: 'Crab',  plate: '#c96f4a', garnish: '#f2e394' },
  'crab-rolls':   { name: 'Crispy Crab Rolls',    price: 20, raw: 'Crab',  plate: '#e8a04c', garnish: '#e2574c' },
};

// Menu per dock (dish ids, in serving order).
HH.MENUS = [
  ['coral-trout', 'prawn-rice', 'sea-soup'],
  ['honey-salmon', 'honey-prawns', 'lemon-fish'],
  ['crab-cakes', 'crab-stew', 'crab-rolls'],
];

HH.INGREDIENTS = ['Fish', 'Prawns', 'Crab', 'Rice', 'Herbs', 'Honey', 'Lemon', 'Chilli'];

HH.CUSTOMERS = [
  { name: 'Lena',     mood: 'happy',    quote: 'Smells amazing!' },
  { name: 'Pak Dedi', mood: 'patient',  quote: 'Take your time.' },
  { name: 'Mira',     mood: 'hungry',   quote: 'I am SO hungry.' },
  { name: 'Jonas',    mood: 'in a hurry', quote: 'Quick, please!' },
  { name: 'Ayu',      mood: 'starving', quote: 'Feed me now!' },
  { name: 'Vera',     mood: 'critic',   quote: 'Impress me, chef.' },
];

// Steps every dish travels, in order. The next-stops list shows these.
HH.STEPS = ['pantry', 'chop', 'stove', 'stock', 'pass'];
HH.STEP_LABELS = {
  pantry: 'PANTRY — grab it',
  chop: 'CHOP — hold E',
  stove: 'STOVE — hold E to cook',
  stock: 'STOCK POT — ladle it',
  pass: 'PASS — serve + ring bell',
};

// Warm sea-gold palette. No dark minimalist cover: cream, gold, tomato, teal.
HH.COLORS = {
  cream: '#fff3d6', paper: '#fffaf0', ink: '#3a2a1a', wood: '#a06a35',
  woodDark: '#7d4f24', counter: '#f7e3b0', teal: '#1f7a8c', gold: '#f7c948',
  tomato: '#e2574c', green: '#5da271', navy: '#16324f', sky: '#ffe3ae',
};

HH.CHOP_SECONDS = 1.2;
HH.COOK_SECONDS = 2.5;
HH.STOCK_BATCHES = 3;
HH.STOCK_REFILL_SECONDS = 8;

// Tiny seeded RNG so screenshot presets are repeatable.
HH.makeRng = function (seed) {
  let s = seed >>> 0 || 12345;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
HH.rng = HH.makeRng(20261125);
