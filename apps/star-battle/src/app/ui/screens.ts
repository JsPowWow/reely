import { SFX } from '../game/audio';
import { SHIP_DEFS } from '../game/entities/ship';

export const sel = [0, 1];

export function initScreens(onStart: () => void) {
  const sg = document.getElementById('sg')!;
  sg.innerHTML = '';
  for (let i = 0; i < SHIP_DEFS.length; i++) {
    const s = SHIP_DEFS[i];
    const card = document.createElement('div');
    card.className = 'sk';
    const pc = document.createElement('canvas');
    pc.width = 72;
    pc.height = 52;
    const pctx = pc.getContext('2d')!;
    pctx.translate(36, 26);
    s.draw(pctx, 0, 0, 0, s.color, 1.1, 0);
    card.appendChild(pc);
    const nm = document.createElement('div');
    nm.className = 'kn';
    nm.textContent = s.name;
    card.appendChild(nm);
    const st = document.createElement('div');
    st.className = 'ks';
    st.textContent = s.stats;
    card.appendChild(st);

    card.addEventListener('click', () => {
      sel[0] = i;
      SFX.select();
      updateBadges();
    });
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      sel[1] = i;
      SFX.select();
      updateBadges();
    });
    let tc = 0;
    card.addEventListener('touchend', (e) => {
      e.preventDefault();
      tc++;
      if (tc % 2 === 1) sel[0] = i;
      else sel[1] = i;
      SFX.select();
      updateBadges();
    });
    sg.appendChild(card);
  }
  updateBadges();

  document.getElementById('start-btn')!.addEventListener('click', () => {
    SFX.start();
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    document.getElementById('sel-sc')!.classList.add('h');
    document.getElementById('kref')!.classList.add('vis');
    setTimeout(() => {
      document.getElementById('kref')!.classList.remove('vis');
    }, 6000);
    onStart();
  });

  document.getElementById('rematch-btn')!.addEventListener('click', () => {
    document.getElementById('win-sc')!.classList.add('h');
    document.getElementById('sel-sc')!.classList.remove('h');
    document.getElementById('kref')!.classList.remove('vis');
  });
}

export function updateBadges() {
  const cards = document.querySelectorAll('.sk');
  for (let i = 0; i < cards.length; i++) {
    cards[i].classList.remove('p1', 'p2');
    const old = cards[i].querySelectorAll('.kb');
    for (let j = 0; j < old.length; j++) old[j].parentNode!.removeChild(old[j]);
    if (sel[0] === i) {
      cards[i].classList.add('p1');
      const b = document.createElement('span');
      b.className = 'kb kb1';
      b.textContent = 'P1';
      cards[i].appendChild(b);
    }
    if (sel[1] === i) {
      cards[i].classList.add('p2');
      const b2 = document.createElement('span');
      b2.className = 'kb kb2';
      b2.textContent = 'P2';
      cards[i].appendChild(b2);
    }
  }
}

export function showWinScreen(wt: string, ws: string, wc: string) {
  const wtEl = document.getElementById('wt')!;
  const wsEl = document.getElementById('ws')!;
  wtEl.textContent = wt;
  wtEl.className = 'wt ' + wc;
  wsEl.textContent = ws;
  setTimeout(() => {
    SFX.win();
    document.getElementById('win-sc')!.classList.remove('h');
  }, 1400);
}
