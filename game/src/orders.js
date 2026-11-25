// orders.js — the ticket rail: spawn, tick, serve, walk out.
// Tickets are the game's clock: every ticket carries its own timer.
HH.orders = {
  list: [],
  nextId: 1,
  spawnTimer: 4,
  servedFlash: null, // {text, t} popup after a serve

  reset: function () {
    this.list = [];
    this.nextId = 1;
    this.spawnTimer = 4;
    this.servedFlash = null;
  },

  // Pick a dish from the current dock's menu (or the catch of the day).
  spawn: function (opts) {
    opts = opts || {};
    if (this.list.length >= HH.MAX_TICKETS) return null;
    const dock = HH.DOCKS[G.dockIndex];
    const menu = HH.MENUS[G.dockIndex];
    const dishId = opts.dishId || menu[Math.floor(HH.rng() * menu.length)];
    const dish = HH.DISHES[dishId];
    const cust = opts.customer || HH.CUSTOMERS[Math.floor(HH.rng() * (HH.CUSTOMERS.length - 1))];
    const t = {
      id: this.nextId++,
      dishId: dishId,
      dish: dish,
      customer: cust,
      catch: !!opts.catch,
      timeLeft: opts.timeLeft || (opts.catch ? 90 : 75),
      maxTime: opts.timeLeft || (opts.catch ? 90 : 75),
      dock: dock.name,
    };
    this.list.push(t);
    return t;
  },

  // The catch of the day: one gold ticket per dock, worth 1.5x.
  spawnCatch: function () {
    const dishId = HH.DOCKS[G.dockIndex].catch;
    const t = this.spawn({ dishId: dishId, catch: true, customer: HH.CUSTOMERS[5] });
    return t;
  },

  update: function (dt) {
    if (G.state !== 'play' || G.shotMode) return;
    this.spawnTimer -= dt * (G.rush > 0 ? 0.55 : 1);
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 10 + HH.rng() * 4;
      this.spawn();
    }
    for (let i = this.list.length - 1; i >= 0; i--) {
      const t = this.list[i];
      t.timeLeft -= dt;
      if (t.timeLeft <= 0) {
        this.list.splice(i, 1);
        G.streak = 0;
        G.walkouts++;
        G.hint = t.customer.name + ' walked out! Streak lost.';
        G.hintT = 2.5;
        if (G.selectedId === t.id) G.selectedId = this.list.length ? this.list[0].id : null;
      }
    }
    if (this.servedFlash) {
      this.servedFlash.t -= dt;
      if (this.servedFlash.t <= 0) this.servedFlash = null;
    }
  },

  // Serve the ticket matching the carried dish. Returns coins earned or 0.
  serve: function (ticketId) {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id === ticketId) {
        const t = this.list[i];
        this.list.splice(i, 1);
        let coins = t.dish.price + Math.ceil(t.timeLeft / 10);
        if (t.catch) coins = Math.round(coins * 1.5);
        if (G.streak >= 2) coins = Math.round(coins * (1 + 0.1 * Math.min(G.streak, 8)));
        G.coins += coins;
        G.served++;
        G.streak++;
        if (G.streak > G.bestStreak) G.bestStreak = G.streak;
        G.bellT = 0.6; // the pass bell swings
        this.servedFlash = { text: 'ORDER UP! +$' + coins, t: 1.6 };
        HH.route.legServed++;
        if (G.selectedId === ticketId) G.selectedId = this.list.length ? this.list[0].id : null;
        return coins;
      }
    }
    return 0;
  },

  selected: function () {
    for (const t of this.list) if (t.id === G.selectedId) return t;
    return this.list.length ? this.list[0] : null;
  },

  // Progress dots for a ticket: filled while the carried dish matches it.
  stageOf: function (ticket) {
    if (G.carry && G.carry.ticketId === ticket.id) return G.carry.stage;
    return 0;
  },
};
