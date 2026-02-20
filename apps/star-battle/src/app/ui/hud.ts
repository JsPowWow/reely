export function updateHUD(game: any) {
  if (!game) return;
  const p0 = game.p[0],
    p1 = game.p[1];
  const p1h = document.getElementById('p1h');
  const p2h = document.getElementById('p2h');
  const p1e = document.getElementById('p1e');
  const p2e = document.getElementById('p2e');

  if (p1h) p1h.style.width = Math.max(0, (p0.hp / p0.maxHp) * 100) + '%';
  if (p2h) p2h.style.width = Math.max(0, (p1.hp / p1.maxHp) * 100) + '%';
  if (p1e) p1e.style.width = (p0.energy / p0.maxEnergy) * 100 + '%';
  if (p2e) p2e.style.width = (p1.energy / p1.maxEnergy) * 100 + '%';
}
