// hud.js — everything the judge reads at a glance: header, ticket rail,
// big timer, ingredient strip, hero banner, route strip, next-stops list.
HH.hud = {
  draw: function (ctx) {
    this.drawHeader(ctx);
    this.drawTickets(ctx);
    this.drawIngredients(ctx);
    this.drawBottom(ctx);
    if (G.rush > 0 && G.state === 'play') this.drawBanner(ctx, 'WAVE RUSH!  Orders ×2', '#e2574c');
    else if (G.streak >= 3 && G.state === 'play') this.drawBanner(ctx, 'FULL TIDE!  x' + G.streak, '#f28c4b');
    if (HH.orders.servedFlash) {
      ctx.fillStyle = '#16324f';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(HH.orders.servedFlash.text, HH.W / 2, 250);
      ctx.textAlign = 'left';
    }
    if (G.hintT > 0) {
      ctx.fillStyle = 'rgba(22,50,79,0.92)';
      ctx.fillRect(340, 596, 600, 34);
      ctx.fillStyle = '#ffe9b8';
      ctx.font = 'bold 17px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(G.hint, 640, 619);
      ctx.textAlign = 'left';
    }
  },

  drawHeader: function (ctx) {
    ctx.fillStyle = HH.COLORS.navy;
    ctx.fillRect(0, 0, HH.W, 64);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px Arial';
    ctx.fillText('HARBOUR & HONEY', 16, 30);
    ctx.fillStyle = '#f7c948';
    ctx.font = 'bold 15px Arial';
    ctx.fillText('a floating fish-market kitchen  •  Captain Maro', 16, 52);
    const dock = HH.route.dock();
    ctx.fillStyle = '#ffe9b8';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚓ ' + dock.name + '  •  LEG ' + (G.dockIndex + 1) + '/3', 640, 32);
    ctx.font = '15px Arial';
    ctx.fillText('dock clock ' + Math.ceil(HH.route.dockTime) + 's  •  served here ' + HH.route.legServed + '/4', 640, 54);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('$' + G.coins + '   •   ' + G.served + ' served   •   streak x' + G.streak, HH.W - 16, 32);
    ctx.font = '15px Arial';
    ctx.fillStyle = '#f7c948';
    ctx.fillText('best streak x' + G.bestStreak + '   •   walkouts ' + G.walkouts, HH.W - 16, 54);
    ctx.textAlign = 'left';
  },

  drawTickets: function (ctx) {
    const y = 72, h = 78, w = 196, gap = 8;
    for (let i = 0; i < HH.MAX_TICKETS; i++) {
      const x = 12 + i * (w + gap);
      const t = HH.orders.list[i];
      if (!t) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = 'rgba(58,42,26,0.55)';
        ctx.font = 'bold 15px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('— empty —', x + w / 2, y + 44);
        ctx.textAlign = 'left';
        continue;
      }
      const sel = G.selectedId === t.id || (!G.selectedId && i === 0);
      ctx.fillStyle = t.catch ? '#fff0c0' : '#fffaf0';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = sel ? '#e2574c' : (t.catch ? '#d9a441' : '#c9b183');
      ctx.lineWidth = sel ? 4 : 2;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = t.catch ? '#8a5a2b' : HH.COLORS.tomato;
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(Math.ceil(t.timeLeft) + 's', x + w - 10, y + 18);
      ctx.textAlign = 'left';
      const head = t.catch
        ? '★ CATCH · ' + t.customer.name.toUpperCase()
        : t.customer.name.toUpperCase() + ' · ' + t.customer.mood.toUpperCase();
      ctx.fillText(head, x + 8, y + 18, w - 56);
      ctx.fillStyle = HH.COLORS.ink;
      ctx.font = 'bold 16px Arial';
      ctx.fillText(t.dish.name, x + 8, y + 40);
      // Step dots: 4 dots + price.
      const stage = HH.orders.stageOf(t);
      for (let d = 0; d < 4; d++) {
        ctx.fillStyle = d < stage ? HH.COLORS.green : '#d9c9a8';
        ctx.beginPath(); ctx.arc(x + 16 + d * 20, y + 58, 7, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = HH.COLORS.ink;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('$' + t.dish.price, x + w - 10, y + 62);
      ctx.textAlign = 'left';
      // Time bar.
      const frac = Math.max(0, t.timeLeft / t.maxTime);
      ctx.fillStyle = '#e5d5ae';
      ctx.fillRect(x, y + h - 8, w, 8);
      ctx.fillStyle = frac > 0.35 ? HH.COLORS.green : HH.COLORS.tomato;
      ctx.fillRect(x, y + h - 8, w * frac, 8);
    }
    // The BIG timer: the number the whole kitchen feels.
    const tx = 12 + HH.MAX_TICKETS * (w + gap);
    ctx.fillStyle = '#16324f';
    ctx.fillRect(tx, y, HH.W - tx - 12, h);
    ctx.fillStyle = '#f7c948';
    ctx.font = 'bold 44px Arial';
    ctx.textAlign = 'center';
    const mm = Math.floor(G.timeLeft / 60), ss = Math.floor(G.timeLeft % 60);
    ctx.fillText(mm + ':' + String(ss).padStart(2, '0'), tx + (HH.W - tx - 12) / 2, y + 48);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Arial';
    ctx.fillText('SHIFT TIMER', tx + (HH.W - tx - 12) / 2, y + 68);
    ctx.textAlign = 'left';
  },

  drawIngredients: function (ctx) {
    const y = 158;
    ctx.fillStyle = 'rgba(22,50,79,0.85)';
    ctx.fillRect(12, y, HH.W - 24, 52);
    ctx.fillStyle = '#ffe9b8';
    ctx.font = 'bold 15px Arial';
    ctx.fillText('PANTRY:', 24, y + 32);
    const colors = { Fish: '#7ec8e3', Prawns: '#ff9a7a', Crab: '#e07840', Rice: '#f2e394', Herbs: '#7dc383', Honey: '#f7c948', Lemon: '#f2e394', Chilli: '#e2574c' };
    for (let i = 0; i < HH.INGREDIENTS.length; i++) {
      const x = 108 + i * 102;
      ctx.fillStyle = colors[HH.INGREDIENTS[i]] || '#fff';
      ctx.beginPath(); ctx.ellipse(x + 14, y + 26, 15, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px Arial';
      ctx.fillText(HH.INGREDIENTS[i], x + 36, y + 31);
    }
    const dock = HH.route.dock();
    ctx.fillStyle = HH.COLORS.gold;
    ctx.fillRect(940, y + 8, 316, 36);
    ctx.fillStyle = HH.COLORS.ink;
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('★ CATCH: ' + HH.DISHES[dock.catch].name.toUpperCase(), 1098, y + 31);
    ctx.textAlign = 'left';
  },

  drawBanner: function (ctx, text, color) {
    const w = 560, x = (HH.W - w) / 2, y = 300;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, 56);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 4, y + 4, w - 8, 48);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, HH.W / 2, y + 39);
    ctx.textAlign = 'left';
  },

  drawBottom: function (ctx) {
    const y = 656;
    ctx.fillStyle = 'rgba(22,50,79,0.92)';
    ctx.fillRect(12, y, HH.W - 24, 132);
    // Dotted route across the three docks.
    ctx.fillStyle = '#ffe9b8';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('ROUTE — the boat sails as you serve:', 28, y + 26);
    const x0 = 60, x1 = 560, yy = y + 78;
    ctx.strokeStyle = '#f7c948';
    ctx.lineWidth = 3;
    ctx.setLineDash([2, 10]);
    ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < 3; i++) {
      const x = x0 + (x1 - x0) * (i / 2);
      ctx.fillStyle = i <= G.dockIndex ? HH.COLORS.gold : 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.arc(x, yy, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = HH.COLORS.ink;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), x, yy + 5);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(HH.DOCKS[i].name, x, yy + 38);
      ctx.textAlign = 'left';
    }
    // Boat marker.
    const bt = HH.route.boatT();
    const bx = x0 + (x1 - x0) * (bt / 2);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(bx, yy - 46); ctx.lineTo(bx - 18, yy - 22); ctx.lineTo(bx + 18, yy - 22);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = HH.COLORS.tomato;
    ctx.fillRect(bx - 3, yy - 62, 6, 18);
    // Next-stops list (right half).
    const t = HH.orders.selected();
    ctx.fillStyle = '#ffe9b8';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(t ? 'NEXT STOPS — ' + t.customer.name.toUpperCase() + ': ' + t.dish.name.toUpperCase() : 'NEXT STOPS — waiting for an order…', 620, y + 26);
    if (t) {
      const rows = HH.route.nextStops(t);
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        ctx.fillStyle = r.done ? '#7dc383' : (r.now ? '#f7c948' : '#fff');
        ctx.font = (r.now ? 'bold ' : '') + '16px Arial';
        ctx.fillText((r.done ? '✓ ' : r.now ? '► ' : '· ') + r.n + '. ' + r.text, 620, y + 52 + i * 20);
      }
    }
  },

  drawOverlay: function (ctx, title, lines, foot) {
    ctx.fillStyle = 'rgba(22,50,79,0.88)';
    ctx.fillRect(0, 0, HH.W, HH.H);
    ctx.fillStyle = '#f7c948';
    ctx.font = 'bold 54px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, HH.W / 2, 250);
    ctx.fillStyle = '#fff';
    ctx.font = '22px Arial';
    let y = 310;
    for (const ln of lines) { ctx.fillText(ln, HH.W / 2, y); y += 36; }
    ctx.fillStyle = '#ffe9b8';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(foot, HH.W / 2, y + 30);
    ctx.textAlign = 'left';
  },
};
