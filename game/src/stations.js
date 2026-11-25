// stations.js — the five galley stations and what E does at each.
// One carried dish travels pantry -> chop -> stove -> stock -> pass.
HH.stations = {
  // y 222..492 counter row; walkway below at y 500..648.
  list: [
    { id: 'pantry', name: 'PANTRY', sub: 'Sari the fishmonger', x: 24,  y: 222, w: 190, h: 270 },
    { id: 'chop',   name: 'CHOP',   sub: 'hold E to chop',      x: 244, y: 222, w: 190, h: 270 },
    { id: 'stove',  name: 'STOVE',  sub: 'hold E to cook',      x: 464, y: 222, w: 190, h: 270 },
    { id: 'stock',  name: 'STOCK POT', sub: 'shared prep ×3',   x: 684, y: 222, w: 190, h: 270 },
    { id: 'pass',   name: 'THE PASS', sub: 'ring the bell',     x: 904, y: 222, w: 352, h: 270 },
  ],

  byId: function (id) {
    for (const s of this.list) if (s.id === id) return s;
    return null;
  },

  // Nearest station to the cook (within reach).
  nearest: function (px, py) {
    let best = null, bd = 1e9;
    for (const s of this.list) {
      const cx = s.x + s.w / 2, cy = s.y + s.h - 10;
      const d = Math.hypot(px - cx, py - cy);
      if (d < bd) { bd = d; best = s; }
    }
    return bd < 150 ? best : null;
  },

  // Hold-E progress for chop / cook. Returns true while working.
  workT: 0,
  workStation: null,

  interact: function (dt, eHeld, ePressed) {
    const st = this.nearest(G.player.x, G.player.y);
    G.nearStation = st ? st.id : null;
    if (!st) { this.workT = 0; this.workStation = null; return; }
    if (st.id === 'chop' || st.id === 'stove') {
      const need = st.id === 'chop' ? 1 : 2; // carry.stage needed
      if (eHeld && G.carry && G.carry.stage === need - 1) {
        if (this.workStation !== st.id) { this.workStation = st.id; this.workT = 0; }
        this.workT += dt;
        const need_s = st.id === 'chop' ? HH.CHOP_SECONDS : HH.COOK_SECONDS;
        G.workProgress = Math.min(1, this.workT / need_s);
        if (this.workT >= need_s) {
          G.carry.stage = need;
          G.workProgress = 0;
          this.workT = 0;
          this.workStation = null;
          G.hint = st.id === 'chop' ? 'Chopped! To the stove.' : 'Cooked! Ladle the stock.';
          G.hintT = 1.6;
        }
        return;
      }
      this.workT = 0; this.workStation = null; G.workProgress = 0;
      return;
    }
    if (!ePressed) return;
    if (st.id === 'pantry') {
      if (G.carry) { G.hint = 'Hands full! Finish this dish first.'; G.hintT = 1.6; return; }
      const t = HH.orders.selected();
      if (!t) { G.hint = 'No orders yet — wait for a ticket.'; G.hintT = 1.6; return; }
      G.carry = { ticketId: t.id, dish: t.dish, stage: 0 };
      G.selectedId = t.id;
      G.hint = 'Grabbed ' + t.dish.raw + ' for ' + t.customer.name + '. To the chop board!';
      G.hintT = 2;
    } else if (st.id === 'stock') {
      if (G.carry && G.carry.stage === 2) {
        if (HH.prep.useBatch()) {
          G.carry.stage = 3;
          G.hint = 'Stock ladled! To the pass.';
          G.hintT = 1.6;
        } else {
          G.hint = 'Stock pot is refilling…';
          G.hintT = 1.6;
        }
      } else if (G.carry) {
        G.hint = 'Cook it first — the stock goes on a cooked dish.';
        G.hintT = 1.6;
      } else {
        G.hint = 'Stock pot feeds cooked dishes. Grab an order first.';
        G.hintT = 1.6;
      }
    } else if (st.id === 'pass') {
      if (G.carry && G.carry.stage === 3) {
        const coins = HH.orders.serve(G.carry.ticketId);
        G.carry = null;
        if (coins <= 0) { G.hint = 'Too late — that ticket walked out.'; G.hintT = 2; }
      } else if (G.carry) {
        G.hint = 'Not ready yet — follow the next-stops list.';
        G.hintT = 1.6;
      } else {
        G.hint = 'The pass is for finished dishes.';
        G.hintT = 1.6;
      }
    }
  },

  // ---- drawing ----
  draw: function (ctx) {
    for (const s of this.list) this.drawOne(ctx, s);
  },

  drawOne: function (ctx, s) {
    const hot = G.nearStation === s.id;
    // Counter body.
    ctx.fillStyle = hot ? '#c98a4b' : HH.COLORS.wood;
    ctx.fillRect(s.x, s.y + 60, s.w, s.h - 60);
    ctx.fillStyle = HH.COLORS.counter;
    ctx.fillRect(s.x, s.y + 48, s.w, 22);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(s.x, s.y + 48, s.w, 5);
    // Label plate.
    ctx.fillStyle = HH.COLORS.navy;
    ctx.fillRect(s.x + 8, s.y, s.w - 16, 34);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(s.name, s.x + s.w / 2, s.y + 24);
    ctx.fillStyle = '#ffe9b8';
    ctx.font = '13px Arial';
    ctx.fillText(s.sub, s.x + s.w / 2, s.y + 46);
    ctx.textAlign = 'left';

    if (s.id === 'pantry') this.drawPantry(ctx, s);
    if (s.id === 'chop') this.drawChop(ctx, s);
    if (s.id === 'stove') this.drawStove(ctx, s);
    if (s.id === 'stock') this.drawStock(ctx, s);
    if (s.id === 'pass') this.drawPass(ctx, s);
  },

  drawPantry: function (ctx, s) {
    // Crates of fish, prawns, crab.
    const items = [['Fish', '#7ec8e3'], ['Prawns', '#ff9a7a'], ['Crab', '#e07840']];
    for (let i = 0; i < 3; i++) {
      const x = s.x + 16 + i * 58, y = s.y + 110;
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(x, y, 48, 40);
      ctx.fillStyle = items[i][1];
      ctx.beginPath();
      ctx.ellipse(x + 24, y + 16, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = HH.COLORS.ink;
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(items[i][0], x + 24, y + 58);
      ctx.textAlign = 'left';
    }
    // Sari the fishmonger behind the counter.
    ctx.fillStyle = '#e2574c';
    ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + 200, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2c89b';
    ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + 188, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = HH.COLORS.ink;
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SARI', s.x + s.w / 2, s.y + 240);
    ctx.textAlign = 'left';
  },

  drawChop: function (ctx, s) {
    // Chopping board.
    ctx.fillStyle = '#e8c98f';
    ctx.fillRect(s.x + 20, s.y + 100, 150, 70);
    ctx.strokeStyle = '#b98d4f'; ctx.lineWidth = 3;
    ctx.strokeRect(s.x + 20, s.y + 100, 150, 70);
    // Staged mid-chop: in the cover shot G.chopStage > 0 stages a chop in
    // progress on the board (fish + knife + ring) even though the carried
    // dish is further along; live play uses the real chop path only.
    const staged = G.chopStage > 0;
    const chopping = (G.carry && G.carry.stage === 0 && G.nearStation === 'chop' && G.workProgress > 0) || staged;
    if ((G.carry && G.carry.stage <= 1) || staged) {
      // Raw or chopped fish on the board.
      ctx.fillStyle = (chopping || (G.carry && G.carry.stage === 1)) ? '#9fd6a4' : '#7ec8e3';
      ctx.beginPath();
      ctx.ellipse(s.x + 95, s.y + 135, 34, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      if (G.carry && G.carry.stage === 1) {
        ctx.strokeStyle = '#5da271'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(s.x + 70, s.y + 135); ctx.lineTo(s.x + 120, s.y + 135); ctx.stroke();
      }
    }
    // Knife.
    ctx.fillStyle = '#cfd6dd';
    ctx.fillRect(s.x + 140, s.y + 96, 34, 8);
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(s.x + 174, s.y + 96, 14, 8);
    if (G.workProgress > 0 && G.nearStation === 'chop') this.ring(ctx, s.x + 95, s.y + 135, 46, G.workProgress, 'CHOP!');
    else if (staged) this.ring(ctx, s.x + 95, s.y + 125, 40, G.chopStage, 'CHOP!');
    ctx.fillStyle = HH.COLORS.ink;
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(staged ? '— chopping —' : 'CHOP!  ' + (G.carry && G.carry.stage === 0 ? '3/4' : '—'), s.x + s.w / 2, s.y + 210);
    ctx.textAlign = 'left';
  },

  drawStove: function (ctx, s) {
    // Pot on the burner with steam.
    ctx.fillStyle = '#3a3f4a';
    ctx.fillRect(s.x + 30, s.y + 150, 130, 16);
    ctx.fillStyle = '#566072';
    ctx.fillRect(s.x + 45, s.y + 104, 100, 48);
    ctx.fillStyle = '#e2574c';
    ctx.beginPath(); ctx.arc(s.x + 95, s.y + 122, 26, 0, Math.PI); ctx.fill();
    const cooking = G.carry && G.carry.stage === 1 && G.workProgress > 0;
    if (G.carry && G.carry.stage >= 1 && G.carry.stage <= 2) {
      ctx.fillStyle = '#ffb347';
      ctx.beginPath(); ctx.arc(s.x + 95, s.y + 100, 12, 0, Math.PI * 2); ctx.fill();
    }
    if (cooking || (G.carry && G.carry.stage === 1 && G.nearStation === 'stove')) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (let i = 0; i < 3; i++) {
        const yy = s.y + 88 - ((G.animT * 30 + i * 14) % 34);
        ctx.beginPath(); ctx.arc(s.x + 80 + i * 14, yy, 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Flame.
    ctx.fillStyle = '#f28c4b';
    ctx.beginPath();
    ctx.moveTo(s.x + 70, s.y + 166); ctx.quadraticCurveTo(s.x + 95, s.y + 138, s.x + 120, s.y + 166);
    ctx.fill();
    if (G.workProgress > 0 && G.nearStation === 'stove') this.ring(ctx, s.x + 95, s.y + 118, 52, G.workProgress, 'COOKING');
    ctx.fillStyle = HH.COLORS.ink;
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HOT — watch the pot', s.x + s.w / 2, s.y + 210);
    ctx.textAlign = 'left';
  },

  drawStock: function (ctx, s) {
    // The big shared-prep pot: one ladle feeds up to 3 dishes.
    ctx.fillStyle = '#2f4a5a';
    ctx.beginPath(); ctx.ellipse(s.x + 95, s.y + 130, 62, 44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.ellipse(s.x + 95, s.y + 112, 54, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(s.x + 140, s.y + 66, 6, 60);
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.arc(s.x + 143, s.y + 126, 12, 0, Math.PI * 2); ctx.fill();
    // Batch dots.
    for (let i = 0; i < HH.STOCK_BATCHES; i++) {
      ctx.fillStyle = i < HH.prep.batches ? HH.COLORS.gold : 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.arc(s.x + 55 + i * 40, s.y + 196, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = HH.COLORS.ink;
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('×' + (i + 1), s.x + 55 + i * 40, s.y + 201);
      ctx.textAlign = 'left';
    }
    ctx.fillStyle = HH.COLORS.ink;
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    // Short line: the full 'STOCK ×3 — feeds 3 dishes' (27 chars) overflowed
    // the 190px station and clipped at both edges at judge size.
    ctx.fillText(HH.prep.batches > 0 ? 'STOCK ×' + HH.prep.batches + ' — feeds 3' : 'REFILLING…', s.x + s.w / 2, s.y + 232);
    ctx.textAlign = 'left';
  },

  drawPass: function (ctx, s) {
    // Finished plates on the pass + the bell.
    const ready = G.passPlates || 0;
    for (let i = 0; i < 3; i++) {
      const x = s.x + 56 + i * 96, y = s.y + 130;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(x, y, 40, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 2; ctx.stroke();
      if (i < ready) {
        const dish = G.passDishes && G.passDishes[i];
        ctx.fillStyle = dish ? dish.plate : '#ff9a5c';
        ctx.beginPath(); ctx.ellipse(x, y - 4, 26, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('READY', x, y + 34);
        ctx.textAlign = 'left';
      }
    }
    // Bell.
    const swing = G.bellT > 0 ? Math.sin(G.bellT * 30) * 0.25 : 0;
    ctx.save();
    ctx.translate(s.x + s.w - 52, s.y + 108);
    ctx.rotate(swing);
    ctx.fillStyle = HH.COLORS.gold;
    ctx.beginPath(); ctx.arc(0, 0, 24, Math.PI, 0); ctx.fill();
    ctx.fillRect(-26, -2, 52, 6);
    ctx.restore();
    ctx.fillStyle = HH.COLORS.ink;
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RING THE BELL  [B]', s.x + s.w / 2, s.y + 210);
    ctx.textAlign = 'left';
    // Mid-assembly plate: the dish being built, 3/5 steps.
    if (G.carry && G.carry.stage >= 1) {
      ctx.fillStyle = 'rgba(22,50,79,0.9)';
      ctx.fillRect(s.x + 16, s.y + 226, s.w - 32, 34);
      ctx.fillStyle = '#ffe9b8';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PLATING ' + G.carry.stage + '/4 — ' + G.carry.dish.name.toUpperCase(), s.x + s.w / 2, s.y + 249);
      ctx.textAlign = 'left';
    }
  },

  ring: function (ctx, x, y, r, p, label) {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = HH.COLORS.gold;
    ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label + ' ' + Math.round(p * 100) + '%', x, y + r + 22);
    ctx.textAlign = 'left';
  },
};
