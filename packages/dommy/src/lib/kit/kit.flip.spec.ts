import { flip } from '../../kit';

const place = (element: Element, top: number): void => {
  element.getBoundingClientRect = () => ({ left: 0, top }) as DOMRect;
};

describe('flip', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('animates each child that moved from where it was to where it is', () => {
    const list = document.createElement('ol');
    const [first, second] = [document.createElement('li'), document.createElement('li')];
    list.append(first, second);
    place(first, 0);
    place(second, 40);
    const animations = [first, second].map((row) => (row.animate = vi.fn()));

    flip(list, () => {
      list.append(first);
      place(first, 40);
      place(second, 0);
    });

    expect(animations[0]).toHaveBeenCalledWith(
      [{ transform: 'translate(0px, -40px)' }, { transform: 'none' }],
      expect.objectContaining({ duration: 250 })
    );
    expect(animations[1]).toHaveBeenCalledWith([{ transform: 'translate(0px, 40px)' }, { transform: 'none' }], expect.anything());
  });

  it('leaves new and unmoved children still, and moves nothing under reduced motion', () => {
    const list = document.createElement('ol');
    const kept = document.createElement('li');
    list.append(kept);
    place(kept, 0);
    kept.animate = vi.fn();
    const added = document.createElement('li');
    added.animate = vi.fn();

    flip(list, () => list.append(added));
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    flip(list, () => list.prepend(added));

    expect(kept.animate).not.toHaveBeenCalled();
    expect(added.animate).not.toHaveBeenCalled();
  });
});
