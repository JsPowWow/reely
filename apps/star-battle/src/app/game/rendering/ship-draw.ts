export function drawScout(ctx: CanvasRenderingContext2D, c: string, dmg: number) {
  ctx.shadowColor = c; ctx.shadowBlur = 16;
  const eg = ctx.createRadialGradient(-13,0,1,-13,0,9);
  eg.addColorStop(0,'rgba(255,255,255,0.53)'); eg.addColorStop(0.5,c); eg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = eg; ctx.beginPath(); ctx.ellipse(-13,0,9,5,0,0,Math.PI*2); ctx.fill();
  const fg = ctx.createLinearGradient(0,-8,0,8);
  fg.addColorStop(0,'rgba(255,255,255,0.22)'); fg.addColorStop(0.35,c); fg.addColorStop(1,'rgba(0,0,0,0.3)');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.moveTo(22,0); ctx.lineTo(8,5); ctx.lineTo(-4,6); ctx.lineTo(-14,4);
  ctx.lineTo(-14,-4); ctx.lineTo(-4,-6); ctx.lineTo(8,-5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.moveTo(18,0); ctx.lineTo(6,2); ctx.lineTo(-4,2.5); ctx.lineTo(-4,-2.5); ctx.lineTo(6,-2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c + '77';
  ctx.beginPath(); ctx.moveTo(4,5); ctx.lineTo(-6,15); ctx.lineTo(-12,10); ctx.lineTo(-6,6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(4,-5); ctx.lineTo(-6,-15); ctx.lineTo(-12,-10); ctx.lineTo(-6,-6); ctx.closePath(); ctx.fill();
  const cg = ctx.createRadialGradient(12,-1,0,12,-1,5);
  cg.addColorStop(0,'#aaffff'); cg.addColorStop(0.5,'#004466'); cg.addColorStop(1,'#001122');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(12,0,5,3.5,0,0,Math.PI*2); ctx.fill();
  if (dmg > 0.25) {
    ctx.strokeStyle = 'rgba(255,90,0,' + ((dmg-0.25)*1.3) + ')'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(2,3); ctx.lineTo(-4,7); ctx.stroke();
  }
  if (dmg > 0.55) {
    ctx.fillStyle = 'rgba(255,40,0,' + ((dmg-0.55)*1.5) + ')';
    ctx.beginPath(); ctx.arc(-5,4,3,0,Math.PI*2); ctx.fill();
  }
  if (dmg > 0.8) {
    ctx.fillStyle = 'rgba(255,150,0,' + ((dmg-0.8)*3) + ')';
    ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2); ctx.fill();
  }
}

export function drawTank(ctx: CanvasRenderingContext2D, c: string, dmg: number) {
  ctx.shadowColor = c; ctx.shadowBlur = 22;
  let i;
  for (i = -1; i <= 1; i += 2) {
    const eg = ctx.createRadialGradient(-17,i*7,1,-17,i*7,8);
    eg.addColorStop(0,'rgba(255,255,255,0.6)'); eg.addColorStop(0.5,c); eg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = eg; ctx.beginPath(); ctx.ellipse(-17,i*7,8,5,0,0,Math.PI*2); ctx.fill();
  }
  const hg = ctx.createLinearGradient(0,-14,0,14);
  hg.addColorStop(0,'rgba(255,255,255,0.18)'); hg.addColorStop(0.2,c); hg.addColorStop(0.8,c+'88'); hg.addColorStop(1,'rgba(0,0,0,0.6)');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.moveTo(18,4); ctx.lineTo(8,12); ctx.lineTo(-16,12);
  ctx.lineTo(-20,8); ctx.lineTo(-20,-8); ctx.lineTo(-16,-12); ctx.lineTo(8,-12); ctx.lineTo(18,-4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.moveTo(14,4); ctx.lineTo(6,10); ctx.lineTo(-10,10); ctx.lineTo(-10,4); ctx.closePath(); ctx.fill();
  const bolts = [[-14,10],[-14,-10],[-6,12],[-6,-12],[4,12],[4,-12]];
  ctx.fillStyle = c;
  for (i = 0; i < bolts.length; i++) {
    ctx.beginPath(); ctx.arc(bolts[i][0],bolts[i][1],1.8,0,Math.PI*2); ctx.fill();
  }
  const bg = ctx.createLinearGradient(0,-3.5,0,3.5);
  bg.addColorStop(0,'rgba(255,255,255,0.28)'); bg.addColorStop(1,'rgba(0,0,0,0.55)');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.rect(16,-3.5,11,7); ctx.fill();
  ctx.fillStyle = c; ctx.beginPath(); ctx.rect(27,-4,3,8); ctx.fill();
  const cg = ctx.createRadialGradient(8,-1,0,8,-1,6);
  cg.addColorStop(0,'#88ddff'); cg.addColorStop(0.4,'#002244'); cg.addColorStop(1,'#000811');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(8,0,6,5,0,0,Math.PI*2); ctx.fill();
  if (dmg > 0.2) {
    ctx.strokeStyle = 'rgba(255,60,0,' + ((dmg-0.2)*1.4) + ')'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-5,9); ctx.lineTo(2,5); ctx.lineTo(-1,1); ctx.stroke();
  }
  if (dmg > 0.5) {
    ctx.fillStyle = 'rgba(255,30,0,' + ((dmg-0.5)*1.5) + ')';
    ctx.beginPath(); ctx.arc(-8,9,4.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(-2,-8,3.5,0,Math.PI*2); ctx.fill();
  }
  if (dmg > 0.75) {
    ctx.fillStyle = 'rgba(255,130,0,' + ((dmg-0.75)*2.5) + ')';
    ctx.beginPath(); ctx.arc(3,5,3,0,Math.PI*2); ctx.fill();
  }
}

export function drawSniper(ctx: CanvasRenderingContext2D, c: string, dmg: number) {
  ctx.shadowColor = c; ctx.shadowBlur = 14;
  const eg = ctx.createRadialGradient(-11,0,1,-11,0,7);
  eg.addColorStop(0,'rgba(255,255,255,0.47)'); eg.addColorStop(0.5,c); eg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = eg; ctx.beginPath(); ctx.ellipse(-11,0,7,4,0,0,Math.PI*2); ctx.fill();
  const fg = ctx.createLinearGradient(0,-6,0,6);
  fg.addColorStop(0,'rgba(255,255,255,0.22)'); fg.addColorStop(0.3,c); fg.addColorStop(1,'rgba(0,0,0,0.3)');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.moveTo(20,0); ctx.lineTo(6,5); ctx.lineTo(-10,5);
  ctx.lineTo(-14,3); ctx.lineTo(-14,-3); ctx.lineTo(-10,-5); ctx.lineTo(6,-5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(4,1.5); ctx.lineTo(-8,1.5); ctx.lineTo(-8,-1.5); ctx.lineTo(4,-1.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.rect(18,-2,16,4); ctx.fill();
  ctx.strokeStyle = c; ctx.lineWidth = 0.9; ctx.stroke();
  ctx.fillStyle = c; ctx.beginPath(); ctx.rect(33,-2.5,3,5); ctx.fill();
  ctx.fillStyle = c + '66';
  ctx.beginPath(); ctx.moveTo(-2,5); ctx.lineTo(-10,11); ctx.lineTo(-13,7); ctx.lineTo(-8,5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2,-5); ctx.lineTo(-10,-11); ctx.lineTo(-13,-7); ctx.lineTo(-8,-5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c + '99'; ctx.beginPath(); ctx.rect(5,-9,9,6); ctx.fill();
  ctx.fillStyle = '#001133'; ctx.beginPath(); ctx.rect(6,-8.5,7,5); ctx.fill();
  ctx.fillStyle = '#00ddff'; ctx.beginPath(); ctx.arc(9.5,-6,2,0,Math.PI*2); ctx.fill();
  const cg = ctx.createRadialGradient(10,-1,0,10,-1,4);
  cg.addColorStop(0,'#aaffee'); cg.addColorStop(0.5,'#003344'); cg.addColorStop(1,'#000d1a');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(10,0,4,3,0,0,Math.PI*2); ctx.fill();
  if (dmg > 0.3) {
    ctx.strokeStyle = 'rgba(200,100,0,' + ((dmg-0.3)*1.4) + ')'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(5,3); ctx.lineTo(0,5); ctx.stroke();
  }
  if (dmg > 0.6) {
    ctx.fillStyle = 'rgba(255,50,0,' + ((dmg-0.6)*1.6) + ')';
    ctx.beginPath(); ctx.arc(-4,4,3.5,0,Math.PI*2); ctx.fill();
  }
}

export function drawBomber(ctx: CanvasRenderingContext2D, c: string, dmg: number) {
  ctx.shadowColor = c; ctx.shadowBlur = 18;
  const offsets = [-8, 0, 8];
  for (let i = 0; i < offsets.length; i++) {
    const eg = ctx.createRadialGradient(-18,offsets[i],1,-18,offsets[i],6);
    eg.addColorStop(0,'rgba(255,255,255,0.53)'); eg.addColorStop(0.5,c); eg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = eg; ctx.beginPath(); ctx.ellipse(-18,offsets[i],6,4,0,0,Math.PI*2); ctx.fill();
  }
  const hg = ctx.createLinearGradient(0,-16,0,16);
  hg.addColorStop(0,'rgba(255,255,255,0.16)'); hg.addColorStop(0.25,c); hg.addColorStop(0.75,c+'77'); hg.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(6,14); ctx.lineTo(-10,16);
  ctx.lineTo(-18,10); ctx.lineTo(-18,-10); ctx.lineTo(-10,-16); ctx.lineTo(6,-14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(4,10); ctx.lineTo(-8,11); ctx.lineTo(-8,-11); ctx.lineTo(4,-10); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = c + '44'; ctx.lineWidth = 0.9;
  const blines = [-8,-3,2,7];
  for (let i = 0; i < blines.length; i++) {
    ctx.beginPath(); ctx.moveTo(blines[i],-13); ctx.lineTo(blines[i],13); ctx.stroke();
  }
  const cg = ctx.createRadialGradient(6,-2,0,6,-2,7);
  cg.addColorStop(0,'#bbeecc'); cg.addColorStop(0.4,'#004422'); cg.addColorStop(1,'#001108');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(6,0,7,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ff3333'; ctx.beginPath(); ctx.arc(-12,14,2.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#33ff44'; ctx.beginPath(); ctx.arc(-12,-14,2.2,0,Math.PI*2); ctx.fill();
  if (dmg > 0.25) {
    ctx.strokeStyle = 'rgba(255,80,0,' + ((dmg-0.25)*1.3) + ')'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-5,12); ctx.lineTo(2,8); ctx.lineTo(-3,4); ctx.stroke();
  }
  if (dmg > 0.5) {
    ctx.fillStyle = 'rgba(255,40,0,' + ((dmg-0.5)*1.6) + ')';
    const bpts = [[-6,10],[0,-9],[-14,6]];
    for (let i = 0; i < bpts.length; i++) {
      ctx.beginPath(); ctx.arc(bpts[i][0],bpts[i][1],3.5,0,Math.PI*2); ctx.fill();
    }
  }
}

export function drawGhost(ctx: CanvasRenderingContext2D, c: string, dmg: number) {
  ctx.shadowColor = c; ctx.shadowBlur = 20;
  const tg = ctx.createLinearGradient(-22,0,0,0);
  tg.addColorStop(0,'rgba(0,0,0,0)'); tg.addColorStop(1,c+'44');
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-22,8); ctx.lineTo(-16,0); ctx.lineTo(-22,-8); ctx.closePath(); ctx.fill();
  const fg = ctx.createLinearGradient(0,-10,0,10);
  fg.addColorStop(0,'rgba(255,255,255,0.26)'); fg.addColorStop(0.3,c); fg.addColorStop(1,'rgba(0,0,0,0.3)');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.moveTo(22,0); ctx.lineTo(4,5); ctx.lineTo(-8,5);
  ctx.lineTo(-12,0); ctx.lineTo(-8,-5); ctx.lineTo(4,-5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c + '66';
  ctx.beginPath(); ctx.moveTo(2,5); ctx.lineTo(-14,17); ctx.lineTo(-16,9); ctx.lineTo(-4,5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(2,-5); ctx.lineTo(-14,-17); ctx.lineTo(-16,-9); ctx.lineTo(-4,-5); ctx.closePath(); ctx.fill();
  const cg = ctx.createRadialGradient(10,0,0,10,0,5);
  cg.addColorStop(0,c+'88'); cg.addColorStop(0.6,'#001122'); cg.addColorStop(1,'#000000');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(10,0,5,3,0,0,Math.PI*2); ctx.fill();
  if (dmg > 0.3) {
    ctx.strokeStyle = 'rgba(180,100,255,' + ((dmg-0.3)*1.2) + ')'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(4,3); ctx.lineTo(-2,6); ctx.stroke();
  }
  if (dmg > 0.6) {
    ctx.fillStyle = 'rgba(180,0,255,' + ((dmg-0.6)*1.5) + ')';
    ctx.beginPath(); ctx.arc(-6,4,3.5,0,Math.PI*2); ctx.fill();
  }
}

export function drawOrb(ctx: CanvasRenderingContext2D, c: string, dmg: number) {
  const t = Date.now();
  ctx.shadowColor = c; ctx.shadowBlur = 24;
  const rg = ctx.createRadialGradient(0,0,10,0,0,19);
  rg.addColorStop(0,'rgba(0,0,0,0)'); rg.addColorStop(0.55,c+'33'); rg.addColorStop(0.85,c); rg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0,0,19,0,Math.PI*2); ctx.fill();
  ctx.save(); ctx.rotate(t/900);
  ctx.strokeStyle = c+'66'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0,0,16,6,0,0,Math.PI*2); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.rotate(-t/650);
  ctx.strokeStyle = c+'44'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0,0,13,8,Math.PI/4,0,Math.PI*2); ctx.stroke();
  ctx.restore();
  const sg = ctx.createRadialGradient(-5,-5,1,0,0,14);
  sg.addColorStop(0,'rgba(255,255,255,0.6)'); sg.addColorStop(0.15,c); sg.addColorStop(0.6,c+'88'); sg.addColorStop(1,'rgba(0,0,0,0.65)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0,0,14,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.beginPath(); ctx.ellipse(-4,-4,4.5,3,Math.PI/4,0,Math.PI*2); ctx.fill();
  const ng = ctx.createLinearGradient(10,0,20,0);
  ng.addColorStop(0,c); ng.addColorStop(1,c+'33');
  ctx.fillStyle = ng; ctx.beginPath(); ctx.rect(12,-2.5,9,5); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(21,0,2.8,0,Math.PI*2); ctx.fill();
  if (dmg > 0.3) {
    ctx.strokeStyle = 'rgba(255,80,0,' + ((dmg-0.3)*1.6) + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0,0,11,0.4,2.0); ctx.stroke();
  }
  if (dmg > 0.6) {
    ctx.fillStyle = 'rgba(255,40,0,' + ((dmg-0.6)*1.8) + ')';
    ctx.beginPath(); ctx.arc(5,6,4.5,0,Math.PI*2); ctx.fill();
  }
}
