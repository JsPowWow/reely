import { createElement } from '../index';

describe('createElement: properties and attributes', () => {
  it('sets string props as attributes', () => {
    const element = createElement('div', { id: 'board', title: 'Race' });

    expect(element.getAttribute('id')).toBe('board');
    expect(element.getAttribute('title')).toBe('Race');
  });

  it('maps DOM property names to attribute names', () => {
    const label = createElement('label', { className: 'row', htmlFor: 'name-input' });
    const input = createElement('input', { tabIndex: 2 });

    expect(label.outerHTML).toBe('<label class="row" for="name-input"></label>');
    expect(input.getAttribute('tabindex')).toBe('2');
  });

  it('sets a boolean attribute when true and omits it when false', () => {
    const enabled = createElement('button', { disabled: false });
    const disabled = createElement('button', { disabled: true });

    expect(enabled.hasAttribute('disabled')).toBe(false);
    expect(disabled.getAttribute('disabled')).toBe('');
    expect(disabled.disabled).toBe(true);
  });

  describe('live state', () => {
    it('sets `value` as a property', () => {
      const textarea = createElement('textarea', { value: 'draft' });

      expect(textarea.value).toBe('draft');
    });

    it('sets `indeterminate`, which has no attribute', () => {
      const input = createElement('input', { type: 'checkbox', indeterminate: true });

      expect(input.indeterminate).toBe(true);
      expect(input.hasAttribute('indeterminate')).toBe(false);
    });
  });

  it('sets `data-*` attributes', () => {
    const element = createElement('li', { 'data-racer': 'bolt' });

    expect(element.dataset['racer']).toBe('bolt');
  });

  it('assigns `styles` to the inline style', () => {
    const element = createElement('div', { styles: { color: 'red', marginTop: '4px' } });

    expect(element.style.color).toBe('red');
    expect(element.style.marginTop).toBe('4px');
    expect(element.hasAttribute('styles')).toBe(false);
  });

  it('renders `aria` props as `role` and `aria-*` attributes', () => {
    const element = createElement('a', { aria: { role: 'status', ariaCurrent: 'step', ariaLabel: 'Step 1' } });

    expect(element.getAttribute('role')).toBe('status');
    expect(element.getAttribute('aria-current')).toBe('step');
    expect(element.getAttribute('aria-label')).toBe('Step 1');
    expect(element.hasAttribute('aria')).toBe(false);
  });

  it('does not render `children` or `eventsAbortSignal` as attributes', () => {
    const element = createElement('div', {
      children: 'text',
      eventsAbortSignal: new AbortController().signal,
    });

    expect(element.attributes).toHaveLength(0);
  });
});
