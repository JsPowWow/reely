import { appendTo, li, replaceChildrenOf, ul } from '../../index';

describe('appendTo / replaceChildrenOf', () => {
  it('appends nested children, as JSX may produce them', () => {
    const list = ul();

    appendTo(list)([li(null, 'one'), [li(null, 'two'), null]]);

    expect(list.outerHTML).toBe('<ul><li>one</li><li>two</li></ul>');
  });

  it('replaces all children with nested children', () => {
    const list = ul(null, li(null, 'old'));

    replaceChildrenOf(list)([li(null, 'one')], 'tail');

    expect(list.outerHTML).toBe('<ul><li>one</li>tail</ul>');
  });
});
