// shots.js — the four screenshot scenes behind ?shot=cover|route|batch|feast.
// Each stages a real game state (frozen: no timers, no spawns) and paints it
// twice, then sets window.__shotReady. Same preset always gives same frame.
HH.shots = {
  // Build a fixed ticket rail: 5 tickets, first one the catch, one ready.
  baseRail: function (readyPlates) {
    HH.orders.reset();
    HH.rng = HH.makeRng(20261125);
    const menu = HH.MENUS[G.dockIndex];
    const custs = [HH.CUSTOMERS[0], HH.CUSTOMERS[3], HH.CUSTOMERS[2], HH.CUSTOMERS[1], HH.CUSTOMERS[4]];
    for (let i = 0; i < 5; i++) {
      const t = HH.orders.spawn({
        dishId: i === 0 ? HH.DOCKS[G.dockIndex].catch : menu[i % menu.length],
        catch: i === 0,
        customer: custs[i],
        timeLeft: [62, 48, 71, 35, 54][i],
      });
      if (t) t.maxTime = 90;
    }
    G.selectedId = HH.orders.list[1] ? HH.orders.list[1].id : null;
    G.passPlates = readyPlates || 0;
    G.passDishes = [];
    for (let i = 0; i < (readyPlates || 0); i++) {
      G.passDishes.push(HH.DISHES[menu[i % menu.length]]);
    }
  },

  apply: function (name) {
    G.shotMode = true;
    G.state = 'play';
    G.chopStage = 0;
    G.timeLeft = 167;
    G.coins = 342;
    G.served = 9;
    G.streak = 3;
    G.bestStreak = 5;
    G.walkouts = 0;
    G.rush = 0;
    G.player.x = 560;
    G.player.y = 580;
    G.player.moving = false;

    if (name === 'route') {
      // Mid-sail between dock 1 and 2: route highlighted, two tickets mid-chain.
      G.dockIndex = 0;
      this.baseRail(1);
      HH.route.sailing = true;
      HH.route.sailFrom = 0;
      HH.route.sailTo = 1;
      HH.route.sailT = 2.1;
      G.carry = { ticketId: HH.orders.list[1].id, dish: HH.orders.list[1].dish, stage: 1 };
      G.selectedId = HH.orders.list[1].id;
      G.hint = 'Setting sail for HONEY HARBOUR…';
      G.hintT = 99;
      return;
    }
    if (name === 'batch') {
      // Stock pot at ×3 feeding two dishes + the catch ticket up top.
      G.dockIndex = 1;
      this.baseRail(1);
      HH.prep.batches = 3;
      G.carry = { ticketId: HH.orders.list[2].id, dish: HH.orders.list[2].dish, stage: 2 };
      G.selectedId = HH.orders.list[2].id;
      G.player.x = 779;
      G.player.y = 580;
      G.nearStation = 'stock';
      G.hint = 'Stock ladled! One pot feeds 3 dishes.';
      G.hintT = 99;
      return;
    }
    if (name === 'feast') {
      // End-of-shift harbour feast: pass full, stats up, next dock named.
      G.dockIndex = 2;
      G.state = 'feast';
      G.coins = 486;
      G.served = 17;
      G.streak = 6;
      G.bestStreak = 6;
      this.baseRail(3);
      G.timeLeft = 0;
      return;
    }
    // cover (default): mid-rush full kitchen, everything at once.
    G.dockIndex = 0;
    this.baseRail(2);
    HH.prep.batches = 3;
    G.carry = { ticketId: HH.orders.list[1].id, dish: HH.orders.list[1].dish, stage: 2 };
    G.selectedId = HH.orders.list[1].id;
    G.player.x = 560;
    G.player.y = 580;
    G.nearStation = 'stove';
    G.workProgress = 0.6;
    G.chopStage = 0.55; // chop board mid-chop: fish + knife + ring visible
    G.hint = 'Cooked! Ladle the stock.';
    G.hintT = 99;
  },
};
