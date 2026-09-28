import { circle, mount, path, signal, svg } from '../index';
import { reelxDebug } from './reactive/reelx/reelx.core';

import type { SvgElementFactoryProps } from '../index';

const SVG_NS = 'http://www.w3.org/2000/svg';

describe('createElement: SVG', () => {
  it('creates SVG tags in the SVG namespace, with attributes as written', () => {
    const icon = (
      <svg viewBox="0 0 24 24" className="icon">
        <path d="M0 0L24 24" stroke-width={2} fill="none" />
      </svg>
    );
    const line = icon instanceof Element ? icon.firstElementChild : null;

    expect(icon).toBeInstanceOf(SVGSVGElement);
    expect(line?.namespaceURI).toBe(SVG_NS);
    expect(icon instanceof Element && icon.outerHTML).toBe(
      '<svg viewBox="0 0 24 24" class="icon"><path d="M0 0L24 24" stroke-width="2" fill="none"></path></svg>'
    );
  });

  it('builds the same SVG with tag factories', () => {
    const icon = svg({ viewBox: '0 0 10 10' }, circle({ cx: 5, cy: 5, r: 4 }), path({ d: 'M0 0' }));

    expect(icon.namespaceURI).toBe(SVG_NS);
    expect(icon.outerHTML).toBe('<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"></circle><path d="M0 0"></path></svg>');
  });

  it('binds an attribute and updates it in place', () => {
    const color = signal('red');
    const dot = circle({ r: 4, fill: color, className: () => `dot-${color.value}` });

    color.value = 'blue';

    expect(dot.getAttribute('fill')).toBe('blue');
    expect(dot.getAttribute('class')).toBe('dot-blue');
  });

  it('removes a bound attribute when the value becomes null', () => {
    const stroke = signal<string | null>('black');
    const dot = circle({ stroke });

    stroke.value = null;

    expect(dot.hasAttribute('stroke')).toBe(false);
  });

  it('listens to handlers and applies styles on SVG elements', () => {
    const onClick = vi.fn();
    const dot = circle({ onClick, styles: { opacity: '0.5' } });

    dot.dispatchEvent(new MouseEvent('click'));

    expect(onClick).toHaveBeenCalledOnce();
    expect(dot.style.opacity).toBe('0.5');
  });

  it('never renders a string `on*` as an inline handler', () => {
    const props = { onclick: 'alert(1)', onClick: 'alert(2)' } as Record<string, unknown> as SvgElementFactoryProps<'circle'>;

    const dot = circle(props);

    expect(dot.attributes).toHaveLength(0);
  });

  it('releases its bindings when the view is disposed', () => {
    const color = signal('red');
    const dispose = mount(document.createElement('div'), () => <circle fill={color} className={() => color.value} />);
    const whileMounted = reelxDebug(color).subscriberCount();

    dispose();

    expect(whileMounted).toBe(2);
    expect(reelxDebug(color).subscriberCount()).toBe(0);
  });
});
