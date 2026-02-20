export const keys: Record<string, boolean> = {};
export const codes: Record<string, boolean> = {};

export const GAME_CODES: Record<string, number> = {
  KeyW: 1,
  KeyA: 1,
  KeyS: 1,
  KeyD: 1,
  Space: 1,
  KeyE: 1,
  KeyF: 1,
  KeyG: 1,
};

export const GAME_KEYS: Record<string, number> = {
  ArrowUp: 1,
  ArrowDown: 1,
  ArrowLeft: 1,
  ArrowRight: 1,
  Enter: 1,
  Shift: 1,
  ',': 1,
  '.': 1,
};

export const joy = [
  { dx: 0, dy: 0, active: false, id: -1 },
  { dx: 0, dy: 0, active: false, id: -1 },
];

export const btnFire = [false, false];
export const btnSpec = [false, false];

export function initInput() {
  document.addEventListener(
    'keydown',
    (e) => {
      keys[e.key] = true;
      codes[e.code] = true;
      if (GAME_CODES[e.code] || GAME_KEYS[e.key]) e.preventDefault();
    },
    true
  );

  document.addEventListener(
    'keyup',
    (e) => {
      keys[e.key] = false;
      codes[e.code] = false;
    },
    true
  );

  window.addEventListener('blur', () => {
    for (const k in keys) keys[k] = false;
    for (const c in codes) codes[c] = false;
  });

  setupJoy('joy1', 'jk1', 0);
  setupJoy('joy2', 'jk2', 1);
  setupBtn('b1f', 0, 'f');
  setupBtn('b1s', 0, 's');
  setupBtn('b2f', 1, 'f');
  setupBtn('b2s', 1, 's');
}

function setupJoy(elId: string, knobId: string, ji: number) {
  const el = document.getElementById(elId);
  const kn = document.getElementById(knobId);
  if (!el || !kn) return;
  const R = 45;

  function gp(t: Touch) {
    const r = el!.getBoundingClientRect();
    return { x: t.clientX - r.left - r.width / 2, y: t.clientY - r.top - r.height / 2 };
  }

  el.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      joy[ji].id = t.identifier;
      joy[ji].active = true;
    },
    { passive: false }
  );

  el.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault();
      for (let k = 0; k < e.changedTouches.length; k++) {
        const t = e.changedTouches[k];
        if (t.identifier === joy[ji].id) {
          const p = gp(t),
            d = Math.sqrt(p.x * p.x + p.y * p.y),
            c = d > R ? R / d : 1;
          joy[ji].dx = (p.x * c) / R;
          joy[ji].dy = (p.y * c) / R;
          kn.style.transform = `translate(calc(-50% + ${p.x * c}px),calc(-50% + ${p.y * c}px))`;
        }
      }
    },
    { passive: false }
  );

  const end = (e: TouchEvent) => {
    for (let k = 0; k < e.changedTouches.length; k++) {
      if (e.changedTouches[k].identifier === joy[ji].id) {
        joy[ji].dx = 0;
        joy[ji].dy = 0;
        joy[ji].active = false;
        kn.style.transform = 'translate(-50%,-50%)';
      }
    }
  };

  el.addEventListener('touchend', end, { passive: false });
  el.addEventListener('touchcancel', end, { passive: false });
}

function setupBtn(id: string, pi: number, type: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      if (type === 'f') btnFire[pi] = true;
      else btnSpec[pi] = true;
    },
    { passive: false }
  );
  el.addEventListener(
    'touchend',
    (e) => {
      e.preventDefault();
      if (type === 'f') btnFire[pi] = false;
      else btnSpec[pi] = false;
    },
    { passive: false }
  );
  el.addEventListener('mousedown', () => {
    if (type === 'f') btnFire[pi] = true;
    else btnSpec[pi] = true;
  });
  el.addEventListener('mouseup', () => {
    if (type === 'f') btnFire[pi] = false;
    else btnSpec[pi] = false;
  });
}
