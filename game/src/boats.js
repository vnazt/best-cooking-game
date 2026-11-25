// boats.js — the boat itself: sea, harbour sky, deck, waves, and the people.
// The kitchen floats: the background changes with the dock, and the waves
// rock the counter during a rush.
HH.boats = {
  drawBackground: function (ctx) {
    const dock = HH.route.dock();
    // Sky.
    const sky = ctx.createLinearGradient(0, 0, 0, 220);
    sky.addColorStop(0, dock.sky);
    sky.addColorStop(1, '#fff3d6');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, HH.W, 220);
    // Sun.
    ctx.fillStyle = '#f7c948';
    ctx.beginPath(); ctx.arc(1120, 60, 34, 0, Math.PI * 2); ctx.fill();
    // Harbour skyline (different silhouette per dock).
    ctx.fillStyle = 'rgba(122,74,36,0.55)';
    const base = [40, 90, 60, 120, 70, 100, 55, 130, 65, 95, 50, 110];
    for (let i = 0; i < 12; i++) {
      const x = 20 + i * 106, h = base[(i + G.dockIndex * 3) % 12];
      ctx.fillRect(x, 220 - h, 70, h);
    }
    // Sea band with moving wave lines.
    ctx.fillStyle = dock.sea;
    ctx.fillRect(0, 150, HH.W, 70);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let x = 0; x <= HH.W; x += 20) {
        const y = 168 + i * 11 + Math.sin((x + G.animT * 60 + i * 70) * 0.02) * 3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Wooden deck under the kitchen.
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(0, 214, HH.W, 8);
    ctx.fillStyle = '#c98a4b';
    ctx.fillRect(0, 492, HH.W, 164);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let x = 0; x < HH.W; x += 64) ctx.fillRect(x, 492, 3, 164);
    // Rope rail at the bottom.
    ctx.strokeStyle = '#e8d5a8';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 660); ctx.lineTo(HH.W, 660); ctx.stroke();
  },

  // Captain Maro, the player-cook: toque, apron, always facing the counter.
  drawPlayer: function (ctx) {
    const p = G.player;
    const bob = Math.sin(G.animT * 6) * (p.moving ? 2 : 0);
    // Body / apron.
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 6 + bob, 26, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = HH.COLORS.teal;
    ctx.fillRect(p.x - 18, p.y - 6 + bob, 36, 34);
    // Head + toque.
    ctx.fillStyle = '#f2c89b';
    ctx.beginPath(); ctx.arc(p.x, p.y - 34 + bob, 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(p.x - 9, p.y - 48 + bob, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x + 9, p.y - 48 + bob, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(p.x - 16, p.y - 52 + bob, 32, 12);
    // Moustache.
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(p.x - 10, p.y - 30 + bob, 20, 4);
    // Carried dish above the head.
    if (G.carry) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 72 + bob, 24, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = G.carry.dish.plate;
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 75 + bob, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = HH.COLORS.ink;
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('stage ' + G.carry.stage + '/4', p.x, p.y - 86 + bob);
      ctx.textAlign = 'left';
    }
    // Name tag to the LEFT of the cook, clear of the hint bar below.
    ctx.fillStyle = 'rgba(22,50,79,0.85)';
    const tagX = Math.max(8, p.x - 158);
    ctx.fillRect(tagX, p.y - 8, 104, 20);
    ctx.fillStyle = '#ffe9b8';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CAPTAIN MARO', tagX + 52, p.y + 6);
    ctx.textAlign = 'left';
    // Reach ring on the nearest station (the station's own label says what E does).
    if (G.nearStation) {
      const s = HH.stations.byId(G.nearStation);
      ctx.strokeStyle = '#f7c948';
      ctx.lineWidth = 4;
      ctx.strokeRect(s.x - 4, s.y - 4, s.w + 8, s.h + 8);
    }
  },

  // Wave-rock sway during a rush: the whole kitchen sways a few pixels.
  sway: function () {
    if (G.rush > 0) return Math.sin(G.animT * 2.2) * 5;
    return Math.sin(G.animT * 0.8) * 1.5;
  },
};
