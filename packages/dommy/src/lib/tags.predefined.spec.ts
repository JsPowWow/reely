import { div, li, span, ul } from '../index';

describe('tag factories', () => {
  it('create an element of their tag', () => {
    expect(div().outerHTML).toBe('<div></div>');
    expect(span().outerHTML).toBe('<span></span>');
  });

  it('take props first and children after', () => {
    const element = div({ id: 'board' }, 'a', 'b');

    expect(element.outerHTML).toBe('<div id="board">ab</div>');
  });

  it('treat a primitive first argument as a child', () => {
    expect(div('hello', ' world').textContent).toBe('hello world');
    expect(div(0).textContent).toBe('0');
  });

  it('treat a node first argument as a child', () => {
    const child = span();

    const element = div(child, 'tail');

    expect(element.firstChild).toBe(child);
    expect(element.textContent).toBe('tail');
  });

  it('compose into a tree', () => {
    const list = ul({ className: 'rows' }, li(null, 'one'), li(null, 'two'));

    expect(list.outerHTML).toBe('<ul class="rows"><li>one</li><li>two</li></ul>');
  });
});
