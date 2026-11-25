// route.js — the boat's route between docks: legs, sailing, next stops.
// The route IS the world: the menu changes at every dock, and the dotted
// route plus the numbered next-stops list is the depth engine.
HH.route = {
  legServed: 0,      // orders served at the current dock
  dockTime: HH.DOCK_SECONDS,
  sailing: false,
  sailT: 0,
  sailFrom: 0,
  sailTo: 1,

  reset: function () {
    this.legServed = 0;
    this.dockTime = HH.DOCK_SECONDS;
    this.sailing = false;
    this.sailT = 0;
  },

  dock: function () { return HH.DOCKS[G.dockIndex]; },

  update: function (dt) {
    if (G.state !== 'play' || G.shotMode) return;
    if (this.sailing) {
      this.sailT += dt;
      if (this.sailT >= 4) {
        this.sailing = false;
        G.dockIndex = this.sailTo;
        this.dockTime = HH.DOCK_SECONDS;
        this.legServed = 0;
        HH.orders.spawnCatch();
        G.hint = 'Docked at ' + this.dock().name + ' — new menu, new catch!';
        G.hintT = 3;
      }
      return;
    }
    this.dockTime -= dt;
    // Sail on when the dock is worked (4 served) or its clock runs out.
    if (this.legServed >= 4 || this.dockTime <= 0) this.startSail();
  },

  startSail: function () {
    if (this.sailing) return;
    if (G.dockIndex >= HH.DOCKS.length - 1) {
      G.state = 'feast'; // last dock worked: the harbour feast
      return;
    }
    this.sailing = true;
    this.sailT = 0;
    this.sailFrom = G.dockIndex;
    this.sailTo = G.dockIndex + 1;
    G.hint = 'Setting sail for ' + HH.DOCKS[this.sailTo].name + '…';
    G.hintT = 3;
  },

  // Boat position along the dotted route, 0..1 between two dock dots.
  boatT: function () {
    if (!this.sailing) return G.dockIndex;
    return this.sailFrom + Math.min(1, this.sailT / 4) * (this.sailTo - this.sailFrom);
  },

  // Numbered next-stops list for the selected ticket: the full chain,
  // with the current step highlighted. This is the route plan the judge sees.
  nextStops: function (ticket) {
    if (!ticket) return [];
    const stage = HH.orders.stageOf(ticket);
    const dish = ticket.dish;
    const rows = [
      { n: 1, key: 'pantry', text: 'PANTRY — grab ' + dish.raw },
      { n: 2, key: 'chop', text: 'CHOP BOARD — chop it' },
      { n: 3, key: 'stove', text: 'STOVE — cook it' },
      { n: 4, key: 'stock', text: 'STOCK POT — ladle it' },
      { n: 5, key: 'pass', text: 'PASS — ring the bell' },
    ];
    // stage counts completed steps: stage 0 = nothing done yet.
    for (const r of rows) {
      r.done = HH.STEPS.indexOf(r.key) < stage;
      r.now = HH.STEPS.indexOf(r.key) === stage;
    }
    return rows;
  },
};
