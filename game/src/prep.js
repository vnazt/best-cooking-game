// prep.js — shared-prep batching: one stock pot feeds up to 3 dishes.
// Batching is the economy: ladle once, serve three tickets faster.
HH.prep = {
  batches: HH.STOCK_BATCHES,
  refillT: 0,

  reset: function () {
    this.batches = HH.STOCK_BATCHES;
    this.refillT = 0;
  },

  update: function (dt) {
    if (G.state !== 'play' || G.shotMode) return;
    if (this.batches <= 0) {
      this.refillT += dt;
      if (this.refillT >= HH.STOCK_REFILL_SECONDS) {
        this.batches = HH.STOCK_BATCHES;
        this.refillT = 0;
        G.hint = 'Stock pot refilled — ×3 again!';
        G.hintT = 2;
      }
    }
  },

  // Take one ladle for a cooked dish. False when the pot is empty.
  useBatch: function () {
    if (this.batches <= 0) return false;
    this.batches--;
    if (this.batches === 0) this.refillT = 0;
    return true;
  },
};
